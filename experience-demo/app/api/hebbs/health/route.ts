import { getSharedHealthClient, apiError } from '@/lib/api-helpers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hebbs = await getSharedHealthClient();

    const start = performance.now();
    const status = await hebbs.health();
    const latencyMs = performance.now() - start;

    return NextResponse.json({
      data: {
        serving: status.serving,
        version: status.version,
        memoryCount: status.memoryCount,
        uptimeSeconds: status.uptimeSeconds,
      },
      _meta: { latencyMs: Math.round(latencyMs * 100) / 100, operation: 'health' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return apiError(message);
  }
}
