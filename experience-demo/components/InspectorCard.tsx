'use client';

import { motion } from 'framer-motion';
import type {
  InspectorEvent,
  RememberEventData,
  RecallEventData,
  ReflectEventData,
  ReviseEventData,
  ForgetEventData,
  PrimeEventData,
  OperationType,
} from '@/lib/types';

const OP_LABELS: Record<OperationType, string> = {
  remember: 'REMEMBER',
  recall: 'RECALL',
  reflect: 'REFLECT',
  revise: 'REVISE',
  forget: 'FORGET',
  prime: 'PRIME',
};

const OP_COLORS: Record<OperationType, string> = {
  remember: '#22c55e',
  recall: '#3b82f6',
  reflect: '#f59e0b',
  revise: '#ef4444',
  forget: '#6b7280',
  prime: '#8b5cf6',
};

function LatencyBadge({ ms }: { ms: number }) {
  const isFast = ms < 5;
  return (
    <span
      className={`font-mono text-sm font-bold ${isFast ? 'latency-fast text-green-400' : 'text-white'}`}
    >
      {ms.toFixed(1)}ms
    </span>
  );
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

function RememberCard({ data, latencyMs }: { data: RememberEventData; latencyMs: number }) {
  const entityDisplay = (data.memory.entityId || 'default').replace(/^demo_\d+_/, '');
  const hasError = data.memory.context && '_error' in data.memory.context;
  const ctx = data.memory.context || {};
  const topics = String(ctx.topics || '').split(', ').filter(Boolean);
  const source = String(ctx.source || '');
  const isAgentNote = source === 'agent_observation';

  const summary = isAgentNote
    ? 'Agent observation stored'
    : topics.length > 0 && topics[0] !== 'general'
      ? `Extracted ${topics.join(', ')} signal${topics.length > 1 ? 's' : ''}`
      : 'Stored conversation context';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <OpBadge operation="remember" />
        {hasError ? (
          <span className="text-[11px] text-red-400/60">⚠ stored locally</span>
        ) : (
          <LatencyBadge ms={latencyMs} />
        )}
      </div>
      <p className="text-[12px] font-medium text-green-400/80">{summary}</p>
      {data.memory.id && (
        <div className="mt-1 font-mono text-[10px] text-white/20 uppercase tracking-tight">
          ID: {data.memory.id}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <MetaTag label="importance" value={data.memory.importance.toFixed(2)} color="#22c55e" />
        <MetaTag label="entity" value={entityDisplay} />
        {data.memory.kind !== 'UNSPECIFIED' && (
          <MetaTag label="kind" value={data.memory.kind} />
        )}
        {topics.length > 0 && topics[0] !== 'general' && topics.map((t) => (
          <MetaTag key={t} label="signal" value={t} color="#4ade80" />
        ))}
      </div>
      <p className="text-[10px] leading-relaxed text-white/50 border-l border-white/10 pl-2 italic mt-2">
        &quot;{data.memory.content}&quot;
      </p>
    </div>
  );
}

function RecallResultRow({ result, isCrossEntity }: { result: RecallResult; isCrossEntity: boolean }) {
  const entityDisplay = (result.memory.entityId || '').replace(/^demo_\d+_/, '');
  return (
    <div className={`rounded-lg px-2 py-1.5 ${isCrossEntity ? 'bg-purple-500/[0.06] border border-purple-500/10' : 'bg-white/[0.03]'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-white/60 min-w-0 truncate">{truncate(result.memory.content, 55)}</span>
        <span className="font-mono text-[10px] text-blue-400 shrink-0">{result.score.toFixed(3)}</span>
      </div>
      {isCrossEntity && entityDisplay && (
        <span className="text-[9px] font-mono text-purple-400/70 mt-0.5 block">
          cross-entity from {entityDisplay}
        </span>
      )}
    </div>
  );
}

function RecallCard({ data, latencyMs }: { data: RecallEventData; latencyMs: number }) {
  // Conversation separator (no cue, no strategies)
  if (data.strategies.length === 0 && data.results.length === 0 && data.strategyErrors.length === 0) {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] font-medium tracking-wider text-white/25">{data.cue}</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
    );
  }

  const allResults = [...data.results, ...data.crossEntityResults];
  const strategyHits: Record<string, number> = {};
  for (const r of allResults) {
    for (const sd of r.strategyDetails) {
      strategyHits[sd.strategy] = (strategyHits[sd.strategy] || 0) + 1;
    }
  }

  const hasError = data.strategyErrors.some((e) => e.message !== '');
  const isFirstCall = allResults.length === 0 && !hasError;
  const hasCrossEntity = data.crossEntityResults.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <OpBadge operation="recall" />
        <LatencyBadge ms={latencyMs} />
      </div>
      <p className="text-[11px] text-white/50">
        cue: &quot;{truncate(data.cue, 60)}&quot;
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(strategyHits).map(([strategy, count]) => (
          <MetaTag key={strategy} label={strategy} value={`${count} hits`} color="#3b82f6" />
        ))}
        {allResults.length > 0 && (
          <MetaTag label="total" value={`${allResults.length} results`} color="#3b82f6" />
        )}
        {isFirstCall && (
          <span className="text-[11px] italic text-white/30">no prior context — first interaction</span>
        )}
        {hasError && (
          <span className="text-[11px] italic text-red-400/60">
            ⚠ {data.strategyErrors[0]?.message || 'recall failed'}
          </span>
        )}
      </div>

      {/* Own-entity results */}
      {data.results.length > 0 && (
        <div className="space-y-1">
          {hasCrossEntity && (
            <span className="text-[9px] font-semibold uppercase tracking-widest text-white/25">
              {data.entityId || 'this prospect'}
            </span>
          )}
          {data.results.slice(0, 3).map((r, i) => (
            <RecallResultRow key={`own-${i}`} result={r} isCrossEntity={false} />
          ))}
          {data.results.length > 3 && (
            <span className="text-[10px] text-white/30">+{data.results.length - 3} more</span>
          )}
        </div>
      )}

      {/* Cross-entity results */}
      {hasCrossEntity && (
        <div className="space-y-1 mt-1">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-purple-400/50">
            cross-entity patterns
          </span>
          {data.crossEntityResults.slice(0, 2).map((r, i) => (
            <RecallResultRow key={`cross-${i}`} result={r} isCrossEntity={true} />
          ))}
          {data.crossEntityResults.length > 2 && (
            <span className="text-[10px] text-white/30">+{data.crossEntityResults.length - 2} more</span>
          )}
        </div>
      )}
    </div>
  );
}

function ReflectCard({ data, latencyMs }: { data: ReflectEventData; latencyMs: number }) {
  const scope = data.entityId || 'global';
  const isGlobal = !data.entityId;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <OpBadge operation="reflect" />
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${
              isGlobal
                ? 'bg-amber-500/10 text-amber-400/70'
                : 'bg-purple-500/10 text-purple-400/70'
            }`}
          >
            {scope}
          </span>
        </div>
        <LatencyBadge ms={latencyMs} />
      </div>
      <div className="flex flex-wrap gap-2">
        <MetaTag label="memories" value={String(data.memoriesProcessed)} color="#f59e0b" />
        <MetaTag label="clusters" value={String(data.clustersFound)} color="#f59e0b" />
        <MetaTag label="insights" value={String(data.insightsCreated)} color="#ffc857" />
      </div>
      {data.insightsCreated > 0 && (
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="insight-star text-yellow-400">★</span>
          <span className="text-white/60">
            {data.memoriesProcessed} memories → {data.clustersFound} clusters → {data.insightsCreated} insights
          </span>
        </div>
      )}
    </div>
  );
}

function ReviseCard({ data, latencyMs }: { data: ReviseEventData; latencyMs: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <OpBadge operation="revise" />
        <LatencyBadge ms={latencyMs} />
      </div>
      <p className="text-xs text-white/70">{truncate(data.revisedContent, 120)}</p>
      <div className="mt-1 font-mono text-[10px] text-white/20 uppercase tracking-tight">
        REVISED ID: {data.memory.id}
      </div>
      <MetaTag label="memory" value={data.memory.id.slice(0, 12) + '…'} />
    </div>
  );
}

function ForgetCard({ data, latencyMs }: { data: ForgetEventData; latencyMs: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <OpBadge operation="forget" />
        <LatencyBadge ms={latencyMs} />
      </div>
      <div className="flex flex-wrap gap-2">
        <MetaTag label="forgotten" value={String(data.forgottenCount)} color="#6b7280" />
        {data.cascadeCount > 0 && (
          <MetaTag label="cascaded" value={String(data.cascadeCount)} color="#ef4444" />
        )}
      </div>
    </div>
  );
}

function PrimeCard({ data, latencyMs }: { data: PrimeEventData; latencyMs: number }) {
  const entityDisplay = data.entityId.replace(/^demo_\d+_/, '');
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <OpBadge operation="prime" />
        <LatencyBadge ms={latencyMs} />
      </div>
      <div className="flex flex-wrap gap-2">
        <MetaTag label="entity" value={entityDisplay} />
        <MetaTag label="loaded" value={`${data.results.length} memories`} color="#8b5cf6" />
        <MetaTag label="temporal" value={String(data.temporalCount)} />
        <MetaTag label="similarity" value={String(data.similarityCount)} />
      </div>
    </div>
  );
}

function OpBadge({ operation }: { operation: OperationType }) {
  const color = OP_COLORS[operation];
  return (
    <span
      className="rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider uppercase"
      style={{ color, backgroundColor: `${color}15` }}
    >
      {OP_LABELS[operation]}
    </span>
  );
}

function MetaTag({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <span className="flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">
      <span className="text-white/30">{label}</span>
      <span style={{ color: color || 'rgba(255,255,255,0.6)' }}>{value}</span>
    </span>
  );
}

export function InspectorCard({ event }: { event: InspectorEvent }) {
  const renderContent = () => {
    switch (event.data.type) {
      case 'remember':
        return <RememberCard data={event.data} latencyMs={event.latencyMs} />;
      case 'recall':
        return <RecallCard data={event.data} latencyMs={event.latencyMs} />;
      case 'reflect':
        return <ReflectCard data={event.data} latencyMs={event.latencyMs} />;
      case 'revise':
        return <ReviseCard data={event.data} latencyMs={event.latencyMs} />;
      case 'forget':
        return <ForgetCard data={event.data} latencyMs={event.latencyMs} />;
      case 'prime':
        return <PrimeCard data={event.data} latencyMs={event.latencyMs} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="glass-card p-3"
      data-operation={event.operation}
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      layout
    >
      {renderContent()}
    </motion.div>
  );
}
