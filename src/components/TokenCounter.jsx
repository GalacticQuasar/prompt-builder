import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { estimateTokens, formatTokenCount } from '../utils/tokenizer';

export default function TokenCounter() {
  const { getActivePrompt } = useProject();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const prompt = getActivePrompt();

  if (!prompt) return null;

  const sections = prompt.sections.slice().sort((a, b) => a.order - b.order);
  const totalTokens = sections.reduce((sum, s) => sum + estimateTokens(s.content), 0);

  return (
    <div className="relative">
      <button
        className="btn btn-ghost btn-sm text-xs"
        onClick={() => setShowBreakdown(!showBreakdown)}
        title="Click for per-section breakdown"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        {formatTokenCount(totalTokens)} tokens
      </button>
      {showBreakdown && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-base-300 rounded-lg shadow-lg p-3 min-w-48 text-sm">
          {sections.map((s) => (
            <div key={s.id} className="flex justify-between py-1 border-b border-base-content/10 last:border-0">
              <span className="opacity-70 truncate mr-2">{s.label || 'Untitled'}</span>
              <span className="font-mono text-xs">{formatTokenCount(estimateTokens(s.content))}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t border-base-content/20 font-bold">
            <span>Total</span>
            <span className="font-mono">{formatTokenCount(totalTokens)}</span>
          </div>
        </div>
      )}
    </div>
  );
}