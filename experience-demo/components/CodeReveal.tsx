'use client';

import { usePlaygroundStore } from '@/lib/store';

export function CodeReveal() {
  const showCode = usePlaygroundStore((s) => s.showCode);
  const setShowCode = usePlaygroundStore((s) => s.setShowCode);

  return (
    <button
      onClick={() => setShowCode(!showCode)}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
        showCode
          ? 'bg-white/10 text-white/70'
          : 'bg-white/5 text-white/30 hover:bg-white/8 hover:text-white/50'
      }`}
    >
      <span className="font-mono">&lt; /&gt;</span>
      <span>Code</span>
    </button>
  );
}
