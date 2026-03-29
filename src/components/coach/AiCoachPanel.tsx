'use client';

import { useState, useRef, useEffect } from 'react';
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

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            background: 'var(--text-tertiary)',
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

export default function AiCoachPanel({ isOpen, onClose, context }: AiCoachPanelProps) {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      role: 'assistant',
      content: `Hey! I'm Coach — your AI running coach for the Houston Marathon and Grasslands 100 journey.\n\nAsk me anything: training questions, workout modifications, nutrition advice, race strategy, or just need some motivation. What's on your mind?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: CoachMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

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
        {
          role: 'assistant',
          content: 'Sorry, I\'m having trouble connecting right now. Check your internet and try again.',
        },
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
    "Why am I doing intervals this week?",
    "Should I run if my legs are sore?",
    "Am I on track for sub-2:50?",
    "What should I eat before a long run?",
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col"
        style={{
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-subtle)',
          borderRadius: '20px 20px 0 0',
          height: '80dvh',
          maxHeight: 680,
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg animate-pulse-glow"
              style={{ background: 'var(--accent-teal-glow)', border: '1px solid var(--accent-teal)' }}
            >
              🤖
            </div>
            <div>
              <div
                className="font-bold text-sm"
                style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
              >
                Coach
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                AI Running Coach
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', minHeight: 'unset' }}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: msg.role === 'user' ? 'var(--accent-teal)' : 'var(--bg-card)',
                  color: msg.role === 'user' ? '#0F172A' : 'var(--text-primary)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl"
                style={{ background: 'var(--bg-card)' }}
              >
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts (show when first message) */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="flex-shrink-0 text-xs px-3 py-2 rounded-full"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  minHeight: 'unset',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div
          className="px-4 pb-3 pt-2 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Coach anything..."
              rows={1}
              className="flex-1 resize-none"
              style={{
                maxHeight: 120,
                fontSize: '15px',
                overflowY: 'auto',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: input.trim() && !loading ? 'var(--accent-teal)' : 'var(--bg-card)',
                color: input.trim() && !loading ? '#0F172A' : 'var(--text-tertiary)',
                transition: 'background 0.15s',
                minHeight: 'unset',
              }}
            >
              <span className="text-lg">↑</span>
            </button>
          </div>
          <div
            className="text-xs mt-1 text-center"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Powered by Claude · Enter to send
          </div>
        </div>
      </div>
    </>
  );
}
