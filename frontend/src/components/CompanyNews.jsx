import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// If you use a Vite proxy, this hits http://localhost:5000 via /api 
// timeout: 10000
const api = axios.create({ baseURL: 'https://stock-price-analysis-system.onrender.com/api'});

async function fetchCompanyNews(symbol) {
  const { data } = await api.get(`/stocks/news/${symbol}`, {
    headers: { 'Cache-Control': 'no-store' },
    params: { _ts: Date.now() }, // avoid 304/no-body during dev
  });
  // normalize to an array of items
  return Array.isArray(data?.items) ? data.items : [];
}

function timeAgo(iso) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (Number.isNaN(mins)) return '';
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function CompanyNews({ limit = 10 }) {
  const { symbol: routeSymbol } = useParams();
  const symbol = (routeSymbol || '').toUpperCase();

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['company-news', symbol],
    queryFn: () => fetchCompanyNews(symbol),
    enabled: !!symbol,
    staleTime: 60 * 1000,           // cache for 1 min
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const list = (items || []).slice(0, limit);

  return (
    <div className="bg-white/95 rounded-lg shadow p-4 mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">News Related to {symbol} </h3>
      </div>

      {!symbol && <div className="text-gray-500">No symbol.</div>}
      {symbol && isLoading && <div className="text-gray-500">Loading news…</div>}
      {symbol && error && <div className="text-red-600">Failed to load: {error.message}</div>}
      {symbol && !isLoading && !error && list.length === 0 && (
        <div className="text-gray-500">No news available.</div>
      )}

      {symbol && !isLoading && !error && list.length > 0 && (
        <ul className="space-y-2">
          {list.map((n) => (
            <li key={n.id} className="rounded-md border border-gray-100 hover:shadow transition">
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3"
              >
                <div className="font-medium text-gray-900 hover:underline line-clamp-2">
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
