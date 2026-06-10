import type { DashboardLayout } from './types';
import { getTelemetrySchema, callLlamaWithTools } from './tools';

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

    log('Delegating analysis to Llama Architect Agent...', 'info');

    try {
      const result = await this.queryLlamaAPI(prdText, apiKey, log);
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

  private async queryLlamaAPI(
    prdText: string, 
    apiKey: string,
    log: (msg: string, type?: 'info' | 'tool_call' | 'tool_response' | 'error') => void
  ): Promise<DashboardLayout> {
    const prompt = `You are a Senior Maritime Software Architect Agent at ThinkPalm.
Analyze the provided Product Requirements Document (PRD) text and design an interactive dashboard layout.

CRITICAL INSTRUCTION: You MUST use the 'getTelemetrySchema' tool to fetch the standard sensors and metrics for the specific type of vessel mentioned in the PRD BEFORE you create the layout. Incorporate the telemetry fields returned by the tool into your dashboard widgets.

IMPORTANT: Your FINAL response must be ONLY valid JSON matching this schema. Do not add any explanation or markdown.
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

    // Define the tool for the LLM
    const tools = [
      {
        type: "function",
        function: {
          name: "getTelemetrySchema",
          description: "Gets standardized telemetry fields, sensors, and limits for a specific type of vessel.",
          parameters: {
            type: "object",
            properties: {
              vesselType: {
                type: "string",
                description: "Type of vessel, e.g., 'oil tanker', 'passenger ferry', 'cargo ship'."
              }
            },
            required: ["vesselType"]
          }
        }
      }
    ];

    // Local execution handler for the tools the LLM invokes
    const executeTool = (toolName: string, args: any) => {
      if (toolName === 'getTelemetrySchema') {
        return getTelemetrySchema(args.vesselType);
      }
      return { error: 'Unknown tool' };
    };

    // Use the native tool-calling loop!
    const text = await callLlamaWithTools(prompt, apiKey, tools, executeTool, log);
    
    // Once the loop is done, the LLM will output the final JSON.
    const cleanedText = text.trim().replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanedText) as DashboardLayout;

    return result;
  }
}
