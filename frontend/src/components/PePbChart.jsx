import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import api from '../lib/apiClient';

// If you use a Vite proxy, this baseURL is correct.
// Otherwise change to 'http://localhost:5000/api'
// timeout: 10000
// const api = axios.create({ baseURL: 'https://stock-price-analysis-system.onrender.com/api' });

async function fetchValuation(symbol) {
  const url = `/stocks/valuation/${symbol}`;
  const { data } = await api.get(url, {
    headers: { 'Cache-Control': 'no-store' },
    params: { _ts: Date.now() }, // avoid 304/no-body during dev
  });
  return data;
}

function toMs(x) {
  const d = new Date(x);
  return isNaN(d.getTime()) ? null : d.getTime();
}

export default function PePbCharts() {
  const { symbol: routeSymbol } = useParams();
  const symbol = (routeSymbol || '').toUpperCase();

  const [metric, setMetric] = useState('pe'); // 'pe' | 'pb'

  const { data, isLoading, error } = useQuery({
    queryKey: ['valuation', symbol],
    queryFn: () => fetchValuation(symbol),
    enabled: !!symbol,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const chartData = useMemo(() => {
    const arr = Array.isArray(data?.series) ? data.series : [];
    // Keep points that have a valid date and at least one metric
    const cleaned = arr
      .map((pt) => ({
        t: toMs(pt.endDate),
        year: pt.endDate ? new Date(pt.endDate).getUTCFullYear() : null,
        pe: pt.pe == null ? null : Number(pt.pe),
        pb: pt.pb == null ? null : Number(pt.pb),
      }))
      .filter((d) => d.t != null && (d.pe != null || d.pb != null))
      .sort((a, b) => a.t - b.t);
    // Recharts likes simple keys; we’ll keep t (ms), pe, pb and also a label year
    return cleaned;
  }, [data]);

  const visibleKey = metric === 'pe' ? 'pe' : 'pb';
  const title = metric === 'pe' ? 'P/E Ratio' : 'P/B Ratio';

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      {/* Header / Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold">Valuation</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMetric('pe')}
            className={`px-3 py-1 rounded border ${
              metric === 'pe'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            P/E
          </button>
          <button
            onClick={() => setMetric('pb')}
            className={`px-3 py-1 rounded border ${
              metric === 'pb'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            P/B
          </button>
        </div>
      </div>

      {/* States */}
      {!symbol && <div className="text-gray-500">No symbol.</div>}
      {symbol && isLoading && <div className="text-gray-500">Loading valuation…</div>}
      {symbol && error && (
        <div className="text-red-600">Failed to load valuation: {error.message}</div>
      )}
      {symbol && !isLoading && !error && chartData.length === 0 && (
        <div className="text-gray-500">No valuation data available.</div>
      )}

      {/* Chart */}
      {symbol && chartData.length > 0 && (
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                tickFormatter={(v) => new Date(v).getUTCFullYear()}
                minTickGap={20}
              />
              <YAxis
                dataKey={visibleKey}
                width={70}
                allowDecimals
                domain={['auto', 'auto']}
              />
              <Tooltip
                labelFormatter={(v) => {
                  const d = new Date(v);
                  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                }}
                formatter={(val, name) => {
                  if (val == null) return ['—', name];
                  // Show 2 decimals for valuation ratios
                  return [Number(val).toFixed(2), name.toUpperCase()];
                }}
              />
              <Line
                type="monotone"
                dataKey={visibleKey}
                dot={{ r: 2 }}
                strokeWidth={2}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
