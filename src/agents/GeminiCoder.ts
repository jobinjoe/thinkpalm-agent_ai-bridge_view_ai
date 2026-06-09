import type { DashboardLayout } from './types';


export class GeminiCoder {
  /**
   * Generates Tailwind-styled React component code from the dashboard layout using Gemini.
   */
  async generateCode(
    layout: DashboardLayout,
    apiKey: string | undefined,
    log: (msg: string, type?: 'info' | 'tool_call' | 'tool_response') => void
  ): Promise<string> {
    log('Initiating React component code generation...', 'info');
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!apiKey || apiKey.trim() === '') {
      throw new Error("Gemini API key is required to run the agent.");
    }

    log('Delegating React code generation to Gemini 2.5 Flash...', 'info');
    try {
      const code = await this.queryGeminiAPI(layout, apiKey, log);
      log('Gemini completed code generation successfully.', 'info');
      return code;
    } catch (err) {
      log(`Gemini code generator failed (${err instanceof Error ? err.message : String(err)}).`, 'info');
      throw err;
    }
  }

  private async queryGeminiAPI(layout: DashboardLayout, apiKey: string, _log: (msg: string) => void): Promise<string> {
    const prompt = `You are a Principal React & Tailwind Code Generator Agent.
Create a complete, single-file React component representing the following maritime dashboard layout.
The component must be written in TypeScript, compile cleanly, and use Tailwind CSS styles.

Layout details:
Title: ${layout.title}
Description: ${layout.description}
Widgets to include:
${JSON.stringify(layout.widgets, null, 2)}

Requirements for the generated code:
1. Include imports from "react" (useState, useEffect, etc.) and "lucide-react" icons.
2. The component name must be default exported, e.g. "export default function Dashboard()".
3. Use a gorgeous dark maritime color theme (bg-slate-950, deep slate cards, neon blue/emerald/amber borders and text glow effects).
4. Implement actual dynamic states for all "gauge" sliders, "control_panel" toggle options, and alert items (allow user to toggle/interact with sliders and check/clear alerts).
5. Build an elegant, professional grid matching the column requirement. Use responsive grid layout (e.g. grid-cols-1 md:grid-cols-3) so it scales on mobile and desktop.
6. The layout must feel extremely premium: use modern typography, subtle borders (border-slate-800 hover:border-slate-700), glassmorphic backdrops (backdrop-blur-md), and animations.
7. CRITICAL: For "gauge" components, DO NOT just show text. You MUST implement a visual SVG-based speedometer or semi-circle CSS gauge. For "chart" components, you MUST implement a CSS or SVG-based bar/line chart visualization to represent volumes or comparisons. Make these visual elements look highly aesthetic and modern.

Return ONLY raw TSX code. Do NOT wrap in markdown block quotes.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8000
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Gemini API Error: ${errorData?.error?.message || response.statusText}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    text = text.replace(/```typescript/g, '')
      .replace(/```tsx/g, '')
      .replace(/```javascript/g, '')
      .replace(/```jsx/g, '')
      .replace(/```/g, '')
      .trim();

    return text;
  }
}
