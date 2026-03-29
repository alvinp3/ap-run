'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { BrainCircuit, ArrowUp, ArrowLeft, RotateCcw } from 'lucide-react';
import { useTextLines } from '@/hooks/useTextLines';
import type { CoachMessage } from '@/types';

const STORAGE_KEY = 'bq-coach-history';

const INITIAL_MESSAGE: CoachMessage = {
  role: 'assistant',
  content: `Coach online.\n\nAsk me anything: training questions, workout adjustments, nutrition, race strategy. What's on your mind?`,
};

const COLLAPSE_LINES = 6;
const MSG_FONT = '14px/1.6 Manrope, sans-serif';
const MSG_LINE_HEIGHT = 14 * 1.6;

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

export default function CoachPage() {
  const [messages, setMessages] = useState<CoachMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CoachMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage on every message change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-60)));
    } catch {}
  }, [messages, hydrated]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [input]);

  function clearHistory() {
    setMessages([INITIAL_MESSAGE]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: CoachMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    if (inputRef.current) inputRef.current.style.height = 'auto';

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const quickPrompts = [
    'Why intervals this week?',
    'Is soreness normal?',
    'On track for sub-2:50?',
    'Pre-long-run nutrition?',
  ];

  const isFirstMessage = messages.length === 1 && messages[0].content === INITIAL_MESSAGE.content;

  return (
    <div
      className="flex flex-col"
      style={{
        background: '#050505',
        height: '100dvh',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4"
        style={{
          background: '#050505',
          borderBottom: '1px solid #2A2A2A',
          paddingTop: 'env(safe-area-inset-top, 0)',
          height: 'calc(52px + env(safe-area-inset-top, 0px))',
        }}
      >
        <Link
          href="/"
          style={{
            color: '#52525B',
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px 4px 0',
          }}
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>

        <div className="flex items-center gap-2">
          <BrainCircuit size={16} strokeWidth={1.5} style={{ color: '#B388FF' }} />
          <span
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
          </span>
          <span
            style={{
              fontSize: 11,
              color: '#3A3A3A',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            · AI · Claude
          </span>
        </div>

        <button
          onClick={clearHistory}
          title="New conversation"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#52525B',
            minHeight: 'unset',
            padding: '4px 0 4px 8px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <RotateCcw size={16} strokeWidth={1.5} />
        </button>
      </header>

      {/* Messages — fills remaining height */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              style={{
                maxWidth: '85%',
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

      {/* Quick prompts — only on fresh conversation */}
      {isFirstMessage && (
        <div
          className="flex-shrink-0 flex gap-2 overflow-x-auto px-4"
          style={{
            borderTop: '1px solid #1A1A1A',
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInput(prompt);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
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
                padding: '6px 12px',
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

      {/* Input bar */}
      <div
        className="flex-shrink-0 px-4 pt-3"
        style={{
          borderTop: '1px solid #2A2A2A',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          position: 'relative',
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Coach anything…"
          rows={3}
          className="w-full resize-none"
          style={{
            background: '#0A0A0A',
            border: '1px solid #2A2A2A',
            borderRadius: 0,
            color: '#FFFFFF',
            fontFamily: 'Manrope, sans-serif',
            fontSize: 14,
            lineHeight: 1.6,
            padding: '10px 48px 10px 12px',
            minHeight: 72,
            maxHeight: 160,
            overflowY: 'auto',
            outline: 'none',
            display: 'block',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            position: 'absolute',
            right: 20,
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 19px)',
            background: input.trim() && !loading ? '#B388FF' : '#1A1A1A',
            border: 'none',
            borderRadius: 0,
            color: input.trim() && !loading ? '#000000' : '#52525B',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            minHeight: 'unset',
            transition: 'background 0.12s',
          }}
        >
          <ArrowUp size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
