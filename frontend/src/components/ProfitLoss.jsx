import React, { useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// Change to '/api' if you use Vite proxy
const BASE = 'http://localhost:5000/api';

async function fetchIncomeStatement(symbol) {
  const url = `${BASE}/stocks/income-statement/normalized/${symbol}`;
  const { data } = await axios.get(url, {
    headers: { 'Cache-Control': 'no-store' },
    params: { _ts: Date.now() }, // avoid 304/no-body during dev
  });
  return data;
}

function formatNumber(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (abs >= 1e9)  return (n / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3)  return (n / 1e3).toFixed(2) + 'K';
  return String(Math.round(n));
}

function formatShares(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  // shares are large; format in billions
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  return String(Math.round(n));
}

function formatEPS(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return Number(n).toFixed(2);
}

function formatPercent(x) {
  if (x === null || x === undefined || Number.isNaN(x)) return '—';
  return (Number(x) * 100).toFixed(1) + '%';
}

const ROWS = [
  { key: 'totalRevenue',       label: 'Total Revenue',       fmt: formatNumber },
  { key: 'costOfRevenue',      label: 'Cost of Revenue',     fmt: formatNumber },
  { key: 'grossProfit',        label: 'Gross Profit',        fmt: formatNumber },
  { key: 'operatingExpense',   label: 'Operating Expense',   fmt: formatNumber },
  { key: 'sga',                label: 'SG&A',                fmt: formatNumber },
  { key: 'operatingIncome',    label: 'Operating Income',    fmt: formatNumber },
  { key: 'ebit',               label: 'EBIT',                fmt: formatNumber },
  { key: 'ebitda',             label: 'EBITDA',              fmt: formatNumber },
  { key: 'interestExpense',    label: 'Interest Expense',    fmt: formatNumber },
  { key: 'incomeTaxExpense',   label: 'Income Tax Expense',  fmt: formatNumber },
  { key: 'netIncome',          label: 'Net Income',          fmt: formatNumber },
  { key: 'epsDiluted',         label: 'EPS (Diluted)',       fmt: formatEPS   },
  { key: 'sharesDiluted',      label: 'Shares (Diluted)',    fmt: formatShares},
  { key: 'grossMargin',        label: 'Gross Margin',        fmt: formatPercent },
  { key: 'operatingMargin',    label: 'Operating Margin',    fmt: formatPercent },
  { key: 'netMargin',          label: 'Net Margin',          fmt: formatPercent },
  { key: 'interestCoverage',   label: 'Interest Coverage',   fmt: (n) => (n==null? '—' : Number(n).toFixed(2) + '×') },
];

export default function ProfitLoss() {
  const { symbol: routeSymbol } = useParams();
  const symbol = (routeSymbol || '').toUpperCase();

  const { data, isLoading, error } = useQuery({
    queryKey: ['income-statement', symbol],
    queryFn: () => fetchIncomeStatement(symbol),
    enabled: !!symbol,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const { statements, years } = useMemo(() => {
    const stmts = Array.isArray(data?.statements) ? data.statements : [];
    const byYear = {};
    for (const s of stmts) {
      const y = s?.endDate ? new Date(s.endDate).getUTCFullYear() : null;
      if (!y) continue;
      byYear[y] = s;
    }
    // exactly 2021–2024 (update if you prefer dynamic)
    const cols = [2021, 2022, 2023, 2024];
    return { statements: byYear, years: cols };
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Profit &amp; Loss</h3>
      </div>

      {!symbol && <div className="text-gray-500">No symbol.</div>}
      {symbol && isLoading && <div className="text-gray-500">Loading income statement…</div>}
      {symbol && error && <div className="text-red-600">Failed to load: {error.message}</div>}

      {symbol && !isLoading && !error && (
        <div className="overflow-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-blue-100 text-blue-900 font-bold">
              <tr>
                <th className="sticky left-0 z-10 text-left p-2 border-b bg-blue-100">
                  PARTICULARS
                </th>
                {years.map((y) => (
                  <th key={y} className="p-2 border-b text-right bg-blue-100">
                    {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key} className="odd:bg-gray-50">
                  <td className="sticky left-0 bg-inherit p-2 border-b text-gray-700 font-semibold">
                    {row.label}
                  </td>
                  {years.map((y) => {
                    const v = statements?.[y]?.[row.key];
                    const formatted = row.fmt(v);
                    return (
                      <td key={y} className="p-2 border-b text-right tabular-nums">
                        {formatted}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {!years.some(y => statements?.[y]) && (
            <div className="text-sm text-gray-500 mt-3">
              No income statement data found for 2021–2024.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
