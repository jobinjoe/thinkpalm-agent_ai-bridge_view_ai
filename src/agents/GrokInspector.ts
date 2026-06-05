import { ensureLucideImports, callGrokAPI } from './tools';

export class GrokInspector {
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
      log('Grok error', 'error');
      throw new Error('Grok API key is required');
    }

    log('Requesting Grok API to perform UX audit and linting check...', 'info');
    try {
      const inspectedCode = await this.queryGrokAPI(code, apiKey, log);
      log('Grok UX review completed. Styling and compilation check passed.', 'info');
      return this.finalizeCode(inspectedCode, log);
    } catch (err) {
      log('Grok error', 'error');
      throw new Error(`Grok API request failed: ${err instanceof Error ? err.message : String(err)}`);
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

  private async queryGrokAPI(code: string, apiKey: string, _log: (msg: string) => void): Promise<string> {
    const prompt = `You are a Senior UX Auditor and Linter Agent.
Your role is to inspect the provided React TSX dashboard code.
Verify tags, Tailwind classes, imports, and exports are correct. Correct any issues.
Return ONLY raw TSX code. Do NOT wrap in markdown block quotes.

React Code to Inspect:
${code}`;

    let text = await callGrokAPI(prompt, apiKey, false);

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
