import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDebounce from '../hooks/useDebounce';
import TrendingTickers from '../components/TrendingTickers';
import TopNews from '../components/TopNews';

export default function Home() {
  const [query, setQuery] = useState('');
  const [tickers, setTickers] = useState([]);   // [{ticker, title, cik_str}]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const debounced = useDebounce(query, 150);
  const navigate = useNavigate();

  // Load JSON once
  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/company_tickers.json');
        if (!res.ok) throw new Error(`Failed to load company_tickers.json (${res.status})`);
        const raw = await res.json();

        // Convert the previewed shape { "0": {...}, "1": {...} } -> array
        const array = Object.values(raw).map((r) => ({
          ticker: r.ticker?.toUpperCase() || '',
          title: (r.title || '').trim(),
          cik_str: r.cik_str,
        }));

        if (!isCancelled) {
          setTickers(array);
          setLoading(false);
        }
      } catch (e) {
        if (!isCancelled) {
          setErr(e.message || 'Error loading tickers');
          setLoading(false);
        }
      }
    })();
    return () => { isCancelled = true; };
  }, []);

  // Filter on debounced input
  const results = useMemo(() => {
    const q = debounced.trim().toUpperCase();
    if (!q) return [];
    // match ticker startsWith or contains in title
    return tickers
      .filter(({ ticker, title }) =>
        ticker.startsWith(q) ||
        title.toUpperCase().includes(q)
      )
      .slice(0, 20); // limit for performance
  }, [debounced, tickers]);

  const handleClick = (symbol) => {
    // Navigate to dashboard with that symbol
    navigate(`/dashboard/${symbol}`);
  };

  return (
    // bg-gray-200
    // flex-col
    <div className="flex-col min-h-screen items-center justify-center text-black"> 
      {/* <header className="px-6 py-5 text-2xl font-bold text-center text-black"> */}
        <h1 className="px-6 py-5 text-2xl font-bold text-center text-black">Ticker Search Engine</h1>
      {/* </header> */}

      <main className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-2xl">
          {/* Search input uses entire width */}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by symbol (AAPL) or company (Apple)…"
            className="w-full text-black text-lg px-5 py-4 rounded-xl shadow-lg border-2 border-black-200 focus:outline-none focus:ring-4 focus:ring-blue-400"
            // className="flex-1 border rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Helper / states */}
          <div className="mt-3 text-black">
            {loading && <span>Loading tickers…</span>}
            {err && <span className="text-red-200">Error: {err}</span>}
            {!loading && !err && !debounced && (
              <span>Type to search (e.g., <b>AAPL</b>, <b>MSFT</b>, <b>NVDA</b>)</span>
            )}
            {!loading && !err && debounced && results.length === 0 && (
              <span>No matches found.</span>
            )}
          </div>

          {/* Results list */}
          {results.length > 0 && (
            <ul className="mt-4 bg-white rounded-xl shadow overflow-hidden divide-y w-full max-w-2xl">
              {results.map(({ ticker, title, cik_str }) => (
                <li
                  key={`${ticker}-${cik_str}`}
                  onClick={() => handleClick(ticker)}
                  className="px-5 py-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">{title || '—'}</div>
                    <div className="text-sm text-gray-500">CIK: {cik_str}</div>
                  </div>
                  <div className="text-blue-700 font-bold">{ticker}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer className="px-6 py-4 text-black text-sm text-center">
        Tip: Symbols are 1–5 letters. Try typing “APP” to find Apple.
      </footer>

      <TrendingTickers />

      <TopNews limit={5} />
    </div>
  );
}
