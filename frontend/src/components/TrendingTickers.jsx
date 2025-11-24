import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// If you use a Vite proxy, axios can just hit /api
const api = axios.create({ baseURL: 'https://stock-price-analysis-system.onrender.com/api', timeout: 10000 });

async function fetchTrending() {
  const { data } = await api.get('/stocks/trending', {
    headers: { 'Cache-Control': 'no-store' },
    params: { _ts: Date.now() }, // avoid dev-time 304/no-body
  });
  // prefer `symbols` array; fall back to `quotes[].symbol`
  const list = Array.isArray(data?.symbols) && data.symbols.length
    ? data.symbols
    : (Array.isArray(data?.quotes) ? data.quotes.map(q => q.symbol).filter(Boolean) : []);
  // normalize, unique, take first 5
  const uniq = [...new Set(list.map(s => String(s || '').toUpperCase()))].slice(0, 5);
  return uniq;
}

export default function TrendingTickers() {
  const navigate = useNavigate();

  const { data: symbols, isLoading, error } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrending,
    staleTime: 5 * 60 * 1000,        // cache for 5 min
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const go = (sym) => navigate(`/dashboard/${sym}`);

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-black text-lg font-bold">Today's trending stocks</h2>
        {/* jobTimestamp etc. could go here if you want */}
      </div>

      {isLoading && <div className="text-black/80 text-sm">Loading trending symbols…</div>}
      {error && <div className="text-red-200 text-sm">Failed to load: {error.message}</div>}

      {!isLoading && !error && symbols && symbols.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {symbols.map((sym) => (
            <button
              key={sym}
              onClick={() => go(sym)}
              className="px-3 py-1 rounded-full bg-white/90 hover:bg-gray-200 text-black-700 font-bold shadow"
              aria-label={`Open ${sym} dashboard`}
            >
              {sym}
            </button>
          ))}
        </div>
      )}

      {!isLoading && !error && (!symbols || symbols.length === 0) && (
        <div className="text-black/80 text-sm">No trending symbols available.</div>
      )}
    </div>
  );
}
