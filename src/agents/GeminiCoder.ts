import type { DashboardLayout } from './types';

export class GeminiCoder {
  /**
   * Generates Tailwind-styled React component code from the dashboard layout using Gemini.
   */
  async generateCode(
    layout: DashboardLayout,
    apiKey: string | undefined,
    log: (msg: string, type?: 'info' | 'tool_call' | 'tool_response' | 'error') => void
  ): Promise<string> {
    log('Initiating React component code generation...', 'info');

    if (!apiKey || apiKey.trim() === '') {
      log('Gemini error', 'error');
      throw new Error('Gemini API key is required');
    }

    log('Delegating React code generation to Gemini 2.5 Flash...', 'info');
    try {
      const code = await this.queryGeminiAPI(layout, apiKey, log);
      log('Gemini completed code generation successfully.', 'info');
      return code;
    } catch (err) {
      log('Gemini error', 'error');
      throw new Error(`Gemini API request failed: ${err instanceof Error ? err.message : String(err)}`);
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

Return ONLY raw TSX code. Do NOT wrap in markdown block quotes.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    text = text
      .replace(/```typescript/g, '')
      .replace(/```tsx/g, '')
      .replace(/```javascript/g, '')
      .replace(/```jsx/g, '')
      .replace(/```/g, '')
      .trim();

    return text;
  }
}
