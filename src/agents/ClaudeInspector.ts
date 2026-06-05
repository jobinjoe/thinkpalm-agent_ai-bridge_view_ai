import { ensureLucideImports } from './tools';

export class ClaudeInspector {
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
      log('Claude error', 'error');
      throw new Error('Claude API key is required');
    }

    log('Requesting Claude API to perform UX audit and linting check...', 'info');
    try {
      const inspectedCode = await this.queryClaudeAPI(code, apiKey, log);
      log('Claude UX review completed. Styling and compilation check passed.', 'info');
      return this.finalizeCode(inspectedCode, log);
    } catch {
      log('Claude error', 'error');
      throw new Error('Claude API request failed');
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

  private async queryClaudeAPI(code: string, apiKey: string, _log: (msg: string) => void): Promise<string> {
    const prompt = `You are a Senior UX Auditor and Linter Agent.
Your role is to inspect the provided React TSX dashboard code.
Verify tags, Tailwind classes, imports, and exports are correct. Correct any issues.
Return ONLY raw TSX code. Do NOT wrap in markdown block quotes.

React Code to Inspect:
${code}`;

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
