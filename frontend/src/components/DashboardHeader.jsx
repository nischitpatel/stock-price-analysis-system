import { Link } from 'react-router-dom';
import logo from '../assets/h-logo.png';

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 bottom-0 z-40 backdrop-blur-sm bg-white border border-gray-200 rounded shadow-sm px-0 py-0">
      <nav className="max-w-screen-xl mx-auto px-0 py-0 flex items-center justify-between">
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
          <a href="#price-trend" className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-blue-700">
            Price Trend
          </a>
          <a href="#valuation" className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-blue-700">
            Valuation
          </a>
          <a href="#ownership" className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-blue-700">
            Ownership
          </a>
          <a href="#balance-sheet" className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-blue-700">
            Balance Sheet
          </a>
          <a href="#profit-loss" className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-blue-700">
            Profit &amp; Loss
          </a>
          <a href="#company-news" className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-blue-700">
            Company News
          </a>

        </div>

        {/* Right: Home */}
        <Link
          to="/"
          className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-gray-700"
        >
          Home
        </Link>
      </nav>
    </header>
  );
}
