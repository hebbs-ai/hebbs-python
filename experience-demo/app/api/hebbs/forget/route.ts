import { NextRequest } from 'next/server';
import { getSessionHebbs, apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hebbs = await getSessionHebbs(req);

    const params: { entityId?: string; memoryIds?: Buffer[] } = {};
    if (body.entityId) params.entityId = body.entityId;
    if (body.memoryIds) {
      params.memoryIds = body.memoryIds.map((id: string) => Buffer.from(id, 'hex'));
    }

    const start = performance.now();
    const result = await hebbs.forget(params);
    const latencyMs = performance.now() - start;

    return apiSuccess(
      {
        forgottenCount: result.forgottenCount,
        cascadeCount: result.cascadeCount,
        tombstoneCount: result.tombstoneCount,
        truncated: result.truncated,
      },
      latencyMs,
      'forget',
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return apiError(message);
  }
}
