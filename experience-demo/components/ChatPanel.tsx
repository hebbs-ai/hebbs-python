'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent } from '@/lib/agent';
import { usePlaygroundStore } from '@/lib/store';

export function ChatPanel() {
  const messages = usePlaygroundStore((s) => s.messages);
  const isProcessing = usePlaygroundStore((s) => s.isProcessing);
  const scenarioPlaying = usePlaygroundStore((s) => s.scenarioPlaying);
  const scenarioPaused = usePlaygroundStore((s) => s.scenarioPaused);
  const scenarioStepLabel = usePlaygroundStore((s) => s.scenarioStepLabel);
  const scenarioProgress = usePlaygroundStore((s) => s.scenarioProgress);
  const autoPlay = usePlaygroundStore((s) => s.autoPlay);
  const activeScenario = usePlaygroundStore((s) => s.activeScenario);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sendMessage, playScenario, advanceScenario } = useAgent();

  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (nearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length]);

  // Keyboard: Space or Enter advances the scenario when paused
  useEffect(() => {
    if (!scenarioPlaying || !scenarioPaused) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        advanceScenario();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [scenarioPlaying, scenarioPaused, advanceScenario]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isProcessing) return;
    setInputValue('');
    await sendMessage(text);
  }, [inputValue, isProcessing, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showContinueStrip = scenarioPlaying && scenarioPaused && scenarioStepLabel;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-10 shrink-0 items-center border-b border-glass-border px-4">
        <span className="text-[11px] font-medium tracking-widest uppercase text-white/40">
          Conversation
        </span>
        {activeScenario && (
          <span className="ml-2 rounded bg-white/5 px-2 py-0.5 text-[10px] text-white/30">
            {activeScenario}
          </span>
        )}
      </div>

      {!activeScenario && messages.length === 0 && (
        <div className="shrink-0 border-b border-glass-border p-4">
          <p className="mb-3 text-xs text-white/40">
            Click a scenario to watch the agent learn, or type freely below.
          </p>
          <div className="flex flex-wrap gap-2">
            <ScenarioButton
              name="The Learning Arc"
              description="5 calls — watch the agent go from blank to strategic"
              onClick={() => playScenario('learning-arc')}
              disabled={scenarioPlaying}
            />
            <ScenarioButton
              name="Returning Customer"
              description="The agent remembers — 2 weeks later"
              onClick={() => playScenario('returning-customer')}
              disabled={scenarioPlaying}
            />
            <ScenarioButton
              name="World Changed"
              description="Belief revision — insights cascade and rebuild"
              onClick={() => playScenario('world-changed')}
              disabled={scenarioPlaying}
            />
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
            >
              {msg.role === 'system' ? (
                <div className="rounded-full bg-white/5 px-3 py-1">
                  <span className="text-[11px] text-white/30">{msg.content}</span>
                </div>
              ) : (
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-blue-600/20 text-white/90'
                      : 'glass-card text-white/80'
                  }`}
                >
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/30">
                    {msg.role === 'user' ? 'Prospect' : 'Sales Agent'}
                  </div>
                  <p className="text-[14px] leading-relaxed">{msg.content}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass-card flex items-center gap-2 px-4 py-2.5">
              <div className="flex gap-1">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 [animation-delay:150ms]" />
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 [animation-delay:300ms]" />
              </div>
              <span className="text-[11px] text-white/30">Agent thinking…</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Continue Strip (shown when scenario is paused) */}
      {showContinueStrip ? (
        <div className="shrink-0 border-t border-glass-border p-3">
          <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/[0.06] px-4 py-2.5">
            <div className="flex flex-col gap-0.5">
              {scenarioProgress && (
                <span className="font-mono text-[11px] font-medium text-green-400">
                  Turn {scenarioProgress.current} / {scenarioProgress.total}
                </span>
              )}
              <span className="text-[11px] text-white/40">{scenarioStepLabel}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/20">Space</span>
              <button
                onClick={advanceScenario}
                className="continue-pulse rounded-lg bg-green-600/20 px-4 py-1.5 text-[12px] font-medium text-green-400 transition-all hover:bg-green-600/30"
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      ) : scenarioPlaying && !scenarioPaused ? (
        <div className="shrink-0 border-t border-glass-border p-3">
          <div className="flex items-center justify-center rounded-xl bg-white/[0.03] px-4 py-2.5">
            {autoPlay ? (
              <span className="text-[11px] text-white/25">Auto-playing…</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400/60" />
                <span className="text-[11px] text-white/25">Processing turn…</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="shrink-0 border-t border-glass-border p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message as the prospect…"
              disabled={isProcessing}
              className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none ring-1 ring-white/5 transition-all focus:ring-white/15 disabled:opacity-40"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isProcessing}
              className="rounded-xl bg-blue-600/20 px-4 py-2.5 text-sm font-medium text-blue-400 transition-all hover:bg-blue-600/30 disabled:opacity-30"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScenarioButton({
  name,
  description,
  onClick,
  disabled,
}: {
  name: string;
  description: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="glass-card group flex-1 min-w-[140px] px-3 py-2.5 text-left transition-all hover:border-white/15 disabled:opacity-40"
    >
      <div className="text-xs font-medium text-white/80 group-hover:text-white">{name}</div>
      <div className="mt-0.5 text-[10px] text-white/30">{description}</div>
    </button>
  );
}
