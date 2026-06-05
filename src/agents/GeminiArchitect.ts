import type { DashboardLayout } from './types';
import { callGeminiAPI } from './tools';

export class GeminiArchitect {
  /**
   * Analyzes maritime PRD text and converts it into a structured layout design using Gemini.
   */
  async analyzePRD(
    prdText: string,
    apiKey: string | undefined,
    log: (msg: string, type?: 'info' | 'tool_call' | 'tool_response' | 'error') => void
  ): Promise<DashboardLayout> {
    log('Starting analysis of the Maritime PRD spec...', 'info');

    if (!apiKey || apiKey.trim() === '') {
      log('Gemini error', 'error');
      throw new Error('Gemini API key is required');
    }

    log('Delegating analysis to Gemini agents...', 'info');
    try {
      const result = await this.queryGeminiAPI(prdText, apiKey, log);
      log(
        `Gemini completed analysis. Formulated dashboard layout: "${result.title}" with ${result.widgets.length} components.`,
        'info'
      );
      return result;
    } catch (err) {
      log('Gemini error', 'error');
      throw new Error(`Gemini API request failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private async queryGeminiAPI(prdText: string, apiKey: string, _log: (msg: string) => void): Promise<DashboardLayout> {
    const prompt = `You are a Senior Maritime Software Architect Agent at ThinkPalm.
Analyze the provided Product Requirements Document (PRD) text and design an interactive dashboard layout.

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

    const text = await callGeminiAPI(prompt, apiKey, true);
    const result = JSON.parse(text.trim()) as DashboardLayout;
    return result;
  }
}
