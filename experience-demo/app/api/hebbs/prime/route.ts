import { NextRequest } from 'next/server';
import { getSessionHebbs, serializeMemory, apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hebbs = await getSessionHebbs(req);

    const start = performance.now();
    const output = await hebbs.prime({
      entityId: body.entityId,
      maxMemories: body.maxMemories,
      similarityCue: body.similarityCue,
    });
    const latencyMs = performance.now() - start;

    const data = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results: output.results.map((r: any) => ({
        memory: serializeMemory(r.memory),
        score: r.score,
        strategyDetails: r.strategyDetails,
      })),
      temporalCount: output.temporalCount,
      similarityCount: output.similarityCount,
    };

    return apiSuccess(data, latencyMs, 'prime');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return apiError(message);
  }
}
