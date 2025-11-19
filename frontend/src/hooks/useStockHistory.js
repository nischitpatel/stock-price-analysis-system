import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BASE = 'http://localhost:5000/api'; // or '/api' if using a Vite proxy

function toMillis(x) {
  const d = new Date(x);
  return isNaN(d.getTime()) ? null : d.getTime();
}

async function fetchHistory(symbol, range) {
  const url = `${BASE}/stocks/history/${symbol}/${range}`;
  const { data } = await axios.get(url, {
    headers: { 'Cache-Control': 'no-store' },
    params: { _ts: Date.now() }, // avoid 304s during dev
  });

  // Expecting { symbol, interval, history: [...] }
  const arr = Array.isArray(data?.history) ? data.history : [];

  // Normalize to { t: ms, p: number }
  return arr
    .map((pt) => {
      const t = toMillis(pt.date);
      const p = Number(pt.close);
      if (t == null || !isFinite(p)) return null;
      return { t, p };
    })
    .filter(Boolean)
    .sort((a, b) => a.t - b.t);
}

export function useStockHistory(symbol, range) {
  return useQuery({
    queryKey: ['history', symbol, range],
    queryFn: () => fetchHistory(symbol, range),
    enabled: !!symbol && !!range,
    // fetch once per (symbol, range)
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}
