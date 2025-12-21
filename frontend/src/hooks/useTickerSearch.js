import { useEffect, useMemo, useState } from "react";
import useDebounce from "../hooks/useDebounce";

export default function useTickerSearch(initialDataUrl = "/company_tickers.json") {
  const [query, setQuery] = useState("");
  const [tickers, setTickers] = useState([]); // raw data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debounced = useDebounce(query, 150);

  // Load JSON once
  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(initialDataUrl);
        if (!res.ok) throw new Error(`Failed to load tickers (${res.status})`);
        const raw = await res.json();

        const array = Object.values(raw).map((r) => ({
          ticker: r.ticker?.toUpperCase() || "",
          title: (r.title || "").trim(),
          cik_str: r.cik_str,
        }));

        if (!isCancelled) {
          setTickers(array);
          setLoading(false);
        }
      } catch (e) {
        if (!isCancelled) {
          setError(e.message || "Error loading tickers");
          setLoading(false);
        }
      }
    })();
    return () => { isCancelled = true; };
  }, [initialDataUrl]);

  // Filter results based on debounced input
  const results = useMemo(() => {
    const q = debounced.trim().toUpperCase();
    if (!q) return [];
    return tickers
      .filter(
        ({ ticker, title }) =>
          ticker.startsWith(q) || title.toUpperCase().includes(q)
      )
      .slice(0, 20);
  }, [debounced, tickers]);

  return {
    query,
    setQuery,
    debounced,
    results,
    loading,
    error,
  };
}
