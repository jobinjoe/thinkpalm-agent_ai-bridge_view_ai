import type { DashboardLayout } from './types';

export class ClaudeArchitect {
  /**
   * Analyzes maritime PRD text and converts it into a structured layout design using Claude.
   */
  async analyzePRD(
    prdText: string,
    apiKey: string | undefined,
    log: (msg: string, type?: 'info' | 'tool_call' | 'tool_response' | 'error') => void
  ): Promise<DashboardLayout> {
    log('Starting analysis of the Maritime PRD spec...', 'info');

    if (!apiKey || apiKey.trim() === '') {
      log('Claude error', 'error');
      throw new Error('Claude API key is required');
    }

    log('Delegating analysis to Claude 3.5 Sonnet...', 'info');
    try {
      const result = await this.queryClaudeAPI(prdText, apiKey, log);
      log(
        `Claude completed analysis. Formulated dashboard layout: "${result.title}" with ${result.widgets.length} components.`,
        'info'
      );
      return result;
    } catch {
      log('Claude error', 'error');
      throw new Error('Claude API request failed');
    }
  }

  private async queryClaudeAPI(prdText: string, apiKey: string, _log: (msg: string) => void): Promise<DashboardLayout> {
    const prompt = `You are a Senior Maritime Software Architect Agent at ThinkPalm.
Analyze the provided Product Requirements Document (PRD) text and design an interactive dashboard layout.

Output a JSON object matching this schema. Return ONLY raw JSON, do NOT wrap it in markdown block quotes:
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'dangerously-allow-browser': 'true'
      } as Record<string, string>,
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Claude API');
    }

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanText) as DashboardLayout;
    return result;
  }
}
