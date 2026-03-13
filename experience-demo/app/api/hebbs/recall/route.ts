import { NextRequest } from 'next/server';
import { getSessionHebbs, serializeMemory, apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hebbs = await getSessionHebbs(req);

    const start = performance.now();
    const output = await hebbs.recall({
      cue: body.cue,
      strategies: body.strategies,
      topK: body.topK,
      entityId: body.entityId,
    });
    const latencyMs = performance.now() - start;

    const data = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results: output.results.map((r: any) => ({
        memory: serializeMemory(r.memory),
        score: r.score,
        strategyDetails: r.strategyDetails,
      })),
      strategyErrors: output.strategyErrors || [],
    };

    return apiSuccess(data, latencyMs, 'recall');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return apiError(message);
  }
}
