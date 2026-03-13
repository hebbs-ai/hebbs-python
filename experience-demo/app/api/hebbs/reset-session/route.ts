import { NextRequest } from 'next/server';
import { extractSessionId, apiSuccess, apiError } from '@/lib/api-helpers';
import { destroySession } from '@/lib/hebbs-singleton';

export async function POST(req: NextRequest) {
  try {
    const sessionId = extractSessionId(req);
    await destroySession(sessionId);
    return apiSuccess({ destroyed: true }, 0, 'forget');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return apiError(message);
  }
}
