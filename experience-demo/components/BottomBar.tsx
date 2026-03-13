'use client';

import { usePlaygroundStore } from '@/lib/store';
import { useAgent } from '@/lib/agent';

export function BottomBar() {
  const allMemories = usePlaygroundStore((s) => s.allMemories);
  const insights = usePlaygroundStore((s) => s.insights);
  const conversations = usePlaygroundStore((s) => s.conversations);
  const isProcessing = usePlaygroundStore((s) => s.isProcessing);
  const scenarioPlaying = usePlaygroundStore((s) => s.scenarioPlaying);
  const autoPlay = usePlaygroundStore((s) => s.autoPlay);
  const setAutoPlay = usePlaygroundStore((s) => s.setAutoPlay);
  const { triggerReflect, triggerWorldChanged, resetPlayground } = useAgent();

  const disabled = isProcessing || scenarioPlaying;

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-t border-glass-border px-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-start">
          <button
            onClick={triggerReflect}
            disabled={disabled || allMemories.length < 3}
            className="rounded-lg bg-amber-500/10 px-3 py-1.5 font-mono text-[11px] font-medium text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-30"
          >
            Global Reflect
          </button>
          <span className="text-[8px] text-white/20 mt-0.5 pl-0.5">
            entity-scoped reflect also available — e.g. sync to CRM
          </span>
        </div>
        <button
          onClick={triggerWorldChanged}
          disabled={disabled || allMemories.length < 3}
          className="rounded-lg bg-red-500/10 px-3 py-1.5 font-mono text-[11px] font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-30"
        >
          World Changed
        </button>
        <button
          onClick={resetPlayground}
          disabled={scenarioPlaying}
          className="rounded-lg bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/30 transition-all hover:bg-white/10 hover:text-white/50 disabled:opacity-30"
        >
          Reset
        </button>
      </div>

      <div className="flex items-center gap-4 font-mono text-[11px] text-white/40">
        {scenarioPlaying && (
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all hover:bg-white/5"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full transition-colors ${
                autoPlay ? 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.4)]' : 'bg-white/20'
              }`}
            />
            <span className={`text-[11px] ${autoPlay ? 'text-blue-400' : 'text-white/30'}`}>
              Auto-play
            </span>
          </button>
        )}
        <span>
          Memories: <span className="text-cyan-400">{allMemories.length}</span>
        </span>
        <span>
          Insights: <span className="text-yellow-400">{insights.length}</span>
        </span>
        <span>
          Calls: <span className="text-white/60">{conversations.length}</span>
        </span>
      </div>
    </div>
  );
}
