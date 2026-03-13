'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePlaygroundStore } from '@/lib/store';
import { InspectorCard } from './InspectorCard';

export function InspectorPanel() {
  const events = usePlaygroundStore((s) => s.inspectorEvents);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (nearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [events.length]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-10 shrink-0 items-center border-b border-glass-border px-4">
        <span className="text-[11px] font-medium tracking-widest uppercase text-white/40">
          Engine Inspector
        </span>
        <span className="ml-auto font-mono text-[10px] text-white/20">
          {events.length} operations
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {events.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-2xl opacity-20">⚡</div>
              <p className="text-xs text-white/20">
                HEBBS operations will appear here in real-time
              </p>
              <p className="mt-1 text-[10px] text-white/10">
                Start a scenario or type a message to see the engine at work
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {events.map((event) => (
                <InspectorCard key={event.id} event={event} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
