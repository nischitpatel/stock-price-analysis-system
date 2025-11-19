// src/components/PriceChart.jsx
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useStockHistory } from '../hooks/useStockHistory';
import {
    ResponsiveContainer, LineChart, Line,
    XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

// Simple time formatter based on selected range
function formatTick(ts, range) {
    const d = new Date(ts);
    if (range === 'intraday') {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // daily/weekly/monthly
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function tooltipLabelFormatter(value, range) {
    const d = new Date(value);
    if (range === 'intraday') {
        return d.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleString();
}

export default function PriceChart() {
    const { symbol: routeSymbol } = useParams();
    const symbol = (routeSymbol || '').toUpperCase();

    // range state in the chart itself
    const [range, setRange] = useState('daily'); // 'intraday' | 'daily' | 'weekly' | 'monthly'

    const { data, isLoading, error } = useStockHistory(symbol, range);

    // recharts expects plain objects; ensure stable keys
    // after (robust: handles Date, string, or ms number)
    const chartData = useMemo(() => {
        return (data || []).map((d) => {
            const t =
                typeof d.t === 'number'
                    ? d.t
                    : new Date(d.t).getTime(); // handles Date or ISO string
            return { t, p: d.p };
        });
    }, [data]);

    return (
        <div className="bg-white rounded-lg shadow p-4 mt-6">
            {/* Header / Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="text-lg font-semibold">Price Trend</h3>
                <div className="flex gap-2">
                    {['intraday', 'daily', 'weekly', 'monthly'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-3 py-1 rounded border ${range === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'
                                }`}
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* States */}
            {!symbol && <div className="text-gray-500">No symbol.</div>}
            {symbol && isLoading && <div className="text-gray-500">Loading {range} data…</div>}
            {symbol && error && (
                <div className="text-red-600">Failed to load {range} data: {error.message}</div>
            )}
            {symbol && !isLoading && !error && chartData.length === 0 && (
                <div className="text-gray-500">No data available.</div>
            )}

            {/* Chart */}
            {symbol && chartData.length > 0 && (
                <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="t"
                                tickFormatter={(v) => formatTick(v, range)}
                                minTickGap={20}
                            />
                            <YAxis
                                dataKey="p"
                                domain={['auto', 'auto']}
                                width={70}
                            />
                            <Tooltip
                                labelFormatter={(v) => tooltipLabelFormatter(v, range)}
                                formatter={(v) => [Number(v).toFixed(2), 'Price']}
                            />
                            <Line
                                type="monotone"
                                dataKey="p"
                                dot={false}
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
