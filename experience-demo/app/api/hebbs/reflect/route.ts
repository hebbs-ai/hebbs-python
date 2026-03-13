import { NextRequest } from 'next/server';
import { getSessionHebbs, apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hebbs = await getSessionHebbs(req);

    const start = performance.now();
    const result = await hebbs.reflect({
      entityId: body.entityId,
    });
    const latencyMs = performance.now() - start;

    return apiSuccess(
      {
        insightsCreated: result.insightsCreated,
        clustersFound: result.clustersFound,
        clustersProcessed: result.clustersProcessed,
        memoriesProcessed: result.memoriesProcessed,
      },
      latencyMs,
      'reflect',
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return apiError(message);
  }
}
