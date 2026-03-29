'use client';

import { useState, useRef, useEffect } from 'react';
import { BrainCircuit, ArrowUp } from 'lucide-react';
import { useTextLines } from '@/hooks/useTextLines';
import type { CoachMessage } from '@/types';

interface AiCoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    weekNumber?: number;
    phase?: number;
    phaseName?: string;
    todayWorkout?: string;
  };
}

/** Blinking █ cursor shown while AI is generating */
function StreamingCursor() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '0.55em',
        height: '1em',
        background: '#B388FF',
        verticalAlign: 'middle',
        marginLeft: 2,
        animation: 'blink 1s step-end infinite',
      }}
    />
  );
}

const COLLAPSE_LINES = 6;
const MSG_FONT = '14px/1.6 Manrope, sans-serif';
const MSG_LINE_HEIGHT = 14 * 1.6; // 22.4px

/** Long assistant messages collapse after COLLAPSE_LINES lines */
function CollapsibleMessage({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const { lineCount, containerRef } = useTextLines(content, MSG_FONT, MSG_LINE_HEIGHT);

  const isTall = lineCount !== null && lineCount > COLLAPSE_LINES;
  const collapsedHeight = COLLAPSE_LINES * MSG_LINE_HEIGHT;

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflow: 'hidden',
          maxHeight: isTall && !expanded ? collapsedHeight : undefined,
          position: 'relative',
        }}
      >
        {content}
        {isTall && !expanded && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 32,
              background: 'linear-gradient(to bottom, transparent, #111111)',
            }}
          />
        )}
      </div>
      {isTall && (
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#B388FF',
            fontFamily: 'Manrope, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.05em',
            padding: '4px 0 0',
            minHeight: 'unset',
          }}
        >
          {expanded ? 'SHOW LESS ↑' : 'SHOW MORE ↓'}
        </button>
      )}
    </div>
  );
}

export default function AiCoachPanel({ isOpen, onClose, context }: AiCoachPanelProps) {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      role: 'assistant',
      content: `Coach online.\n\nAsk me anything: training questions, workout adjustments, nutrition, race strategy. What's on your mind?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea as content grows
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [input]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: CoachMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Reset textarea height after clearing
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          context,
        }),
      });
      if (!res.ok) throw new Error('Coach unavailable');
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Check your network and try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const quickPrompts = [
    'Why intervals this week?',
    'Is soreness normal?',
    'On track for sub-2:50?',
    'Pre-long-run nutrition?',
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.85)' }}
        onClick={onClose}
      />

      {/* Panel — bottom-sheet, sharp top edge */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col"
        style={{
          background: '#050505',
          borderTop: '1px solid #B388FF',
          borderLeft: '1px solid #2A2A2A',
          borderRight: '1px solid #2A2A2A',
          height: '80dvh',
          maxHeight: 680,
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          maxWidth: 375,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid #2A2A2A' }}
        >
          <div className="flex items-center gap-3">
            <BrainCircuit size={20} strokeWidth={1.5} style={{ color: '#B388FF' }} />
            <div>
              <div
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 400,
                  fontSize: 13,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#B388FF',
                }}
              >
                Coach
              </div>
              <div style={{ fontSize: 11, color: '#52525B', fontFamily: 'JetBrains Mono, monospace' }}>
                AI · Claude
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#52525B',
              minHeight: 'unset',
              padding: '4px 8px',
              fontSize: 20,
            }}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                style={{
                  maxWidth: '88%',
                  padding: '10px 14px',
                  background: msg.role === 'user' ? '#0d0df2' : '#111111',
                  border: `1px solid ${msg.role === 'user' ? '#0d0df2' : '#2A2A2A'}`,
                  borderRadius: 0,
                  color: '#FFFFFF',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {msg.role === 'assistant' ? (
                  <CollapsibleMessage content={msg.content} />
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div
                style={{
                  padding: '10px 14px',
                  background: '#111111',
                  border: '1px solid #2A2A2A',
                  borderRadius: 0,
                  fontSize: 14,
                  fontFamily: 'Manrope, sans-serif',
                  color: '#A1A1AA',
                }}
              >
                <StreamingCursor />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        {messages.length === 1 && (
          <div
            className="px-4 pb-3 flex gap-2 overflow-x-auto flex-shrink-0"
            style={{ borderTop: '1px solid #2A2A2A', paddingTop: 8 }}
          >
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => { setInput(prompt); setTimeout(() => inputRef.current?.focus(), 50); }}
                style={{
                  flexShrink: 0,
                  background: 'transparent',
                  border: '1px solid #B388FF',
                  borderRadius: 0,
                  color: '#B388FF',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  minHeight: 'unset',
                  whiteSpace: 'nowrap',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div
          className="px-4 pt-3 pb-3 flex-shrink-0 flex items-end gap-2"
          style={{ borderTop: '1px solid #2A2A2A' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Coach..."
            rows={3}
            className="flex-1 resize-none"
            style={{
              background: '#0A0A0A',
              border: '1px solid #2A2A2A',
              borderRadius: 0,
              color: '#FFFFFF',
              fontFamily: 'Manrope, sans-serif',
              fontSize: 14,
              lineHeight: 1.6,
              padding: '10px 12px',
              minHeight: 72,
              maxHeight: 160,
              overflowY: 'auto',
              outline: 'none',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? '#B388FF' : '#1A1A1A',
              border: 'none',
              borderRadius: 0,
              color: input.trim() && !loading ? '#000000' : '#52525B',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              flexShrink: 0,
              minHeight: 'unset',
              transition: 'background 0.12s',
              alignSelf: 'flex-end',
            }}
          >
            <ArrowUp size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
}
