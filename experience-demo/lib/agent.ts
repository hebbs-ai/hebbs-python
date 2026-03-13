'use client';

import { useCallback, useRef } from 'react';
import { usePlaygroundStore } from './store';
import {
  hebbsRemember,
  hebbsRecall,
  hebbsPrime,
  hebbsRevise,
  hebbsReflect,
  hebbsInsights,
  hebbsResetSession,
  chatComplete,
} from './api-client';
import { resetSessionId } from './session';
import { SCENARIOS } from './scenarios';
import type {
  InspectorEvent,
  Memory,
  RecallResult,
  ChatMessage,
} from './types';

let eventCounter = 0;

function makeEventId(): string {
  return `evt_${Date.now()}_${++eventCounter}`;
}

function makeMsgId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

const SYSTEM_PROMPT = `You are Atlas, an experienced B2B SaaS sales agent for HEBBS — a cognitive memory engine for AI agents. You're having a conversation with a prospect.

Your personality: Professional but warm. You listen more than you talk. You ask smart follow-up questions. You connect what the prospect says to value propositions naturally. You never oversell.

HEBBS key value propositions:
- Sub-10ms recall latency at any scale
- Multi-strategy recall (similarity, temporal, causal, analogical) — not just vector search
- Automatic insight generation via reflect() — the agent learns patterns
- Belief revision via revise() — when facts change, knowledge updates cascade
- GDPR-compliant forget() — one call deletes everything for an entity
- Simple SDK: remember(), recall(), reflect() — the entire API

IMPORTANT INSTRUCTIONS:
- Keep responses concise (2-4 sentences max).
- Reference specific details from the recalled context when available.
- If you have insights from reflect(), weave them naturally into your response.
- If no prior context exists, give a genuine, generic response — don't pretend to know things you don't.
- Never mention HEBBS internals (recall, remember, reflect) to the prospect — those are your tools, not theirs.

CROSS-ENTITY CONTEXT RULES:
- You may receive two types of recalled context: "This prospect's history" and "Patterns from other prospects."
- ONLY reference specific details (names, companies, quotes) from THIS prospect's history.
- Patterns from other prospects are for YOUR strategic awareness only — use them to inform your approach (e.g. anticipate objections, prepare rebuttals) but NEVER cite them directly or reveal that you have information from other conversations.
- If you only have cross-entity patterns and no history for the current prospect, treat this as a first interaction — do NOT pretend to know them.`;

function formatRecallContext(
  ownResults: RecallResult[],
  crossEntityResults: RecallResult[],
): string {
  if (ownResults.length === 0 && crossEntityResults.length === 0) return '';

  const parts: string[] = [];

  if (ownResults.length > 0) {
    const lines = ownResults.map((r, i) => {
      const strategies = r.strategyDetails.map((sd) => sd.strategy).join(', ');
      return `[${i + 1}] (score: ${r.score.toFixed(3)}, via: ${strategies}) ${r.memory.content}`;
    });
    parts.push(`\n\nThis prospect's history:\n${lines.join('\n')}`);
  }

  if (crossEntityResults.length > 0) {
    const lines = crossEntityResults.map((r, i) => {
      const entity = (r.memory.entityId || 'unknown').replace(/^demo_\d+_/, '');
      return `[${i + 1}] (score: ${r.score.toFixed(3)}, from: ${entity}) ${r.memory.content}`;
    });
    parts.push(`\n\nPatterns from other prospects (DO NOT cite directly):\n${lines.join('\n')}`);
  }

  return parts.join('');
}

function formatInsightsContext(insights: Memory[]): string {
  if (insights.length === 0) return '';
  const lines = insights.map((ins, i) => `[insight ${i + 1}] ${ins.content}`);
  return `\n\nLearned insights:\n${lines.join('\n')}`;
}

