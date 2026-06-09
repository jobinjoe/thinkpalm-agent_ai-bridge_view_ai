import sdk from '@stackblitz/sdk';
import { ensureLucideImports } from '../agents/tools';

function buildStackBlitzProject(title: string, reactCode: string): any {
  const appCode = ensureLucideImports(reactCode);
  return {
    title: title,
    description: title,
    template: 'node',
    files: {
      'package.json': JSON.stringify({
        name: 'bridgeview-dashboard',
        private: true,
        version: '0.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc -b && vite build',
          preview: 'vite preview'
        },
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          'lucide-react': '^0.344.0'
        },
        devDependencies: {
          vite: '^5.4.1',
          '@vitejs/plugin-react': '^4.3.1',
          tailwindcss: '^4.0.0-beta.8',
          '@tailwindcss/vite': '^4.0.0-beta.8',
          typescript: '^5.5.3',
          '@types/react': '^18.3.3',
          '@types/react-dom': '^18.3.0'
        }
      }, null, 2),
      'vite.config.ts': `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport tailwindcss from '@tailwindcss/vite';\n\nexport default defineConfig({\n  plugins: [react(), tailwindcss()],\n});`,
      'index.html': `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${title}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>`,
      'src/main.tsx': `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App.tsx';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n);`,
      'src/index.css': `@import "tailwindcss";\n\nhtml, body, #root {\n  margin: 0;\n  padding: 0;\n  width: 100%;\n  height: 100%;\n  background-color: #0b132b;\n  color: #f3f4f6;\n  font-family: ui-sans-serif, system-ui, sans-serif;\n}`,
      'src/App.tsx': appCode,
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['DOM', 'DOM.Iterable', 'ES2020'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true
        },
        include: ['src']
      }, null, 2)
    }
  };
}

/**
 * Packages the generated component into a full Vite + Tailwind v4 project payload 
 * and opens it in StackBlitz via browser WebContainers.
 */
export function exportToStackBlitz(title: string, description: string, reactCode: string) {
  const project = buildStackBlitzProject(title, reactCode);
  sdk.openProject(project, {
    newWindow: true,
    openFile: 'src/App.tsx',
    startScript: 'dev'
  });
}

/**
 * Embeds the StackBlitz project directly into a DOM element for live preview.
 */
export function embedInStackBlitz(elementId: string, title: string, reactCode: string) {
  const project = buildStackBlitzProject(title, reactCode);
  sdk.embedProject(elementId, project, {
    openFile: 'src/App.tsx',
    view: 'preview',
    hideNavigation: true,
    hideExplorer: true,
    forceEmbedLayout: true
  });
}
