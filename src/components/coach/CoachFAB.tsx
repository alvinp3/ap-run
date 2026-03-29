'use client';

import { useState } from 'react';
import AiCoachPanel from './AiCoachPanel';

interface CoachFABProps {
  context?: {
    weekNumber?: number;
    phase?: number;
    phaseName?: string;
    todayWorkout?: string;
  };
}

export default function CoachFAB({ context }: CoachFABProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed z-30 flex items-center justify-center"
        style={{
          right: 16,
          bottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
          width: 48,
          height: 48,
          borderRadius: 0,
          background: '#B388FF',
          color: '#000000',
          border: 'none',
          minHeight: 'unset',
        }}
        title="Open AI Coach"
        aria-label="Open AI Coach"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}>
          psychology
        </span>
      </button>

      <AiCoachPanel
        isOpen={open}
        onClose={() => setOpen(false)}
        context={context}
      />
    </>
  );
}
