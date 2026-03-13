import { NextRequest } from 'next/server';
import { getSessionHebbs, serializeMemory, apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hebbs = await getSessionHebbs(req);

    const start = performance.now();
    const memory = await hebbs.remember({
      content: body.content,
      importance: body.importance,
      context: body.context,
      entityId: body.entityId,
    });
    const latencyMs = performance.now() - start;

    return apiSuccess(serializeMemory(memory), latencyMs, 'remember');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return apiError(message);
  }
}
