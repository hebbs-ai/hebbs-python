'use client';

const SESSION_KEY = 'hebbs-session-id';

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `demo-${crypto.randomUUID()}`;
  }
  const hex = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
  return `demo-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-placeholder';

  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function resetSessionId(): string {
  const id = generateSessionId();
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
