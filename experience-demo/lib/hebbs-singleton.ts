// Session-keyed HebbsClient pool. Each browser session gets its own client
// with a unique tenant_id, providing hard memory isolation between visitors.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HebbsClientType = any;

interface PoolEntry {
  client: HebbsClientType;
  lastUsed: number;
}

const pool = new Map<string, PoolEntry>();
const pendingConnects = new Map<string, Promise<HebbsClientType>>();

const MAX_POOL_SIZE = 50;
const EVICT_TTL_MS = 60 * 60 * 1000; // 1 hour
const EVICT_INTERVAL_MS = 5 * 60 * 1000; // check every 5 minutes

let evictTimer: ReturnType<typeof setInterval> | null = null;

function startEvictionTimer() {
  if (evictTimer) return;
  evictTimer = setInterval(() => {
    const now = Date.now();
    const staleKeys: string[] = [];
    pool.forEach((entry, key) => {
      if (now - entry.lastUsed > EVICT_TTL_MS) staleKeys.push(key);
    });
    for (const key of staleKeys) {
      pool.get(key)?.client.close?.().catch(() => {});
      pool.delete(key);
      pendingConnects.delete(key);
    }
  }, EVICT_INTERVAL_MS);
}

async function createClient(sessionId: string): Promise<HebbsClientType> {
  const { HebbsClient } = await import('@hebbs/sdk');
  const address = process.env.HEBBS_SERVER_ADDRESS || 'localhost:6380';
  const c = new HebbsClient(address, {
    apiKey: process.env.HEBBS_API_KEY,
    tenantId: sessionId,
  });
  await c.connect();
  return c;
}

export async function getHebbsForSession(sessionId: string): Promise<HebbsClientType> {
  const existing = pool.get(sessionId);
  if (existing) {
    existing.lastUsed = Date.now();
    return existing.client;
  }

  const pending = pendingConnects.get(sessionId);
  if (pending) return pending;

  // Enforce pool size — evict oldest entry if full
  if (pool.size >= MAX_POOL_SIZE) {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    pool.forEach((entry, key) => {
      if (entry.lastUsed < oldestTime) {
        oldestTime = entry.lastUsed;
        oldestKey = key;
      }
    });
    if (oldestKey) {
      pool.get(oldestKey)?.client.close?.().catch(() => {});
      pool.delete(oldestKey);
      pendingConnects.delete(oldestKey);
    }
  }

  const promise = createClient(sessionId);
  pendingConnects.set(sessionId, promise);

  try {
    const client = await promise;
    pool.set(sessionId, { client, lastUsed: Date.now() });
    startEvictionTimer();
    return client;
  } catch (err) {
    pendingConnects.delete(sessionId);
    throw err;
  }
}

export async function destroySession(sessionId: string): Promise<void> {
  pendingConnects.delete(sessionId);
  const entry = pool.get(sessionId);
  if (entry) {
    await entry.client.close?.().catch(() => {});
    pool.delete(sessionId);
  }
}

// Shared health client — tenant doesn't matter for health checks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let healthClient: HebbsClientType = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let healthConnectPromise: Promise<HebbsClientType> | null = null;

export async function getHealthClient(): Promise<HebbsClientType> {
  if (healthClient) return healthClient;
  if (healthConnectPromise) return healthConnectPromise;

  healthConnectPromise = (async () => {
    const { HebbsClient } = await import('@hebbs/sdk');
    const address = process.env.HEBBS_SERVER_ADDRESS || 'localhost:6380';
    const c = new HebbsClient(address, {
      apiKey: process.env.HEBBS_API_KEY,
    });
    await c.connect();
    healthClient = c;
    return c;
  })();

  try {
    return await healthConnectPromise;
  } catch (err) {
    healthConnectPromise = null;
    throw err;
  }
}
