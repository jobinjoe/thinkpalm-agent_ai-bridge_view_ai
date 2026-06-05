import type { DashboardLayout } from './types';

export class ClaudeCoder {
  /**
   * Generates Tailwind-styled React component code from the dashboard layout using Claude.
   */
  async generateCode(
    layout: DashboardLayout,
    apiKey: string | undefined,
    log: (msg: string, type?: 'info' | 'tool_call' | 'tool_response' | 'error') => void
  ): Promise<string> {
    log('Initiating React component code generation...', 'info');

    if (!apiKey || apiKey.trim() === '') {
      log('Claude error', 'error');
      throw new Error('Claude API key is required');
    }

    log('Delegating React code generation to Claude 3.5 Sonnet...', 'info');
    try {
      const code = await this.queryClaudeAPI(layout, apiKey, log);
      log('Claude completed code generation successfully.', 'info');
      return code;
    } catch {
      log('Claude error', 'error');
      throw new Error('Claude API request failed');
    }
  }

  private async queryClaudeAPI(layout: DashboardLayout, apiKey: string, _log: (msg: string) => void): Promise<string> {
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
    let text = data.content?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Claude API');
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
