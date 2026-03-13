'use client';

import { usePlaygroundStore } from '@/lib/store';

function computeP99(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * 0.99) - 1;
  return sorted[Math.max(0, idx)];
}

function LatencyPill({ label, values }: { label: string; values: number[] }) {
  const p99 = computeP99(values);
  if (p99 === null) return null;

  const isFast = p99 < 5;
  const isGood = p99 < 10;

  return (
    <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1">
      <span className="font-mono text-[10px] uppercase text-white/30">{label}</span>
      <span
        className={`font-mono text-[11px] font-bold ${
          isFast ? 'latency-fast text-green-400' : isGood ? 'text-green-300' : 'text-yellow-400'
        }`}
      >
        {p99.toFixed(1)}ms
      </span>
    </div>
  );
}

export function LatencyScoreboard() {
  const stats = usePlaygroundStore((s) => s.latencyStats);
  const hasAny =
    stats.remember.length > 0 || stats.recall.length > 0 || stats.reflect.length > 0;

  if (!hasAny) {
    return (
      <div className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
        <span className="font-mono text-[10px] text-white/20">p99 latency</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <LatencyPill label="rem" values={stats.remember} />
      <LatencyPill label="rec" values={stats.recall} />
      <LatencyPill label="ref" values={stats.reflect} />
    </div>
  );
}
