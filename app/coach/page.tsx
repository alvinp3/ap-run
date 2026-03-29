'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { BrainCircuit, ArrowUp, RotateCcw, Check, X, History } from 'lucide-react';
import { useTextLines } from '@/hooks/useTextLines';
import type { CoachMessage } from '@/types';
import AppHeader from '@/components/layout/AppHeader';

// ── Storage keys ──────────────────────────────────────────────────────────────
const SESSIONS_KEY  = 'bq-coach-sessions';
const APPLIED_KEY   = 'bq-coach-applied';
const DISMISSED_KEY = 'bq-coach-dismissed';
const LEGACY_KEY    = 'bq-coach-history'; // migrated on first load

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatSession {
  id: string;
  startedAt: string; // ISO
  preview: string;
  messages: CoachMessage[];
}

// ── Session helpers ───────────────────────────────────────────────────────────
function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function sessionPreview(messages: CoachMessage[]): string {
  const first = messages.find(m => m.role === 'user');
  if (!first) return 'New conversation';
  return first.content.length > 64 ? first.content.slice(0, 64) + '…' : first.content;
}

function formatSessionDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === d.toDateString();
  if (isToday) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const INITIAL_MESSAGE: CoachMessage = {
  role: 'assistant',
  content: `Coach online.\n\nAsk me anything: training questions, workout adjustments, nutrition, race strategy. What's on your mind?`,
};

function freshSession(): ChatSession {
  return {
    id: genId(),
    startedAt: new Date().toISOString(),
    preview: 'New conversation',
    messages: [INITIAL_MESSAGE],
  };
}

// ── Collapsible message constants ─────────────────────────────────────────────
const COLLAPSE_LINES   = 6;
const MSG_FONT         = '14px/1.6 Manrope, sans-serif';
const MSG_LINE_HEIGHT  = 14 * 1.6;

// ── Parse workout modification blocks ────────────────────────────────────────
interface ParsedMod {
  date: string;
  changes: { description?: string; mileage?: number; type?: string };
  reason: string;
}

function parseAllModifications(content: string): { clean: string; mods: ParsedMod[] } {
  const re = /\n?---WORKOUT_MODIFICATION---\s*([\s\S]*?)---END_MODIFICATION---\n?/g;
  const mods: ParsedMod[] = [];
  let match;
  while ((match = re.exec(content)) !== null) {
    try {
      const mod = JSON.parse(match[1].trim()) as ParsedMod;
      if (mod.date) mods.push(mod);
    } catch {}
  }
  if (mods.length === 0) return { clean: content, mods: [] };
  const clean = content
    .replace(/\n?---WORKOUT_MODIFICATION---\s*[\s\S]*?---END_MODIFICATION---\n?/g, '')
    .trim();
  return { clean, mods };
}

// ── Streaming cursor ──────────────────────────────────────────────────────────
function StreamingCursor() {
  return (
    <span style={{
      display: 'inline-block', width: '0.55em', height: '1em',
      background: '#B388FF', verticalAlign: 'middle', marginLeft: 2,
      animation: 'blink 1s step-end infinite',
    }} />
  );
}

// ── Collapsible long message ──────────────────────────────────────────────────
function CollapsibleMessage({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const { lineCount, containerRef } = useTextLines(content, MSG_FONT, MSG_LINE_HEIGHT);
  const isTall = lineCount !== null && lineCount > COLLAPSE_LINES;
  const collapsedHeight = COLLAPSE_LINES * MSG_LINE_HEIGHT;

  return (
    <div>
      <div ref={containerRef} style={{
        whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'hidden',
        maxHeight: isTall && !expanded ? collapsedHeight : undefined, position: 'relative',
      }}>
        {content}
        {isTall && !expanded && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 32,
            background: 'linear-gradient(to bottom, transparent, #111111)',
          }} />
        )}
      </div>
      {isTall && (
        <button onClick={() => setExpanded(v => !v)} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#B388FF',
          fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 600,
          letterSpacing: '0.05em', padding: '4px 0 0', minHeight: 'unset',
        }}>
          {expanded ? 'SHOW LESS ↑' : 'SHOW MORE ↓'}
        </button>
      )}
    </div>
  );
}

