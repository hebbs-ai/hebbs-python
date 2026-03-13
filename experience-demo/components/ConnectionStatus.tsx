'use client';

import { useEffect, useState } from 'react';
import { hebbsHealth } from '@/lib/api-client';

type Status = 'checking' | 'connected' | 'disconnected';

export function ConnectionStatus() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    async function check() {
      try {
        const resp = await hebbsHealth();
        setStatus(resp.data.serving ? 'connected' : 'disconnected');
      } catch {
        setStatus('disconnected');
      }
    }
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  const colors: Record<Status, string> = {
    checking: 'bg-yellow-400/50',
    connected: 'bg-green-400',
    disconnected: 'bg-red-400/50',
  };

  const labels: Record<Status, string> = {
    checking: 'Connecting…',
    connected: 'HEBBS Connected',
    disconnected: 'HEBBS Offline',
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[status]}`} />
      <span className="text-[10px] text-white/30">{labels[status]}</span>
    </div>
  );
}
