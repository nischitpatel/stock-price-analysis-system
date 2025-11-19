import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/apiClient';
import DashboardHeader from '../components/DashboardHeader';
import PriceChart from '../components/PriceChart';
import BalanceSheet from '../components/BalanceSheet';
import ProfitLoss from '../components/ProfitLoss';
import PePbCharts from '../components/PePbChart';
import OwnershipPie from '../components/OwnershipPie';
import CompanyNews from '../components/CompanyNews';

async function fetchQuote(symbol) {
  const { data } = await api.get(`/stocks/price/${symbol}`);
  console.log('Fetched quote for', symbol, data);
  return data; // { symbol, shortName, regularMarketPrice, ... }
}

export default function Dashboard() {
  const { symbol } = useParams();
  const up = (symbol || '').toUpperCase();

  // Fetch exactly once; never auto-refetch
  const { data, isLoading, error } = useQuery({
    queryKey: ['quote', up],
    queryFn: () => fetchQuote(up),
    enabled: !!up,                 // only run when we have a symbol
    staleTime: Infinity,           // data never becomes stale
    gcTime: 30 * 60 * 1000,        // keep cached for 30 min (v5). If on v4, use `cacheTime`
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,                      // optional: minimal retry
    // refetchInterval: 10_000,
    // staleTime: 5_000,
  });

  return (
    // bg-gray-50
    <div className="min-h-screen">
      {/* <header className="px-6 py-4 border-b bg-white">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-blue-600 hover:underline">&larr; Home</Link>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div />
        </div>
      </header> */}
      <DashboardHeader />

      <main className="max-w-screen-xl mx-auto mt-3 p-6">
        {!up && <div className="text-gray-600">No symbol provided.</div>}
        {up && isLoading && <div className="text-gray-600">Fetching {up}…</div>}
        {up && error && <div className="text-red-600">Failed to load {up}: {error.message}</div>}

        {up && data && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-bold">{data.shortName || data.symbol || up}</h2>
              <span className="text-gray-500">({data.symbol || up})</span>
            </div>
            <div className="mt-3 text-gray-800">
              <span className="mr-2">Price:</span>
              <span className="font-semibold">
                {typeof data.regularMarketPrice === 'number'
                  ? data.regularMarketPrice.toFixed(2)
                  : '—'} {data.currency || ''}
              </span>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <section id="price-trend">
            <PriceChart />
          </section>
          <section id="valuation">
            <PePbCharts />
          </section>
        </div>

        <section id="ownership">
          <OwnershipPie />
        </section>

        <section id="balance-sheet">
          <BalanceSheet />
        </section>
        
        <section id="profit-loss">
          <ProfitLoss />  
        </section>

        <section id="company-news">
          <CompanyNews limit={5} />
        </section>
      </main>
    </div>
  );
}