function extractMemoryContent(
  userMessage: string,
  agentResponse: string,
): { content: string; importance: number; context: Record<string, unknown> }[] {
  const memories: { content: string; importance: number; context: Record<string, unknown> }[] = [];

  const importantPatterns = [
    { pattern: /(?:budget|pricing|cost|price|\$\d)/i, topic: 'pricing', importance: 0.8 },
    { pattern: /(?:competitor|versus|vs|compared to|alternative)/i, topic: 'competition', importance: 0.85 },
    { pattern: /(?:deadline|timeline|q[1-4]|by (?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))/i, topic: 'timeline', importance: 0.75 },
    { pattern: /(?:decision maker|cto|ceo|vp|head of|director)/i, topic: 'stakeholder', importance: 0.8 },
    { pattern: /(?:pain point|problem|challenge|struggle|frustration|drowning)/i, topic: 'pain_point', importance: 0.9 },
    { pattern: /(?:requirement|need|must have|non-negotiable|critical|blocker)/i, topic: 'requirement', importance: 0.85 },
    { pattern: /(?:sso|security|compliance|gdpr|hipaa|audit|encryption)/i, topic: 'security', importance: 0.8 },
    { pattern: /(?:roi|return on investment|value|savings|justify)/i, topic: 'roi', importance: 0.8 },
    { pattern: /(?:latency|speed|performance|real-time|sub-\d+ms)/i, topic: 'performance', importance: 0.7 },
    { pattern: /(?:zendesk|pinecone|redis|mem0|competitorx)/i, topic: 'tools', importance: 0.75 },
  ];

  const matchedTopics: string[] = [];
  let maxImportance = 0.5;

  for (const { pattern, topic, importance } of importantPatterns) {
    if (pattern.test(userMessage)) {
      matchedTopics.push(topic);
      maxImportance = Math.max(maxImportance, importance);
    }
  }

  if (matchedTopics.length > 0 || userMessage.length > 30) {
    memories.push({
      content: `Prospect said: "${userMessage.slice(0, 200)}"`,
      importance: maxImportance,
      context: {
        topics: matchedTopics.length > 0 ? matchedTopics.join(', ') : 'general',
        stage: 'discovery',
        sentiment: userMessage.includes('?') ? 'inquiry' : 'statement',
      },
    });
  }

  const agentInsights = [
    { pattern: /(?:mentioned|said|told|shared|discussed)/i, importance: 0.6 },
    { pattern: /(?:interested in|excited about|concerned about)/i, importance: 0.7 },
  ];

  for (const { pattern, importance } of agentInsights) {
    if (pattern.test(agentResponse) && agentResponse.length > 40) {
      memories.push({
        content: `Agent noted: "${agentResponse.slice(0, 200)}"`,
        importance,
        context: { source: 'agent_observation', stage: 'discovery' },
      });
      break;
    }
  }

  return memories;
}

function stripEntityPrefix(entityId: string): string {
  return entityId.replace(/^demo_\d+_/, '');
}

