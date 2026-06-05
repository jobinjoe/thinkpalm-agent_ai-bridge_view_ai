import type { DashboardLayout } from './types';
import { callLlamaAPI } from './tools';

export class LlamaArchitect {
  async analyzePRD(
    prdText: string,
    apiKey: string | undefined,
    log: (msg: string, type?: 'info' | 'tool_call' | 'tool_response' | 'error') => void
  ): Promise<DashboardLayout> {
    log('Starting analysis of the Maritime PRD spec...', 'info');

    if (!apiKey || apiKey.trim() === '') {
      log('Llama error', 'error');
      throw new Error('Llama API key is required');
    }

    log('Delegating analysis to Llama agents...', 'info');

    try {
      const result = await this.queryLlamaAPI(prdText, apiKey);
      log(
        `Llama completed analysis. Formulated dashboard layout: "${result.title}" with ${result.widgets.length} components.`,
        'info'
      );
      return result;
    } catch (err) {
      log('Llama error', 'error');
      throw new Error(`Llama API request failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private async queryLlamaAPI(prdText: string, apiKey: string): Promise<DashboardLayout> {
    const prompt = `You are a Senior Maritime Software Architect Agent at ThinkPalm.
Analyze the provided Product Requirements Document (PRD) text and design an interactive dashboard layout.

IMPORTANT: Respond with ONLY valid JSON. Do not add any explanation or markdown.

Output a JSON object matching this schema:
{
  "title": "dashboard title",
  "description": "dashboard description",
  "columns": 3,
  "widgets": [
    {
      "id": "string",
      "type": "gauge" | "metric" | "chart" | "alert_list" | "control_panel" | "map",
      "title": "string",
      "icon": "string (name of Lucide icon, like Flame, Gauge, Compass, ShieldAlert, Droplets, Users, Map, Wind, Radio, Activity, Database, LifeBuoy, Thermometer)",
      "color": "blue" | "emerald" | "amber" | "rose" | "indigo" | "cyan",
      "size": "small" | "medium" | "large" | "full",
      "unit": "string (optional)",
      "value": "string or number (optional)",
      "threshold": number (optional),
      "options": ["string"] (optional, for control panels)
    }
  ]
}

PRD Spec:
${prdText}`;

    const text = await callLlamaAPI(prompt, apiKey, true);
    const cleanedText = text.trim().replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanedText) as DashboardLayout;

    return result;
  }
}
