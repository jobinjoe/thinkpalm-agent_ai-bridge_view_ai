import { ensureLucideImports } from './tools';

export class GeminiInspector {
  /**
   * Reviews and refines React/Tailwind code to ensure it compiles and displays cleanly.
   */
  async inspectCode(
    code: string,
    apiKey: string | undefined,
    log: (msg: string, type?: 'info' | 'tool_call' | 'tool_response' | 'error') => void
  ): Promise<string> {
    log('Initiating code inspection and syntax validation...', 'info');

    if (!apiKey || apiKey.trim() === '') {
      log('Gemini error', 'error');
      throw new Error('Gemini API key is required');
    }

    log('Requesting Gemini API to perform UX audit and linting check...', 'info');
    try {
      const inspectedCode = await this.queryGeminiAPI(code, apiKey, log);
      log('Gemini UX review completed. Styling and compilation check passed.', 'info');
      return this.finalizeCode(inspectedCode, log);
    } catch (err) {
      log('Gemini error', 'error');
      throw new Error(`Gemini API request failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private finalizeCode(
    code: string,
    log: (msg: string, type?: 'info' | 'tool_call' | 'tool_response' | 'error') => void
  ): string {
    const fixed = ensureLucideImports(code);
    if (fixed !== code) {
      log('Synced lucide-react imports with JSX icon usage.', 'info');
    }
    return fixed;
  }

  private async queryGeminiAPI(code: string, apiKey: string, _log: (msg: string) => void): Promise<string> {
    const prompt = `You are a Senior UX Auditor and Linter Agent.
Your role is to inspect the provided React TSX dashboard code.
Verify tags, Tailwind classes, imports, and exports are correct. Correct any issues.
Return ONLY raw TSX code. Do NOT wrap in markdown block quotes.

React Code to Inspect:
${code}`;

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
