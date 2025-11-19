import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

// If you use a Vite proxy, this will hit http://localhost:5000 via /api
const api = axios.create({ baseURL: 'http://localhost:5000/api', timeout: 10000 });

async function fetchTopNews() {
  const { data } = await api.get('/stocks/news', {
    headers: { 'Cache-Control': 'no-store' },
    params: { _ts: Date.now() }, // avoid 304/no-body during dev
  });
  // normalize: prefer items[], fall back to []
  return Array.isArray(data?.items) ? data.items : [];
}

function timeAgo(iso) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function TopNews({ limit = 10 }) {
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['top-news'],
    queryFn: fetchTopNews,
    staleTime: 60 * 1000,          // 1 min cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const list = (items || []).slice(0, limit);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-black text-lg font-bold">Top News</h2>
      </div>

      {isLoading && <div className="text-black text-sm">Loading news…</div>}
      {error && (
        <div className="text-red-200 text-sm">
          Failed to load news: {error.message}
        </div>
      )}

      {!isLoading && !error && list.length === 0 && (
        <div className="text-black text-sm">No news available.</div>
      )}

      {!isLoading && !error && list.length > 0 && (
        <ul className="space-y-2">
          {list.map((n) => (
            <li key={n.id} className="bg-white/95 rounded-lg shadow hover:bg-gray-200 transition">
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3"
              >
                <div className="font-semibold text-gray-900 line-clamp-2">
                  {n.headline}
                </div>
                <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {n.source || 'Source'}
                  </span>
                  <span>•</span>
                  <span title={n.datetime}>
                    {n.datetime ? timeAgo(n.datetime) : ''}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
