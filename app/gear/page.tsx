'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';
import CoachFAB from '@/components/coach/CoachFAB';
import { houstonGear, grasslandsGear } from '@/data/reference-data';

export default function GearPage() {
  const [activeRace, setActiveRace] = useState<'houston' | 'grasslands'>('houston');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gear-checklist');
    if (saved) {
      try { setCheckedItems(JSON.parse(saved)); } catch {}
    }
  }, []);

  function toggleItem(id: string) {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('gear-checklist', JSON.stringify(next));
      return next;
    });
  }

  const items = activeRace === 'houston' ? houstonGear : grasslandsGear;
  const checkedCount = items.filter((i) => checkedItems[i.id]).length;

  // Group by category
  const categories = [...new Set(items.map((i) => i.category ?? 'General'))];

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader title="Gear Checklists" />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-black mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
          Gear Checklists
        </h1>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Check off items as you pack
        </p>

        {/* Race selector */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'houston' as const, label: '🏆 Houston Marathon', color: '#8B5CF6' },
            { id: 'grasslands' as const, label: '🌟 Grasslands 100', color: '#06B6D4' },
          ].map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => setActiveRace(id)}
              className="flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeRace === id ? `${color}22` : 'var(--bg-card)',
                border: `1px solid ${activeRace === id ? color : 'var(--border-subtle)'}`,
                color: activeRace === id ? color : 'var(--text-secondary)',
                minHeight: 44,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="card mb-4" style={{ padding: '12px 16px' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Packed</span>
            <span className="text-sm font-bold" style={{ fontFamily: 'DM Mono, monospace' }}>
              {checkedCount} / {items.length}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(checkedCount / items.length) * 100}%`,
                background: activeRace === 'houston' ? '#8B5CF6' : '#06B6D4',
              }}
            />
          </div>
          {checkedCount === items.length && (
            <div className="text-center text-sm font-semibold mt-2" style={{ color: '#22C55E' }}>
              ✅ All packed! You&apos;re ready to race.
            </div>
          )}
        </div>

        {/* Items by category */}
        {categories.map((category) => {
          const categoryItems = items.filter((i) => (i.category ?? 'General') === category);
          return (
            <div key={category} className="mb-4">
              <div
                className="text-xs font-semibold tracking-widest uppercase mb-2 px-1"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Sans, sans-serif' }}
              >
                {category}
              </div>
              <div className="space-y-1.5">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="card flex items-center gap-3 cursor-pointer"
                    style={{
                      padding: '12px 14px',
                      opacity: checkedItems[item.id] ? 0.6 : 1,
                    }}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: checkedItems[item.id]
                          ? (activeRace === 'houston' ? '#8B5CF6' : '#06B6D4')
                          : 'var(--border-accent)',
                        background: checkedItems[item.id]
                          ? (activeRace === 'houston' ? 'rgba(139,92,246,0.15)' : 'rgba(6,182,212,0.15)')
                          : 'transparent',
                      }}
                    >
                      {checkedItems[item.id] && (
                        <span className="text-xs font-bold" style={{ color: activeRace === 'houston' ? '#8B5CF6' : '#06B6D4' }}>✓</span>
                      )}
                    </div>
                    <span
                      className="text-sm flex-1"
                      style={{
                        color: checkedItems[item.id] ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        textDecoration: checkedItems[item.id] ? 'line-through' : 'none',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Reset button */}
        <button
          className="btn-secondary w-full mt-2"
          onClick={() => {
            const confirmReset = window.confirm('Reset all checkboxes for this race?');
            if (confirmReset) {
              const cleared = { ...checkedItems };
              items.forEach((i) => { delete cleared[i.id]; });
              setCheckedItems(cleared);
              localStorage.setItem('gear-checklist', JSON.stringify(cleared));
            }
          }}
          style={{ color: 'var(--text-tertiary)' }}
        >
          Reset {activeRace === 'houston' ? 'Houston' : 'Grasslands'} Checklist
        </button>
      </main>

      <AppNav />
      <CoachFAB />
    </div>
  );
}
