// Client-side types mirroring @hebbs/sdk types (SDK cannot run in browser due to gRPC)

export type OperationType = 'remember' | 'recall' | 'reflect' | 'revise' | 'forget' | 'prime';

export type MemoryKind = 'EPISODE' | 'INSIGHT' | 'REVISION' | 'UNSPECIFIED';

export interface Memory {
  id: string; // hex-encoded
  content: string;
  importance: number;
  context: Record<string, unknown>;
  entityId?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  accessCount: number;
  decayScore: number;
  kind: MemoryKind;
}

export interface StrategyDetail {
  strategy: string;
  relevance: number;
  distance?: number;
  timestamp?: string;
  rank?: number;
  depth?: number;
  embeddingSimilarity?: number;
  structuralSimilarity?: number;
}

export interface RecallResult {
  memory: Memory;
  score: number;
  strategyDetails: StrategyDetail[];
}

export interface RecallOutput {
  results: RecallResult[];
  strategyErrors: Array<{ strategy: string; message: string }>;
}

export interface PrimeOutput {
  results: RecallResult[];
  temporalCount: number;
  similarityCount: number;
}

export interface ReflectResult {
  insightsCreated: number;
  clustersFound: number;
  clustersProcessed: number;
  memoriesProcessed: number;
}

export interface ForgetResult {
  forgottenCount: number;
  cascadeCount: number;
  tombstoneCount: number;
  truncated: boolean;
}

export interface HealthStatus {
  serving: boolean;
  version: string;
  memoryCount: number;
  uptimeSeconds: number;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  _meta: {
    latencyMs: number;
    operation: OperationType;
  };
}

// Inspector event types
export interface InspectorEvent {
  id: string;
  timestamp: number;
  operation: OperationType;
  latencyMs: number;
  memoryId?: string; // ULID of the primary memory affected
  content?: string;  // Raw content of the memory or cue
  data: RememberEventData | RecallEventData | ReflectEventData | ReviseEventData | ForgetEventData | PrimeEventData;
}

export interface RememberEventData {
  type: 'remember';
  memory: Memory;
}

export interface RecallEventData {
  type: 'recall';
  cue: string;
  entityId?: string; // Current entity — used to label cross-entity results
  results: RecallResult[];
  crossEntityResults: RecallResult[]; // Results from other entities
  strategyErrors: Array<{ strategy: string; message: string }>;
  strategies: string[];
}

export interface ReflectEventData {
  type: 'reflect';
  entityId?: string; // If set, entity-scoped reflect; if absent, global reflect
  insightsCreated: number;
  clustersFound: number;
  clustersProcessed: number;
  memoriesProcessed: number;
}

export interface ReviseEventData {
  type: 'revise';
  memory: Memory;
  revisedContent: string;
}

export interface ForgetEventData {
  type: 'forget';
  forgottenCount: number;
  cascadeCount: number;
}

export interface PrimeEventData {
  type: 'prime';
  entityId: string;
  results: RecallResult[];
  temporalCount: number;
  similarityCount: number;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  conversationIndex: number;
}

// Scenario types
export interface ScenarioTurn {
  role: 'user' | 'system-label';
  content: string;
  delayMs?: number;
}

export interface ScenarioConversation {
  label: string;
  entityId: string;
  turns: ScenarioTurn[];
  reflectAfter?: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  conversations: ScenarioConversation[];
}

// Timeline types
export interface TimelineConversation {
  index: number;
  label: string;
  entityId: string;
  memories: TimelineMemory[];
  reflectedAfter: boolean;
}

export interface TimelineMemory {
  id: string;
  importance: number;
  kind: MemoryKind;
  decayed: boolean;
  content: string;
}

export interface TimelineInsight {
  id: string;
  content: string;
  sourceMemoryIds: string[];
  createdAfterConversation: number;
}

// Latency tracking
export interface LatencyStats {
  remember: number[];
  recall: number[];
  reflect: number[];
}