// ── Modification proposal card ────────────────────────────────────────────────
function ModificationCard({
  mod, applied, dismissed, onApply, onDismiss,
}: {
  mod: ParsedMod;
  applied: boolean;
  dismissed: boolean;
  onApply: (mod: ParsedMod) => Promise<void>;
  onDismiss: (date: string) => void;
}) {
  const [applying, setApplying] = useState(false);
  if (dismissed) return null;

  const dateLabel = new Date(mod.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <div style={{
      background: '#0A0A0A', border: '1px solid #B388FF', borderRadius: 0,
      padding: '12px 14px', marginTop: 8,
    }}>
      <div style={{
        fontFamily: 'Space Grotesk, sans-serif', fontSize: 10,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#B388FF', marginBottom: 8,
      }}>
        Coach Modification · {dateLabel}
      </div>
      {mod.changes.description && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: '#52525B', fontFamily: 'Manrope, sans-serif', marginBottom: 2 }}>NEW WORKOUT</div>
          <div style={{ fontSize: 13, color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', lineHeight: 1.5 }}>{mod.changes.description}</div>
        </div>
      )}
      {(mod.changes.mileage || mod.changes.type) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
          {mod.changes.mileage && (
            <div>
              <div style={{ fontSize: 11, color: '#52525B', fontFamily: 'Manrope, sans-serif' }}>MILES</div>
              <div style={{ fontSize: 13, color: '#00E5FF', fontFamily: 'JetBrains Mono, monospace' }}>{mod.changes.mileage}</div>
            </div>
          )}
          {mod.changes.type && (
            <div>
              <div style={{ fontSize: 11, color: '#52525B', fontFamily: 'Manrope, sans-serif' }}>TYPE</div>
              <div style={{ fontSize: 13, color: '#00E5FF', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>{mod.changes.type}</div>
            </div>
          )}
        </div>
      )}
      <div style={{ fontSize: 12, color: '#52525B', fontFamily: 'Manrope, sans-serif', marginBottom: 10, fontStyle: 'italic' }}>{mod.reason}</div>
      {applied ? (
        <div style={{ fontSize: 12, color: '#22C55E', fontFamily: 'Manrope, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Check size={13} strokeWidth={2} /> Applied to training plan
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={async () => { setApplying(true); await onApply(mod); setApplying(false); }}
            disabled={applying}
            style={{
              flex: 1, background: applying ? '#1A1A1A' : '#22C55E',
              border: 'none', borderRadius: 0,
              color: applying ? '#52525B' : '#000000',
              fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.06em', padding: '8px 0',
              cursor: applying ? 'not-allowed' : 'pointer', minHeight: 'unset',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {applying ? 'Applying…' : <><Check size={13} strokeWidth={2.5} /> Apply Change</>}
          </button>
          <button
            onClick={() => onDismiss(mod.date)}
            style={{
              background: 'transparent', border: '1px solid #2A2A2A', borderRadius: 0,
              color: '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 12,
              padding: '8px 14px', cursor: 'pointer', minHeight: 'unset',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <X size={12} strokeWidth={2} /> Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CoachPage() {
  const [pastSessions, setPastSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession>(freshSession);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [appliedDates, setAppliedDates]     = useState<Set<string>>(new Set());
  const [dismissedDates, setDismissedDates] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  const messages = currentSession.messages;

  const setMessages = useCallback(
    (updater: CoachMessage[] | ((prev: CoachMessage[]) => CoachMessage[])) => {
      setCurrentSession(prev => {
        const next = typeof updater === 'function' ? updater(prev.messages) : updater;
        return { ...prev, messages: next, preview: sessionPreview(next) };
      });
    },
    []
  );

  // ── Hydrate from localStorage ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { sessions: ChatSession[]; currentId: string };
        const all  = data.sessions ?? [];
        const cur  = all.find(s => s.id === data.currentId);
        const past = all.filter(s => s.id !== data.currentId);
        if (cur) setCurrentSession(cur);
        setPastSessions(past);
      } else {
        // Migrate legacy flat array
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy) {
          const msgs = JSON.parse(legacy) as CoachMessage[];
          if (Array.isArray(msgs) && msgs.some(m => m.role === 'user')) {
            setPastSessions([{
              id: genId(),
              startedAt: new Date(Date.now() - 86400000).toISOString(),
              preview: sessionPreview(msgs),
              messages: msgs,
            }]);
          }
        }
      }
    } catch {}

    try {
      const s = localStorage.getItem(APPLIED_KEY);
      if (s) setAppliedDates(new Set(JSON.parse(s) as string[]));
    } catch {}
    try {
      const s = localStorage.getItem(DISMISSED_KEY);
      if (s) setDismissedDates(new Set(JSON.parse(s) as string[]));
    } catch {}

    fetch('/api/workouts/override')
      .then(r => r.json())
      .then((data: Array<{ date: string }>) => {
        if (Array.isArray(data))
          setAppliedDates(prev => new Set([...prev, ...data.map(o => o.date)]));
      })
      .catch(() => {});

    setHydrated(true);
  }, []);

  // ── Persist sessions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    const allSessions = [currentSession, ...pastSessions].slice(0, 20);
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify({
        sessions: allSessions,
        currentId: currentSession.id,
      }));
    } catch {}
  }, [pastSessions, currentSession, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(APPLIED_KEY, JSON.stringify([...appliedDates])); } catch {}
  }, [appliedDates, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissedDates])); } catch {}
  }, [dismissedDates, hydrated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [input]);

  // ── Session management ────────────────────────────────────────────────────
  function startNewChat() {
    if (messages.some(m => m.role === 'user')) {
      setPastSessions(prev => [currentSession, ...prev].slice(0, 19));
    }
    setCurrentSession(freshSession());
    setHistoryOpen(false);
  }

  function restoreSession(session: ChatSession) {
    if (messages.some(m => m.role === 'user')) {
      setPastSessions(prev =>
        [currentSession, ...prev.filter(s => s.id !== session.id)].slice(0, 19)
      );
    } else {
      setPastSessions(prev => prev.filter(s => s.id !== session.id));
    }
    setCurrentSession(session);
    setHistoryOpen(false);
  }

  // ── Modifications ─────────────────────────────────────────────────────────
  async function applyModification(mod: ParsedMod) {
    try {
      const res = await fetch('/api/workouts/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: mod.date, description: mod.changes.description,
          miles: mod.changes.mileage, type: mod.changes.type, reason: mod.reason,
        }),
      });
      if (res.ok) setAppliedDates(prev => new Set([...prev, mod.date]));
    } catch {}
  }

  function dismissModification(date: string) {
    setDismissedDates(prev => new Set([...prev, date]));
  }

  // ── Send message ──────────────────────────────────────────────────────────
  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: CoachMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    if (inputRef.current) inputRef.current.style.height = 'auto';

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Check your network and try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const quickPrompts = [
    'Apply all changes we discussed',
    'Adjust this whole week',
    'Am I on track for sub-2:50?',
    'Pre-long-run nutrition tips',
  ];

  const isFirstMessage =
    messages.length === 1 && messages[0].content === INITIAL_MESSAGE.content;

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: '#050505',
    }}>
      <AppHeader />

      {/* Coach toolbar */}
      <div style={{ flexShrink: 0, background: '#050505' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: historyOpen ? 'none' : '1px solid #2A2A2A',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BrainCircuit size={14} strokeWidth={1.5} style={{ color: '#B388FF' }} />
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 11,
              letterSpacing: '0.10em', textTransform: 'uppercase', color: '#B388FF',
            }}>
              AI Coach
            </span>
            <span style={{ fontSize: 11, color: '#3A3A3A', fontFamily: 'JetBrains Mono, monospace' }}>· Claude</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => setHistoryOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: historyOpen ? 'rgba(179,136,255,0.12)' : 'transparent',
                border: `1px solid ${historyOpen ? 'rgba(179,136,255,0.3)' : '#2A2A2A'}`,
                borderRadius: 6, padding: '5px 10px',
                color: historyOpen ? '#B388FF' : '#52525B',
                fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 500,
                cursor: 'pointer', minHeight: 'unset',
              }}
            >
              <History size={13} strokeWidth={1.5} />
              <span>History</span>
              {pastSessions.length > 0 && (
                <span style={{
                  background: '#B388FF', color: '#000', borderRadius: 9999,
                  fontSize: 9, fontWeight: 700, padding: '1px 5px', lineHeight: 1.4,
                }}>
                  {pastSessions.length}
                </span>
              )}
            </button>
            <button
              onClick={startNewChat}
              title="New conversation"
              style={{
                background: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6,
                padding: '5px 8px', color: '#52525B', cursor: 'pointer', minHeight: 'unset',
                display: 'flex', alignItems: 'center',
              }}
            >
              <RotateCcw size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* History panel */}
        {historyOpen && (
          <div style={{
            borderBottom: '1px solid #2A2A2A',
            maxHeight: 220, overflowY: 'auto',
            background: '#080808',
          }}>
            {pastSessions.length === 0 ? (
              <div style={{
                padding: '16px', textAlign: 'center',
                color: '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 12,
              }}>
                No previous conversations yet
              </div>
            ) : (
              pastSessions.map((session, i) => {
                const msgCount = session.messages.filter(m => m.role === 'user').length;
                return (
                  <button
                    key={session.id}
                    onClick={() => restoreSession(session)}
                    style={{
                      width: '100%', display: 'flex', flexDirection: 'column', gap: 3,
                      padding: '10px 16px', background: 'transparent',
                      border: 'none', borderBottom: i < pastSessions.length - 1 ? '1px solid #1A1A1A' : 'none',
                      cursor: 'pointer', textAlign: 'left', minHeight: 'unset',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                        color: '#B388FF', letterSpacing: '0.06em',
                      }}>
                        {formatSessionDate(session.startedAt)}
                      </span>
                      <span style={{ fontSize: 9, color: '#3A3A3A', fontFamily: 'Manrope, sans-serif' }}>
                        {msgCount} msg{msgCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: 'Manrope, sans-serif', fontSize: 12,
                      color: '#A1A1AA', lineHeight: 1.4,
                    }}>
                      {session.preview}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        onClick={() => { if (historyOpen) setHistoryOpen(false); }}
      >
        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} className="flex justify-end">
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', background: '#5B5BFF',
                  border: '1px solid #5B5BFF', borderRadius: 0, color: '#FFFFFF',
                  fontFamily: 'Manrope, sans-serif', fontSize: 14, lineHeight: 1.6,
                }}>
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                </div>
              </div>
            );
          }

          const { clean, mods } = parseAllModifications(msg.content);
          const pendingMods = mods.filter(m => !appliedDates.has(m.date) && !dismissedDates.has(m.date));
          return (
            <div key={i} className="flex flex-col items-start">
              <div style={{
                maxWidth: '85%', padding: '10px 14px', background: '#111111',
                border: '1px solid #2A2A2A', borderRadius: 0, color: '#FFFFFF',
                fontFamily: 'Manrope, sans-serif', fontSize: 14, lineHeight: 1.6,
              }}>
                <CollapsibleMessage content={clean} />
              </div>
              {mods.length > 0 && (
                <div style={{ maxWidth: '85%', width: '85%' }}>
                  {mods.map(mod => (
                    <ModificationCard
                      key={mod.date}
                      mod={mod}
                      applied={appliedDates.has(mod.date)}
                      dismissed={dismissedDates.has(mod.date)}
                      onApply={applyModification}
                      onDismiss={dismissModification}
                    />
                  ))}
                  {pendingMods.length > 1 && (
                    <button
                      onClick={async () => { for (const m of pendingMods) await applyModification(m); }}
                      style={{
                        width: '100%', marginTop: 8,
                        background: '#22C55E', border: 'none', borderRadius: 0,
                        color: '#000000', fontFamily: 'Manrope, sans-serif',
                        fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                        padding: '10px 0', cursor: 'pointer', minHeight: 'unset',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      <Check size={13} strokeWidth={2.5} />
                      Apply All {pendingMods.length} Changes
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div style={{
              padding: '10px 14px', background: '#111111', border: '1px solid #2A2A2A',
              borderRadius: 0, fontSize: 14, fontFamily: 'Manrope, sans-serif', color: '#A1A1AA',
            }}>
              <StreamingCursor />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {isFirstMessage && (
        <div className="flex-shrink-0 flex gap-2 overflow-x-auto px-4" style={{
          borderTop: '1px solid #1A1A1A', paddingTop: 10, paddingBottom: 10,
        }}>
          {quickPrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => { setInput(prompt); setTimeout(() => inputRef.current?.focus(), 50); }}
              style={{
                flexShrink: 0, background: 'transparent', border: '1px solid #B388FF', borderRadius: 0,
                color: '#B388FF', fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 500,
                letterSpacing: '0.04em', padding: '6px 12px', cursor: 'pointer',
                minHeight: 'unset', whiteSpace: 'nowrap',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 px-4 pt-3" style={{
        borderTop: '1px solid #2A2A2A',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        position: 'relative',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Coach anything…"
          rows={3}
          className="w-full resize-none"
          style={{
            background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 0,
            color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', fontSize: 14, lineHeight: 1.6,
            padding: '10px 48px 10px 12px', minHeight: 72, maxHeight: 160,
            overflowY: 'auto', outline: 'none', display: 'block',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            position: 'absolute', right: 20,
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 19px)',
            background: input.trim() && !loading ? '#B388FF' : '#1A1A1A',
            border: 'none', borderRadius: 0,
            color: input.trim() && !loading ? '#000000' : '#52525B',
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            minHeight: 'unset', transition: 'background 0.12s',
          }}
        >
          <ArrowUp size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
