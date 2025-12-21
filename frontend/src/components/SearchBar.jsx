import React from "react";

const SearchBar = ({
  query,
  onQueryChange,
  loading = false,
  error = null,
  results = [],
  onSelect,
  debounced = false,
  size = "md",
  showHelper = true,
  className = "",
}) => {
  const sizeClasses = {
    sm: "text-sm px-3 py-2",
    md: "text-lg px-5 py-4",
    lg: "text-xl px-6 py-5",
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Input */}
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search by symbol (AAPL) or company (Apple)…"
        className={`
          w-full
          text-black
          rounded-xl
          shadow-lg
          border-2 border-black-200
          focus:outline-none
          focus:ring-4 focus:ring-blue-400
          ${sizeClasses[size]}
        `}
      />

      {/* Helper / Status */}
      {showHelper && (
        <div className="mt-3 text-black text-sm">
          {loading && <span>Loading tickers…</span>}
          {error && <span className="text-red-500">Error: {error}</span>}
          {!loading && !error && !debounced && (
            <span>
              Type to search (e.g., <b>AAPL</b>, <b>MSFT</b>, <b>NVDA</b>)
            </span>
          )}
          {!loading && !error && debounced && results.length === 0 && (
            <span>No matches found.</span>
          )}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        // <ul className="mt-4 bg-white rounded-xl shadow overflow-hidden divide-y">
        <ul className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg divide-y z-50 max-h-96 overflow-y-auto">
          {results.map(({ ticker, title, cik_str }) => (
            <li
              key={`${ticker}-${cik_str}`}
              onClick={() => onSelect(ticker)}
              className="px-5 py-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{title || "—"}</div>
                <div className="text-sm text-gray-500">
                  CIK: {cik_str}
                </div>
              </div>
              <div className="text-blue-700 font-bold">{ticker}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
