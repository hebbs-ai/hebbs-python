'use client';

import { ChatPanel } from '@/components/ChatPanel';
import { InspectorPanel } from '@/components/InspectorPanel';
import { TimelinePanel } from '@/components/TimelinePanel';
import { BottomBar } from '@/components/BottomBar';
import { LatencyScoreboard } from '@/components/LatencyScoreboard';
import { CodeReveal } from '@/components/CodeReveal';
import { CodePanel } from '@/components/CodePanel';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { usePlaygroundStore } from '@/lib/store';

export default function PlaygroundPage() {
  const showCode = usePlaygroundStore((s) => s.showCode);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-glass-border px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-wide text-white">HEBBS</span>
          <span className="text-xs tracking-widest uppercase text-white/40">Playground</span>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus />
          <LatencyScoreboard />
          <CodeReveal />
        </div>
      </header>

      {/* Three-Panel Layout */}
      <main className="flex min-h-0 flex-1 gap-px">
        <div className="flex w-[35%] min-w-0 flex-col border-r border-glass-border">
          {showCode ? <CodePanel /> : <ChatPanel />}
        </div>
        <div className="flex w-[35%] min-w-0 flex-col border-r border-glass-border">
          <InspectorPanel />
        </div>
        <div className="flex w-[30%] min-w-0 flex-col">
          <TimelinePanel />
        </div>
      </main>

      {/* Bottom Bar */}
      <BottomBar />
    </div>
  );
}
