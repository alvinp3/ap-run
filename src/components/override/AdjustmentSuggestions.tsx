'use client';

import { useState } from 'react';
import type { AdjustmentSuggestion } from '@/types';
import { formatMiles } from '@/utils/workout';

interface AdjustmentSuggestionsProps {
  suggestions: AdjustmentSuggestion[];
  onApply: (suggestion: AdjustmentSuggestion) => Promise<void>;
  onDismiss: (id: string) => void;
  onApplyAll: () => Promise<void>;
}

export default function AdjustmentSuggestions({
  suggestions,
  onApply,
  onDismiss,
  onApplyAll,
}: AdjustmentSuggestionsProps) {
  const [applying, setApplying] = useState<string | null>(null);
  const [applyingAll, setApplyingAll] = useState(false);

  if (suggestions.length === 0) return null;

  async function handleApply(s: AdjustmentSuggestion) {
    setApplying(s.id);
    try { await onApply(s); } finally { setApplying(null); }
  }

  async function handleApplyAll() {
    setApplyingAll(true);
    try { await onApplyAll(); } finally { setApplyingAll(false); }
  }

  const borderColor = (sev: 'info' | 'warning') =>
    sev === 'warning' ? '#F59E0B' : '#6366F1';

  return (
    <section className="mb-4">
      <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
        Suggested Adjustments
      </div>

      <div className="flex flex-col gap-2">
        {suggestions.map((s) => (
          <div
            key={s.id}
            className="card"
            style={{
              padding: '12px 14px',
              borderLeft: `3px solid ${borderColor(s.severity)}`,
            }}
          >
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">{s.ruleIcon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-bold uppercase"
                    style={{ color: borderColor(s.severity), fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {s.targetDayName}
                  </span>
                  {s.suggestedMiles !== undefined && (
                    <span className="text-xs" style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text-secondary)' }}>
                      {formatMiles(s.currentMiles)}mi {s.suggestedType ? s.currentType : ''} &rarr; {formatMiles(s.suggestedMiles)}mi {s.suggestedType ?? s.currentType}
                    </span>
                  )}
                  {s.suggestedType && !s.suggestedMiles && s.suggestedMiles !== 0 && (
                    <span className="text-xs" style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text-secondary)' }}>
                      {s.currentType} &rarr; {s.suggestedType}
                    </span>
                  )}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                  {s.explanation}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 ml-7">
              <button
                className="btn-secondary"
                style={{
                  fontSize: 11, padding: '5px 12px', minHeight: 28, minWidth: 'unset',
                  color: '#22C55E', borderColor: 'rgba(34,197,94,0.3)',
                }}
                disabled={applying === s.id}
                onClick={() => handleApply(s)}
              >
                {applying === s.id ? 'Applying...' : 'Apply'}
              </button>
              <button
                className="btn-secondary"
                style={{
                  fontSize: 11, padding: '5px 12px', minHeight: 28, minWidth: 'unset',
                  color: 'var(--text-tertiary)',
                }}
                onClick={() => onDismiss(s.id)}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>

      {suggestions.length > 1 && (
        <button
          className="btn-secondary w-full mt-2"
          style={{ fontSize: 12, color: '#22C55E' }}
          disabled={applyingAll}
          onClick={handleApplyAll}
        >
          {applyingAll ? 'Applying...' : `Apply All ${suggestions.length} Suggestions`}
        </button>
      )}
    </section>
  );
}
