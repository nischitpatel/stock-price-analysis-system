import React, { useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/apiClient';

// Change BASE to '/api' if you use a Vite proxy
// const BASE = 'https://stock-price-analysis-system.onrender.com/api';

async function fetchBalanceSheet(symbol) {
  // const url = `${BASE}/stocks/balance-sheet/normalized/${symbol}`;
  const url = `/stocks/balance-sheet/normalized/${symbol}`;
  // const { data } = await axios.get(url, {
  const {data} = await api.get(url, {
    headers: { 'Cache-Control': 'no-store' },
    params: { _ts: Date.now() }, // avoid 304/no-body in dev
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

function formatRatio(x) {
  if (x === null || x === undefined || Number.isNaN(x)) return '—';
  return Number(x).toFixed(2);
}

const ROWS = [
  { key: 'totalAssets',               label: 'Total Assets',               fmt: formatNumber },
  { key: 'totalLiab',                 label: 'Total Liabilities',          fmt: formatNumber },
  { key: 'totalStockholderEquity',    label: 'Total Stockholders’ Equity', fmt: formatNumber },
  { key: 'totalCurrentAssets',        label: 'Total Current Assets',       fmt: formatNumber },
  { key: 'totalCurrentLiabilities',   label: 'Total Current Liabilities',  fmt: formatNumber },
  { key: 'cash',                      label: 'Cash & Cash Equivalents',    fmt: formatNumber },
  { key: 'netReceivables',            label: 'Net Receivables',            fmt: formatNumber },
  { key: 'inventory',                 label: 'Inventory',                  fmt: formatNumber },
  { key: 'longTermDebt',              label: 'Long-Term Debt',             fmt: formatNumber },
  { key: 'shortTermDebt',             label: 'Short-Term Debt',            fmt: formatNumber },
  { key: 'accountsPayable',           label: 'Accounts Payable',           fmt: formatNumber },
  { key: 'propertyPlantEquipment',    label: 'Property, Plant & Equipment',fmt: formatNumber },
  { key: 'otherCurrentAssets',        label: 'Other Current Assets',       fmt: formatNumber },
  { key: 'otherCurrentLiab',          label: 'Other Current Liabilities',  fmt: formatNumber },
  { key: 'netWorkingCapital',         label: 'Net Working Capital',        fmt: formatNumber },
  { key: 'currentRatio',              label: 'Current Ratio',              fmt: formatRatio  },
  { key: 'quickRatio',                label: 'Quick Ratio',                fmt: formatRatio  },
  { key: 'debtToEquity',              label: 'Debt to Equity',             fmt: formatRatio  },
];

export default function BalanceSheet() {
  const { symbol: routeSymbol } = useParams();
  const symbol = (routeSymbol || '').toUpperCase();

  const { data, isLoading, error } = useQuery({
    queryKey: ['balance-sheet', symbol],
    queryFn: () => fetchBalanceSheet(symbol),
    enabled: !!symbol,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const { statements, years } = useMemo(() => {
    const stmts = Array.isArray(data?.statements) ? data.statements : [];
    // Map by year from endDate
    const byYear = {};
    for (const s of stmts) {
      const y = s?.endDate ? new Date(s.endDate).getUTCFullYear() : null;
      if (!y) continue;
      byYear[y] = s;
    }
    // We specifically want 2021–2024 (per your requirement)
    const cols = [2021, 2022, 2023, 2024];
    return { statements: byYear, years: cols };
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Balance Sheet</h3>
      </div>

      {!symbol && <div className="text-gray-500">No symbol.</div>}
      {symbol && isLoading && <div className="text-gray-500">Loading balance sheet…</div>}
      {symbol && error && <div className="text-red-600">Failed to load: {error.message}</div>}

      {symbol && !isLoading && !error && (
        <div className="overflow-auto">
          <table className="min-w-full border-collapse">
            <thead className='bg-blue-100 font-bold text-blue-900'>   
              <tr>
                <th className="sticky left-0 bg-blue-100 z-10 text-left p-2 border-b">PARTICULARS</th>
                {years.map((y) => (
                  <th key={y} className="p-2 border-b text-right bg-blue-100">{y}</th>
                ))}
              </tr> 
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key} className="odd:bg-gray-50">
                  <td className="sticky left-0 bg-inherit p-2 border-b text-gray-700 font-semibold">{row.label}</td>
                  {years.map((y) => {
                    const v = statements?.[y]?.[row.key];
                    const formatted = row.fmt(v);
                    return (
                      <td key={y} className="p-2 border-b text-right tabular-nums">{formatted}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Hint if some years were missing */}
          {!years.some(y => statements?.[y]) && (
            <div className="text-sm text-gray-500 mt-3">
              No balance sheet data found for 2021–2024.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
