import type {
  Memory,
  RecallOutput,
  PrimeOutput,
  ReflectResult,
  ForgetResult,
  HealthStatus,
  ApiResponse,
} from './types';
import { getSessionId } from './session';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const sessionId = getSessionId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Session-Id': sessionId,
  };

  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return res.json();
}

export async function hebbsRemember(params: {
  content: string;
  importance?: number;
  context?: Record<string, unknown>;
  entityId?: string;
}): Promise<ApiResponse<Memory>> {
  return apiFetch<Memory>('/api/hebbs/remember', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function hebbsRecall(params: {
  cue: string;
  strategies?: string[];
  topK?: number;
  entityId?: string;
}): Promise<ApiResponse<RecallOutput>> {
  return apiFetch<RecallOutput>('/api/hebbs/recall', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function hebbsPrime(params: {
  entityId: string;
  maxMemories?: number;
  similarityCue?: string;
}): Promise<ApiResponse<PrimeOutput>> {
  return apiFetch<PrimeOutput>('/api/hebbs/prime', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function hebbsRevise(params: {
  memoryId: string;
  content?: string;
  importance?: number;
  context?: Record<string, unknown>;
  entityId?: string;
}): Promise<ApiResponse<Memory>> {
  return apiFetch<Memory>('/api/hebbs/revise', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function hebbsForget(params: {
  entityId?: string;
  memoryIds?: string[];
}): Promise<ApiResponse<ForgetResult>> {
  return apiFetch<ForgetResult>('/api/hebbs/forget', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function hebbsReflect(params: {
  entityId?: string;
}): Promise<ApiResponse<ReflectResult>> {
  return apiFetch<ReflectResult>('/api/hebbs/reflect', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function hebbsInsights(params?: {
  entityId?: string;
  maxResults?: number;
}): Promise<ApiResponse<Memory[]>> {
  const searchParams = new URLSearchParams();
  if (params?.entityId) searchParams.set('entityId', params.entityId);
  if (params?.maxResults) searchParams.set('maxResults', String(params.maxResults));
  const qs = searchParams.toString();
  return apiFetch<Memory[]>(`/api/hebbs/insights${qs ? `?${qs}` : ''}`);
}

export async function hebbsHealth(): Promise<ApiResponse<HealthStatus>> {
  return apiFetch<HealthStatus>('/api/hebbs/health');
}

export async function hebbsResetSession(): Promise<ApiResponse<{ destroyed: boolean }>> {
  return apiFetch<{ destroyed: boolean }>('/api/hebbs/reset-session', {
    method: 'POST',
  });
}

export async function chatComplete(params: {
  messages: Array<{ role: string; content: string }>;
  systemPrompt?: string;
}): Promise<{ content: string; latencyMs: number }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Chat API error ${res.status}: ${body}`);
  }

  return res.json();
}
