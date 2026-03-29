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
        className="fixed z-30 flex flex-col items-center justify-center gap-0.5 text-center"
        style={{
          right: 20,
          bottom: 'calc(env(safe-area-inset-bottom, 16px) + 72px)',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--accent-teal)',
          color: '#0F172A',
          boxShadow: '0 4px 20px rgba(45,212,191,0.4)',
          minHeight: 'unset',
          animation: 'pulse-glow 3s ease-in-out infinite',
        }}
        title="Open AI Coach"
        aria-label="Open AI Coach"
      >
        <span className="text-xl leading-none">🤖</span>
      </button>

      <AiCoachPanel
        isOpen={open}
        onClose={() => setOpen(false)}
        context={context}
      />
    </>
  );
}
