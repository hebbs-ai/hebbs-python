'use client';

import { create } from 'zustand';
import type {
  ChatMessage,
  InspectorEvent,
  TimelineConversation,
  TimelineInsight,
  LatencyStats,
  Memory,
} from './types';

interface PlaygroundState {
  // Session
  sessionId: string;
  entityPrefix: string;

  // Chat
  messages: ChatMessage[];
  isProcessing: boolean;
  currentConversationIndex: number;

  // Scenario
  activeScenario: string | null;
  scenarioPlaying: boolean;
  scenarioPaused: boolean;
  autoPlay: boolean;
  scenarioStepLabel: string | null;
  scenarioProgress: { current: number; total: number } | null;

  // Inspector
  inspectorEvents: InspectorEvent[];

  // Timeline
  conversations: TimelineConversation[];
  insights: TimelineInsight[];

  // All memories (for tracking)
  allMemories: Memory[];

  // Latency
  latencyStats: LatencyStats;

  // UI
  showCode: boolean;

  // Actions
  addMessage: (msg: ChatMessage) => void;
  setProcessing: (processing: boolean) => void;
  addInspectorEvent: (event: InspectorEvent) => void;
  addMemoryToTimeline: (conversationIndex: number, memory: Memory) => void;
  addInsight: (insight: TimelineInsight) => void;
  startConversation: (label: string, entityId: string) => void;
  markConversationReflected: (index: number) => void;
  incrementConversation: () => void;
  setActiveScenario: (id: string | null) => void;
  setScenarioPlaying: (playing: boolean) => void;
  setScenarioPaused: (paused: boolean) => void;
  setAutoPlay: (autoPlay: boolean) => void;
  setScenarioStepLabel: (label: string | null) => void;
  setScenarioProgress: (progress: { current: number; total: number } | null) => void;
  setShowCode: (show: boolean) => void;
  recordLatency: (operation: keyof LatencyStats, ms: number) => void;
  reset: () => void;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const initialState = {
  sessionId: generateSessionId(),
  entityPrefix: `demo_${Date.now()}_`,
  messages: [],
  isProcessing: false,
  currentConversationIndex: 0,
  activeScenario: null,
  scenarioPlaying: false,
  scenarioPaused: false,
  autoPlay: false,
  scenarioStepLabel: null,
  scenarioProgress: null,
  inspectorEvents: [],
  conversations: [],
  insights: [],
  allMemories: [],
  latencyStats: { remember: [], recall: [], reflect: [] },
  showCode: false,
};

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  ...initialState,

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  setProcessing: (processing) =>
    set({ isProcessing: processing }),

  addInspectorEvent: (event) =>
    set((s) => ({ inspectorEvents: [...s.inspectorEvents, event] })),

  addMemoryToTimeline: (conversationIndex, memory) =>
    set((s) => {
      const convs = [...s.conversations];
      const conv = convs[conversationIndex];
      if (conv) {
        conv.memories = [
          ...conv.memories,
          {
            id: memory.id,
            importance: memory.importance,
            kind: memory.kind,
            decayed: memory.decayScore < 0.3,
            content: memory.content,
          },
        ];
      }
      return {
        conversations: convs,
        allMemories: [...s.allMemories, memory],
      };
    }),

  addInsight: (insight) =>
    set((s) => ({ insights: [...s.insights, insight] })),

  startConversation: (label, entityId) =>
    set((s) => ({
      conversations: [
        ...s.conversations,
        {
          index: s.conversations.length,
          label,
          entityId,
          memories: [],
          reflectedAfter: false,
        },
      ],
    })),

  markConversationReflected: (index) =>
    set((s) => {
      const convs = [...s.conversations];
      if (convs[index]) {
        convs[index] = { ...convs[index], reflectedAfter: true };
      }
      return { conversations: convs };
    }),

  incrementConversation: () =>
    set((s) => ({ currentConversationIndex: s.currentConversationIndex + 1 })),

  setActiveScenario: (id) =>
    set({ activeScenario: id }),

  setScenarioPlaying: (playing) =>
    set({ scenarioPlaying: playing }),

  setScenarioPaused: (paused) =>
    set({ scenarioPaused: paused }),

  setAutoPlay: (autoPlay) =>
    set((s) => ({
      autoPlay,
      ...(autoPlay && s.scenarioPaused ? { scenarioPaused: false } : {}),
    })),

  setScenarioStepLabel: (label) =>
    set({ scenarioStepLabel: label }),

  setScenarioProgress: (progress) =>
    set({ scenarioProgress: progress }),

  setShowCode: (show) =>
    set({ showCode: show }),

  recordLatency: (operation, ms) =>
    set((s) => {
      const stats = { ...s.latencyStats };
      stats[operation] = [...stats[operation], ms];
      return { latencyStats: stats };
    }),

  reset: () => {
    set({
      ...initialState,
      sessionId: generateSessionId(),
      entityPrefix: `demo_${Date.now()}_`,
    });
  },
}));
