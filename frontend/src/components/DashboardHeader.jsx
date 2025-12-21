import { Link } from 'react-router-dom';
import logo from '../assets/h-logo.png';
import SearchBar from './SearchBar';
import useTickerSearch from '../hooks/useTickerSearch';
import { useNavigate } from "react-router-dom";

export default function DashboardHeader(){
  const {
    query,
    setQuery,
    results,
    debounced, loading, error,
    // onSelectTicker,
  } = useTickerSearch();

  const navigate = useNavigate();

  const handleClick = (symbol) => {
    navigate(`/dashboard/${symbol}`);
    setQuery("");
  };

  return (
    // <header className="sticky top-0 bottom-0 z-40 backdrop-blur-sm bg-white border border-gray-200 rounded shadow-sm px-0 py-0 overflow-visible">
    <header className="sticky top-0 z-50 backdrop-blur-sm bg-white border border-gray-200 shadow-sm overflow-visible">
      <nav className="max-w-screen-xl mx-auto px-2 py-2 flex items-center justify-between">
        {/* Left: Brand */}
        {/* <div className="text-xl font-bold text-blue-700">TickerLens</div> */}
        <Link
          to="/"
          className="flex items-center"
        >
          <img
            src={logo}
            alt="TickerLens"
            className="h-10 w-auto cursor-pointer"
          />
        </Link>
        {/* <div className="flex items-center">
          <img
            src={logo}
            alt="TickerLens"
            className="h-10 w-auto cursor-pointer"
          />
        </div> */}

        {/* Center: Nav buttons */}
        <div className="flex gap-3">
          <a href="#price-trend" className="px-3 py-1 rounded bg-blue-700 text-white hover:bg-blue-900">
            Price Trend
          </a>
          <a href="#valuation" className="px-3 py-1 rounded bg-blue-700 text-white hover:bg-blue-900">
            Valuation
          </a>
          <a href="#ownership" className="px-3 py-1 rounded bg-blue-700 text-white hover:bg-blue-900">
            Ownership
          </a>
          <a href="#balance-sheet" className="px-3 py-1 rounded bg-blue-700 text-white hover:bg-blue-900">
            Balance Sheet
          </a>
          <a href="#profit-loss" className="px-3 py-1 rounded bg-blue-700 text-white hover:bg-blue-900">
            Profit &amp; Loss
          </a>
          <a href="#company-news" className="px-3 py-1 rounded bg-blue-700 text-white hover:bg-blue-900">
            Company News
          </a>
        </div>

        <div className="relative flex-1 max-w-md px-3">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            results={results}
            debounced={debounced}
            loading={loading}
            error={error}
            onSelect={handleClick}
            size="sm"
            showHelper={false}
          />
        </div>
      </nav>
    </header>
  );
}

// import SearchBar from "../components/SearchBar";
// import useTickerSearch from "../hooks/useTickerSearch";
// import { Link } from "react-router-dom";

// export default function DashboardHeader() {
//   const { query, setQuery, results, debounced, loading, error } = useTickerSearch();
//   const handleClick = (symbol) => {
//     console.log("Navigate to:", symbol);
//     // navigate(`/dashboard/${symbol}`);
//   };

//   return (
//     <header className="sticky top-0 z-50 bg-white border-b shadow overflow-visible">
//       <nav className="relative max-w-screen-xl mx-auto flex items-center gap-4 px-4 py-2 overflow-visible">
//         <Link to="/">
//           <img src="/logo.png" className="h-10" />
//         </Link>

//         <div className="relative flex-1 max-w-md">
//           <SearchBar
//             query={query}
//             onQueryChange={setQuery}
//             results={results}
//             debounced={debounced}
//             loading={loading}
//             error={error}
//             onSelect={handleClick}
//             size="sm"
//             showHelper={false}
//           />
//         </div>
//       </nav>
//     </header>
//   );
// }
