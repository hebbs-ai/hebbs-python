import { NextRequest } from 'next/server';
import { getSessionHebbs, serializeMemory, apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get('entityId') || undefined;
    const maxResults = searchParams.get('maxResults')
      ? parseInt(searchParams.get('maxResults')!, 10)
      : undefined;

    const hebbs = await getSessionHebbs(req);

    const start = performance.now();
    const insights = await hebbs.insights({ entityId, maxResults });
    const latencyMs = performance.now() - start;

    return apiSuccess(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      insights.map((m: any) => serializeMemory(m)),
      latencyMs,
      'reflect',
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return apiError(message);
  }
}
