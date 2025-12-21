// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import useDebounce from '../hooks/useDebounce';
// import TrendingTickers from '../components/TrendingTickers';
// import TopNews from '../components/TopNews';
// import TickerStrip from '../components/TickerStrip';
// import SearchBar from '../components/SearchBar';

// export default function Home() {
//   const [query, setQuery] = useState('');
//   const [tickers, setTickers] = useState([]);   // [{ticker, title, cik_str}]
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState(null);
//   const debounced = useDebounce(query, 150);
//   const navigate = useNavigate();

//   // Load JSON once
//   useEffect(() => {
//     let isCancelled = false;
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await fetch('/company_tickers.json');
//         if (!res.ok) throw new Error(`Failed to load company_tickers.json (${res.status})`);
//         const raw = await res.json();

//         // Convert the previewed shape { "0": {...}, "1": {...} } -> array
//         const array = Object.values(raw).map((r) => ({
//           ticker: r.ticker?.toUpperCase() || '',
//           title: (r.title || '').trim(),
//           cik_str: r.cik_str,
//         }));

//         if (!isCancelled) {
//           setTickers(array);
//           setLoading(false);
//         }
//       } catch (e) {
//         if (!isCancelled) {
//           setErr(e.message || 'Error loading tickers');
//           setLoading(false);
//         }
//       }
//     })();
//     return () => { isCancelled = true; };
//   }, []);

//   // Filter on debounced input
//   const results = useMemo(() => {
//     const q = debounced.trim().toUpperCase();
//     if (!q) return [];
//     // match ticker startsWith or contains in title
//     return tickers
//       .filter(({ ticker, title }) =>
//         ticker.startsWith(q) ||
//         title.toUpperCase().includes(q)
//       )
//       .slice(0, 20); // limit for performance
//   }, [debounced, tickers]);

//   const handleClick = (symbol) => {
//     // Navigate to dashboard with that symbol
//     navigate(`/dashboard/${symbol}`);
//   };

//   return (
//     // bg-gray-200
//     // flex-col
//     <div className="flex-col min-h-screen items-center justify-center text-black">
//       <TickerStrip />
//       {/* <header className="px-6 py-5 text-2xl font-bold text-center text-black"> */}
//       <h1 className="px-6 py-5 text-2xl font-bold text-center text-black">Ticker Search Engine</h1>
//       {/* </header> */}

//       <main className="flex-1 flex flex-col justify-center items-center px-4">
//         <div className="w-full max-w-2xl">
//           <SearchBar
//             query={query}
//             onQueryChange={setQuery}
//             loading={loading}
//             error={err}
//             results={results}
//             debounced={debounced}
//             onSelect={handleClick}
//             size="lg"
//           />
//         </div>
//       </main>

//       <TrendingTickers />

//       <TopNews limit={5} />
//     </div>
//   );
// }


import React from "react";
import { useNavigate } from "react-router-dom";
import TrendingTickers from "../components/TrendingTickers";
import TopNews from "../components/TopNews";
import TickerStrip from "../components/TickerStrip";
import SearchBar from "../components/SearchBar";
import useTickerSearch from "../hooks/useTickerSearch";

export default function Home() {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    debounced,
    results,
    loading,
    error,
  } = useTickerSearch();

  const handleClick = (symbol) => {
    navigate(`/dashboard/${symbol}`);
  };

  return (
    <div className="flex-col min-h-screen items-center justify-center text-black">
      <TickerStrip />

      <h1 className="px-6 py-5 text-2xl font-bold text-center text-black">
        Ticker Search Engine
      </h1>

      <main className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-2xl">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            loading={loading}
            error={error}
            results={results}
            debounced={debounced}
            onSelect={handleClick}
            size="lg"
          />
        </div>
      </main>

      <TrendingTickers />
      <TopNews limit={5} />
    </div>
  );
}
