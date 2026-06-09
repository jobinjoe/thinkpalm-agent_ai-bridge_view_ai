import React, { useState, useEffect, useMemo } from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import * as LucideIcons from 'lucide-react';

interface DashboardPreviewProps {
  code?: string;
  title?: string;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ code, title = 'Dashboard Preview' }) => {
  const [processedCode, setProcessedCode] = useState<string>('');

  useEffect(() => {
    if (!code) return;

    // 1. Remove all import statements (including multi-line)
    let cleanedCode = code.replace(/import\s+[\s\S]*?(?:from\s+['"].*?['"]|['"].*?['"]);?/g, '');
    
    // 2. Extract the component name
    const match = cleanedCode.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
    let componentName = 'Dashboard';
    if (match && match[1]) {
      componentName = match[1];
    } else {
      const arrowMatch = cleanedCode.match(/export\s+default\s+(?:const|let|var)\s+([A-Za-z0-9_]+)/);
      if (arrowMatch && arrowMatch[1]) {
        componentName = arrowMatch[1];
      }
    }

    // 3. Convert "export default function X" to "function X"
    cleanedCode = cleanedCode.replace(/export\s+default\s+function/g, 'function');
    
    // 4. Handle arrow functions "export default const X =" 
    cleanedCode = cleanedCode.replace(/export\s+default\s+(const|let|var)\s+([A-Za-z0-9_]+)/g, '$1 $2');

    // 5. Append the render call for react-live
    cleanedCode = cleanedCode.trim() + `\n\nrender(<${componentName} />);`;

    setProcessedCode(cleanedCode);
  }, [code]);

  const scope = useMemo(() => ({
    React,
    useState,
    useEffect,
    ...LucideIcons
  }), []);

  if (!code) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 h-full py-32 text-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-880 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
          <LucideIcons.Compass className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-white text-sm font-bold">No Layout Previews Yet</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1 leading-normal">
          Run the agent pipeline on your maritime spec to construct layout widget definitions and render components here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col rounded-xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 relative">
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider">{title}</h3>
        <div className="flex items-center space-x-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">React-Live Engine</span>
        </div>
      </div>
      
      <div className="flex-1 relative overflow-auto bg-slate-950 p-2">
        {processedCode && (
          <LiveProvider code={processedCode} scope={scope} noInline={true}>
            <div className="w-full h-full rounded-lg overflow-hidden border border-slate-800/50 bg-slate-950 relative">
               <LivePreview className="w-full h-full p-2" />
            </div>
            <LiveError className="text-rose-400 font-mono text-xs bg-rose-950 p-4 border-t border-rose-900/50 absolute bottom-0 left-0 right-0 max-h-48 overflow-auto z-10" />
          </LiveProvider>
        )}
      </div>
    </div>
  );
};