export function useAgent() {
  const abortRef = useRef<AbortController | null>(null);
  const store = usePlaygroundStore;

  const addInspectorEvent = useCallback(
    (event: Omit<InspectorEvent, 'id' | 'timestamp'>) => {
      store.getState().addInspectorEvent({
        ...event,
        id: makeEventId(),
        timestamp: Date.now(),
      });
    },
    [store],
  );

  // Recall: entity-scoped (all strategies) + global (similarity only, cross-entity).
  // Separates own-entity results from cross-entity patterns.
  const doRecall = useCallback(
    async (cue: string, entityId: string, strategies: string[] = ['similarity', 'temporal']) => {
      try {
        const startTime = performance.now();

        const [globalResp, entityResp] = await Promise.allSettled([
          hebbsRecall({ cue, strategies: ['similarity'], topK: 5 }),
          hebbsRecall({ cue, strategies, topK: 5, entityId }),
        ]);

        const globalResults = globalResp.status === 'fulfilled' ? globalResp.value.data.results : [];
        const entityResults = entityResp.status === 'fulfilled' ? entityResp.value.data.results : [];
        const latencyMs = globalResp.status === 'fulfilled'
          ? globalResp.value._meta.latencyMs
          : (performance.now() - startTime);

        // Entity-scoped results are the "own" results (deduplicated)
        const ownIds = new Set<string>();
        const ownResults: RecallResult[] = [];
        for (const r of entityResults) {
          if (!ownIds.has(r.memory.id)) {
            ownIds.add(r.memory.id);
            ownResults.push(r);
          }
        }

        // Global results that are NOT from the current entity are cross-entity patterns
        const crossEntityResults: RecallResult[] = [];
        for (const r of globalResults) {
          if (!ownIds.has(r.memory.id) && r.memory.entityId !== entityId) {
            crossEntityResults.push(r);
          }
        }
        crossEntityResults.sort((a, b) => b.score - a.score);
        const topCrossEntity = crossEntityResults.slice(0, 3);

        // Combined results for the merged view (own first, then cross-entity)
        const allResults = [...ownResults, ...topCrossEntity].slice(0, 5);

        const strategyErrors = entityResp.status === 'fulfilled'
          ? entityResp.value.data.strategyErrors
          : [];

        const strippedEntityId = stripEntityPrefix(entityId);
        addInspectorEvent({
          operation: 'recall',
          latencyMs,
          content: cue,
          data: {
            type: 'recall',
            cue,
            entityId: strippedEntityId,
            results: ownResults,
            crossEntityResults: topCrossEntity,
            strategyErrors,
            strategies,
          },
        });
        store.getState().recordLatency('recall', latencyMs);
        return { results: allResults, ownResults, crossEntityResults: topCrossEntity, strategyErrors };
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'HEBBS server unavailable';
        addInspectorEvent({
          operation: 'recall',
          latencyMs: 0,
          data: {
            type: 'recall',
            cue,
            entityId: stripEntityPrefix(entityId),
            results: [],
            crossEntityResults: [],
            strategyErrors: [{ strategy: 'all', message: errMsg }],
            strategies,
          },
        });
        return { results: [], ownResults: [], crossEntityResults: [], strategyErrors: [{ strategy: 'all', message: errMsg }] };
      }
    },
    [addInspectorEvent],
  );

  const doRemember = useCallback(
    async (
      content: string,
      importance: number,
      context: Record<string, unknown>,
      entityId: string,
      conversationIndex: number,
    ) => {
      try {
        const response = await hebbsRemember({ content, importance, context, entityId });

        addInspectorEvent({
          operation: 'remember',
          latencyMs: response._meta.latencyMs,
          memoryId: response.data.id,
          content: content,
          data: { type: 'remember', memory: response.data },
        });
        store.getState().recordLatency('remember', response._meta.latencyMs);
        store.getState().addMemoryToTimeline(conversationIndex, response.data);
        return response.data;
      } catch (err) {
        // Still show the remember event in inspector as failed
        const errMsg = err instanceof Error ? err.message : 'Failed to store memory';
        const fallbackMemory: Memory = {
          id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          content,
          importance,
          context,
          entityId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          accessCount: 0,
          decayScore: 1.0,
          kind: 'EPISODE',
        };
        addInspectorEvent({
          operation: 'remember',
          latencyMs: 0,
          data: {
            type: 'remember',
            memory: { ...fallbackMemory, context: { ...context, _error: errMsg } },
          },
        });
        // Still add to timeline so dots appear
        store.getState().addMemoryToTimeline(conversationIndex, fallbackMemory);
        return fallbackMemory;
      }
    },
    [addInspectorEvent],
  );

  const doPrime = useCallback(
    async (entityId: string) => {
      try {
        const response = await hebbsPrime({ entityId, maxMemories: 20 });
        addInspectorEvent({
          operation: 'prime',
          latencyMs: response._meta.latencyMs,
          data: {
            type: 'prime',
            entityId: stripEntityPrefix(entityId),
            results: response.data.results,
            temporalCount: response.data.temporalCount,
            similarityCount: response.data.similarityCount,
          },
        });
        return response.data;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to prime';
        addInspectorEvent({
          operation: 'prime',
          latencyMs: 0,
          data: {
            type: 'prime',
            entityId: stripEntityPrefix(entityId),
            results: [],
            temporalCount: 0,
            similarityCount: 0,
          },
        });
        console.warn('Prime failed:', errMsg);
        return null;
      }
    },
    [addInspectorEvent],
  );

  const doReflect = useCallback(
    async (entityId?: string) => {
      try {
        const response = await hebbsReflect({ entityId });
        addInspectorEvent({
          operation: 'reflect',
          latencyMs: response._meta.latencyMs,
          data: {
            type: 'reflect',
            entityId: entityId ? stripEntityPrefix(entityId) : undefined,
            insightsCreated: response.data.insightsCreated,
            clustersFound: response.data.clustersFound,
            clustersProcessed: response.data.clustersProcessed,
            memoriesProcessed: response.data.memoriesProcessed,
          },
        });
        store.getState().recordLatency('reflect', response._meta.latencyMs);

        // Fetch and display new insights
        if (response.data.insightsCreated > 0) {
          try {
            const insightsResp = await hebbsInsights({ entityId, maxResults: 10 });
            for (const ins of insightsResp.data) {
              const existing = store.getState().insights;
              if (!existing.find((e) => e.id === ins.id)) {
                store.getState().addInsight({
                  id: ins.id,
                  content: ins.content,
                  sourceMemoryIds: [],
                  createdAfterConversation: store.getState().currentConversationIndex,
                });
              }
            }
          } catch {
            // Insight fetch failed, reflect result already shown
          }
        }

        return response.data;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to reflect';
        addInspectorEvent({
          operation: 'reflect',
          latencyMs: 0,
          data: {
            type: 'reflect',
            entityId: entityId ? stripEntityPrefix(entityId) : undefined,
            insightsCreated: 0,
            clustersFound: 0,
            clustersProcessed: 0,
            memoriesProcessed: 0,
          },
        });
        console.warn('Reflect failed:', errMsg);
        return null;
      }
    },
    [addInspectorEvent],
  );

  const doRevise = useCallback(
    async (memoryId: string, content: string, entityId?: string) => {
      try {
        const response = await hebbsRevise({ memoryId, content, entityId });
        addInspectorEvent({
          operation: 'revise',
          latencyMs: response._meta.latencyMs,
          memoryId: response.data.id,
          content: content,
          data: {
            type: 'revise',
            memory: response.data,
            revisedContent: content,
          },
        });
        return response.data;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to revise';
        addInspectorEvent({
          operation: 'revise',
          latencyMs: 0,
          data: {
            type: 'revise',
            memory: {
              id: memoryId,
              content: content,
              importance: 0,
              context: { _error: errMsg },
              createdAt: '',
              updatedAt: '',
              lastAccessedAt: '',
              accessCount: 0,
              decayScore: 0,
              kind: 'REVISION',
            },
            revisedContent: content,
          },
        });
        console.warn('Revise failed:', errMsg);
        return null;
      }
    },
    [addInspectorEvent],
  );

  const generateResponse = useCallback(
    async (
      userMessage: string,
      ownResults: RecallResult[],
      crossEntityResults: RecallResult[],
      insightMemories: Memory[],
      conversationHistory: ChatMessage[],
    ): Promise<string> => {
      const recallStr = formatRecallContext(ownResults, crossEntityResults);
      const insightStr = formatInsightsContext(insightMemories);
      const systemPromptWithContext = SYSTEM_PROMPT + recallStr + insightStr;

      const chatMessages = conversationHistory
        .filter((m) => m.role !== 'system')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));
      chatMessages.push({ role: 'user', content: userMessage });

      try {
        const result = await chatComplete({
          messages: chatMessages,
          systemPrompt: systemPromptWithContext,
        });
        return result.content;
      } catch {
        return "I appreciate you reaching out! I'd love to help you explore how HEBBS can work for your use case. Could you tell me more about what you're building?";
      }
    },
    [],
  );

  const processTurn = useCallback(
    async (userMessage: string, entityId: string, conversationIndex: number) => {
      const state = store.getState();
      state.setProcessing(true);

      try {
        // 1. Recall relevant memories (entity-scoped + cross-entity, separated)
        const recalled = await doRecall(userMessage, entityId);

        // 2. Fetch insights (entity-scoped + global for cross-entity learning)
        const insightMemories: Memory[] = [];
        try {
          const [entResp, globalResp] = await Promise.allSettled([
            hebbsInsights({ entityId, maxResults: 5 }),
            hebbsInsights({ maxResults: 5 }),
          ]);
          const entData = entResp.status === 'fulfilled' ? entResp.value.data : [];
          const glData = globalResp.status === 'fulfilled' ? globalResp.value.data : [];
          const seen = new Set<string>();
          for (const ins of [...entData, ...glData]) {
            if (!seen.has(ins.id)) {
              seen.add(ins.id);
              insightMemories.push(ins);
            }
          }
        } catch {
          // Insights unavailable
        }

        // 3. Generate LLM response with separated own vs cross-entity context
        const agentResponse = await generateResponse(
          userMessage,
          recalled.ownResults,
          recalled.crossEntityResults,
          insightMemories,
          state.messages,
        );

        // 4. Add assistant message
        store.getState().addMessage({
          id: makeMsgId(),
          role: 'assistant',
          content: agentResponse,
          timestamp: Date.now(),
          conversationIndex,
        });

        // 5. Extract and remember key information
        const toRemember = extractMemoryContent(userMessage, agentResponse);
        for (const mem of toRemember) {
          await doRemember(mem.content, mem.importance, mem.context, entityId, conversationIndex);
        }
      } finally {
        store.getState().setProcessing(false);
      }
    },
    [doRecall, doRemember, generateResponse],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const state = store.getState();
      const conversationIndex = state.currentConversationIndex;

      if (state.conversations.length === 0) {
        state.startConversation('Free Chat', `free_${state.entityPrefix}`);
      }

      const entityId =
        state.conversations[conversationIndex]?.entityId || `free_${state.entityPrefix}`;

      state.addMessage({
        id: makeMsgId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
        conversationIndex,
      });

      await processTurn(text, entityId, conversationIndex);
    },
    [processTurn],
  );

  const waitForUnpause = useCallback(
    async (signal: AbortSignal) => {
      while (store.getState().scenarioPaused) {
        await new Promise((r) => setTimeout(r, 200));
        if (signal.aborted) break;
      }
    },
    [],
  );

  const stepPause = useCallback(
    async (label: string, progress: { current: number; total: number }, signal: AbortSignal) => {
      if (signal.aborted) return;
      const s = store.getState();
      s.setScenarioStepLabel(label);
      s.setScenarioProgress(progress);

      if (!s.autoPlay) {
        s.setScenarioPaused(true);
        await waitForUnpause(signal);
      } else {
        await new Promise((r) => setTimeout(r, 4000));
      }
    },
    [waitForUnpause],
  );

  const playScenario = useCallback(
    async (scenarioId: string) => {
      const scenario = SCENARIOS[scenarioId];
      if (!scenario) return;

      try { await hebbsResetSession(); } catch { /* best-effort */ }
      resetSessionId();
      store.getState().reset();
      await new Promise((r) => setTimeout(r, 100));

      store.getState().setActiveScenario(scenario.name);
      store.getState().setScenarioPlaying(true);

      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;

      const totalTurns = scenario.conversations.reduce(
        (sum, conv) => sum + conv.turns.filter((t) => t.role !== 'system-label').length,
        0,
      );
      let turnCounter = 0;

      try {
        for (let convIdx = 0; convIdx < scenario.conversations.length; convIdx++) {
          if (signal.aborted) break;

          const conv = scenario.conversations[convIdx];
          const entityId = `${store.getState().entityPrefix}${conv.entityId}`;

          if (convIdx > 0) {
            addInspectorEvent({
              operation: 'recall',
              latencyMs: 0,
              data: {
                type: 'recall',
                cue: `── ${conv.label} ──`,
                results: [],
                crossEntityResults: [],
                strategyErrors: [],
                strategies: [],
              },
            });
          }

          store.getState().startConversation(conv.label, entityId);

          if (convIdx > 0 && conv.label.includes('later')) {
            await doPrime(entityId);
          }

          for (const turn of conv.turns) {
            if (signal.aborted) break;

            await new Promise((r) => setTimeout(r, turn.delayMs || 1500));
            if (signal.aborted) break;

            if (turn.role === 'system-label') {
              store.getState().addMessage({
                id: makeMsgId(),
                role: 'system',
                content: turn.content,
                timestamp: Date.now(),
                conversationIndex: convIdx,
              });
              continue;
            }

            store.getState().addMessage({
              id: makeMsgId(),
              role: 'user',
              content: turn.content,
              timestamp: Date.now(),
              conversationIndex: convIdx,
            });

            await processTurn(turn.content, entityId, convIdx);
            if (signal.aborted) break;

            turnCounter++;
            await stepPause(conv.label, { current: turnCounter, total: totalTurns }, signal);
            if (signal.aborted) break;
          }

          if (conv.reflectAfter && !signal.aborted) {
            await new Promise((r) => setTimeout(r, 1000));
            store.getState().markConversationReflected(convIdx);
            await doReflect();

            await stepPause(
              'Reflect complete',
              { current: turnCounter, total: totalTurns },
              signal,
            );
            if (signal.aborted) break;
          }

          if (convIdx < scenario.conversations.length - 1) {
            store.getState().incrementConversation();

            const nextConv = scenario.conversations[convIdx + 1];
            await stepPause(
              `Next: ${nextConv.label}`,
              { current: turnCounter, total: totalTurns },
              signal,
            );
            if (signal.aborted) break;
          }
        }
      } finally {
        const s = store.getState();
        s.setScenarioPlaying(false);
        s.setScenarioStepLabel(null);
        s.setScenarioProgress(null);
        s.setScenarioPaused(false);
      }
    },
    [processTurn, doReflect, doPrime, addInspectorEvent, stepPause],
  );

  const triggerReflect = useCallback(async () => {
    store.getState().setProcessing(true);
    try {
      const convIdx = store.getState().currentConversationIndex;
      store.getState().markConversationReflected(convIdx);
      await doReflect();
    } finally {
      store.getState().setProcessing(false);
    }
  }, [doReflect]);

  const triggerWorldChanged = useCallback(async () => {
    store.getState().setProcessing(true);
    try {
      const memories = store.getState().allMemories;
      const competitorMemory = memories.find(
        (m) =>
          m.content.toLowerCase().includes('competitor') ||
          m.content.toLowerCase().includes('sso') ||
          m.content.toLowerCase().includes("doesn't support"),
      );

      if (competitorMemory) {
        await doRevise(
          competitorMemory.id,
          'CompetitorX now supports SSO as of their latest release. Previous positioning around SSO gap is no longer valid.',
          competitorMemory.entityId,
        );
      } else if (memories.length > 0) {
        const oldest = memories[0];
        await doRevise(
          oldest.id,
          'Market conditions have changed. Previous competitive analysis needs updating — CompetitorX has closed their feature gap on authentication.',
          oldest.entityId,
        );
      }

      await new Promise((r) => setTimeout(r, 500));
      await doReflect();
    } finally {
      store.getState().setProcessing(false);
    }
  }, [doRevise, doReflect]);

  const advanceScenario = useCallback(() => {
    store.getState().setScenarioPaused(false);
  }, []);

  const resetPlayground = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    try {
      await hebbsResetSession();
    } catch {
      // Best-effort — session may already be gone
    }
    resetSessionId();
    store.getState().reset();
  }, []);

  return {
    sendMessage,
    playScenario,
    advanceScenario,
    triggerReflect,
    triggerWorldChanged,
    resetPlayground,
  };
}
