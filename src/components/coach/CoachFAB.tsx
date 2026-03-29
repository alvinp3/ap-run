'use client';

import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export default function CoachFAB() {
  return (
    <Link
      href="/coach"
      className="fixed z-30 flex items-center justify-center"
      style={{
        right: 16,
        bottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
        width: 48,
        height: 48,
        borderRadius: 0,
        background: '#B388FF',
        color: '#000000',
        textDecoration: 'none',
      }}
      title="Open AI Coach"
      aria-label="Open AI Coach"
    >
      <BrainCircuit size={20} strokeWidth={1.5} />
    </Link>
  );
}
