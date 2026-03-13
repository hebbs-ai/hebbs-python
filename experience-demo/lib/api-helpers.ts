import { NextRequest, NextResponse } from 'next/server';
import type { OperationType } from './types';
import { getHebbsForSession, getHealthClient } from './hebbs-singleton';

const DEFAULT_SESSION = 'default';

export function extractSessionId(req: NextRequest): string {
  return req.headers.get('x-session-id') || DEFAULT_SESSION;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSessionHebbs(req: NextRequest): Promise<any> {
  const sessionId = extractSessionId(req);
  return getHebbsForSession(sessionId);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSharedHealthClient(): Promise<any> {
  return getHealthClient();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeMemory(memory: any) {
  const kindMap: Record<string, string> = {
    EPISODE: 'EPISODE',
    INSIGHT: 'INSIGHT',
    REVISION: 'REVISION',
    '0': 'UNSPECIFIED',
    '1': 'EPISODE',
    '2': 'INSIGHT',
    '3': 'REVISION',
  };

  return {
    id: Buffer.isBuffer(memory.id) ? memory.id.toString('hex') : String(memory.id),
    content: memory.content,
    importance: memory.importance,
    context: memory.context || {},
    entityId: memory.entityId,
    createdAt: memory.createdAt instanceof Date ? memory.createdAt.toISOString() : String(memory.createdAt),
    updatedAt: memory.updatedAt instanceof Date ? memory.updatedAt.toISOString() : String(memory.updatedAt),
    lastAccessedAt: memory.lastAccessedAt instanceof Date ? memory.lastAccessedAt.toISOString() : String(memory.lastAccessedAt),
    accessCount: memory.accessCount,
    decayScore: memory.decayScore,
    kind: kindMap[String(memory.kind)] || 'UNSPECIFIED',
  };
}

export function apiSuccess<T>(data: T, latencyMs: number, operation: OperationType) {
  return NextResponse.json({
    data,
    _meta: { latencyMs: Math.round(latencyMs * 100) / 100, operation },
  });
}

export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}
