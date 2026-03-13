'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePlaygroundStore } from '@/lib/store';

function MemoryDot({ importance, kind, decayed }: { importance: number; kind: string; decayed: boolean }) {
  const isInsight = kind === 'INSIGHT';
  const size = 6 + importance * 8;

  if (isInsight) {
    return (
      <motion.span
        className="insight-star inline-block text-yellow-400"
        style={{ fontSize: `${size + 4}px` }}
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        ★
      </motion.span>
    );
  }

  return (
    <motion.span
      className="memory-dot inline-block rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: decayed ? 'rgba(6, 182, 212, 0.25)' : '#06b6d4',
        boxShadow: decayed ? 'none' : '0 0 8px rgba(6, 182, 212, 0.3)',
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      title={`importance: ${importance.toFixed(2)}`}
    />
  );
}

function ReflectDivider() {
  return (
    <motion.div
      className="my-2 flex items-center gap-2"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ transformOrigin: 'left' }}
    >
      <div className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
      <span className="font-mono text-[10px] text-amber-500/60">reflect()</span>
      <div className="h-px flex-1 bg-gradient-to-l from-amber-500/40 to-transparent" />
    </motion.div>
  );
}

export function TimelinePanel() {
  const conversations = usePlaygroundStore((s) => s.conversations);
  const insights = usePlaygroundStore((s) => s.insights);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-10 shrink-0 items-center border-b border-glass-border px-4">
        <span className="text-[11px] font-medium tracking-widest uppercase text-white/40">
          Learning Timeline
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {conversations.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-2xl opacity-20">📈</div>
              <p className="text-xs text-white/20">
                Watch knowledge accumulate here
              </p>
              <p className="mt-1 text-[10px] text-white/10">
                Dots = memories, Stars = insights
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {conversations.map((conv) => (
                <motion.div
                  key={conv.index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="text-[11px] text-white/40">{conv.label}</span>
                  </div>
                  <div className="ml-4 flex flex-wrap items-center gap-1.5 py-1">
                    {conv.memories.map((mem) => (
                      <MemoryDot
                        key={mem.id}
                        importance={mem.importance}
                        kind={mem.kind}
                        decayed={mem.decayed}
                      />
                    ))}
                    {conv.memories.length === 0 && (
                      <span className="text-[10px] italic text-white/15">listening…</span>
                    )}
                  </div>
                  {conv.reflectedAfter && <ReflectDivider />}
                </motion.div>
              ))}
            </AnimatePresence>

            {insights.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-[11px] font-medium tracking-widest uppercase text-white/40">
                  Insights
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {insights.map((insight) => (
                      <motion.div
                        key={insight.id}
                        className="glass-card p-2.5"
                        data-operation="reflect"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      >
                        <div className="flex items-start gap-2">
                          <span className="insight-star mt-0.5 text-sm text-yellow-400">★</span>
                          <div>
                            <p className="text-xs italic text-white/70">
                              {insight.content}
                            </p>
                            {insight.sourceMemoryIds.length > 0 && (
                              <p className="mt-1 font-mono text-[9px] text-white/20">
                                ← {insight.sourceMemoryIds.length} source memories
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex shrink-0 items-center gap-4 border-t border-glass-border px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.3)]" />
          <span className="text-[10px] text-white/30">memory</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="insight-star text-xs text-yellow-400">★</span>
          <span className="text-[10px] text-white/30">insight</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-500/25" />
          <span className="text-[10px] text-white/30">decayed</span>
        </div>
      </div>
    </div>
  );
}
