import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  Tooltip
} from 'recharts';

// timeout: 10000 
const api = axios.create({ baseURL: 'https://stock-price-analysis-system.onrender.com/api'});

async function fetchOwnership(symbol) {
  const { data } = await api.get(`/stocks/ownership/${symbol}`, {
    headers: { 'Cache-Control': 'no-store' },
    params: { _ts: Date.now() },
  });
  return data;
}

function formatPct(v) {
  if (v == null || Number.isNaN(v)) return '—';
  return `${Number(v).toFixed(2)}%`;
}

const COLORS = [
  '#2563eb', // blue
  '#16a34a', // green
  '#f59e0b', // amber
  '#dc2626', // red
  '#7c3aed', // violet
  '#0ea5e9', // sky
];

export default function OwnershipPie() {
  const { symbol: routeSymbol } = useParams();
  const symbol = (routeSymbol || '').toUpperCase();

  const { data, isLoading, error } = useQuery({
    queryKey: ['ownership', symbol],
    queryFn: () => fetchOwnership(symbol),
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const { series, asOf, notes } = useMemo(() => {
    const totals = data?.totals || {};
    const raw = [
      { name: 'Promoters', value: totals.promoters },
      { name: 'DII', value: totals.dii },
      { name: 'FII', value: totals.fii },
      { name: 'Public', value: totals.public },
      { name: 'Institutions', value: totals.institutions },
    ]
      .filter(s => s.value != null)
      .map(s => ({ ...s, value: Number(s.value) }))
      .filter(s => Number.isFinite(s.value) && s.value >= 0);

    return {
      series: raw,
      asOf: data?.asOf ? new Date(data.asOf) : null,
      notes: Array.isArray(data?.notes) ? data.notes : [],
    };
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ownership</h3>
        <div className="text-sm text-gray-500">
          {asOf ? `As of ${asOf.toLocaleDateString()}` : ''}
        </div>
      </div>

      {!symbol && <div className="text-gray-500">No symbol.</div>}
      {symbol && isLoading && <div className="text-gray-500">Loading ownership…</div>}
      {symbol && error && <div className="text-red-600">Failed to load: {error.message}</div>}

      {symbol && !isLoading && !error && series && series.length > 0 && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Pie Chart */}
          <div className="flex-1 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={series}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {series.map((entry, idx) => (
                    <Cell key={`slice-${entry.name}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [formatPct(val), name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Right: Tabular Percentages */}
          <div className="flex-1">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-100 text-blue-800">
                  <th className="text-left text-bold p-2 border-b">CATEGORY</th>
                  <th className="text-right text-bold p-2 border-b">SHARE (%)</th>
                </tr>
              </thead>
              <tbody>
                {series.map((s, idx) => (
                  <tr key={s.name} className="odd:bg-gray-50">
                    <td className="p-2 border-b">{s.name}</td>
                    <td className="p-2 border-b text-right">{formatPct(s.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {notes && notes.length > 0 && (
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          {notes.map((n, i) => (
            <div key={i}>• {n}</div>
          ))}
        </div>
      )}
    </div>
  );
}
