// // src/App.jsx
// import React from 'react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { SelectedStockProvider } from './context/SelectedStockContext';
// import StocksList from './components/StocksList';
// import SelectedStockHeader from './components/SelectedStockHeader';
// import PriceChart from './components/PriceChart';
// import PredictionPanel from './components/PredictionPanel';

// // Create a single QueryClient instance for React Query
// const queryClient = new QueryClient();

// export default function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <SelectedStockProvider>
//         <div className="min-h-screen bg-gray-100 p-4">
//           <div className="max-w-screen-xl mx-auto grid grid-cols-9 gap-4">
//           {/* <div className="flex w-full"> */}


//           {/* Left Column - Stock List */}
//           <aside className="col-span-3 bg-white rounded shadow p-2 overflow-y-auto h-screen">
//           {/* <aside className="w-3/10 bg-white rounded shadow p-2 overflow-y-auto h-screen"> */}

//           <StocksList />
//           </aside>

//           {/* Right Column - Selected Stock Details */}
//           <main className="col-span-6 bg-white rounded shadow p-4 flex flex-col gap-4">
//           {/* <main className="w-7/10 bg-white rounded shadow p-4 flex flex-col gap-4"> */}
//           <SelectedStockHeader />
//           <PriceChart />
//           <PredictionPanel />
//           </main>

//           </div>


//         </div>
//       </SelectedStockProvider>
//     </QueryClientProvider>
//   );
// }

// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-[url('/bg.png')] bg-opacity-0 bg-cover bg-center bg-fixed">
    <Routes>
      <Route path="/" element={<Home />} />
      {/* /dashboard/:symbol opens the main dashboard with that symbol selected */}
      <Route path="/dashboard/:symbol" element={<Dashboard />} />
      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </div>
  );
}

