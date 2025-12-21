import React, { useEffect, useState, useRef } from "react";
import api from "../lib/apiClient";

const TickerStrip = () => {
  const [data, setData] = useState([]);
  const stripRef = useRef(null);
  const positionRef = useRef(0);
  const dataRef = useRef([]); // keep latest data without restarting animation

  // Fetch data (independent of animation)
  useEffect(() => {
    const fetchMostActive = async () => {
      try {
        const res = await api.get("/stocks/ticker-strip");
        dataRef.current = res.data;
        setData(res.data); // re-render only
      } catch (err) {
        console.error("Ticker fetch error:", err.message);
      }
    };

    fetchMostActive();
    const interval = setInterval(fetchMostActive, 1000*60*60);
    return () => clearInterval(interval);
  }, []);

  // Start animation ONCE
  useEffect(() => {
    if (!stripRef.current) return;

    const container = stripRef.current.parentElement;
    positionRef.current = container.offsetWidth;

    let animationFrame;

    const scroll = () => {
      positionRef.current -= 1;

      const stripWidth = stripRef.current.scrollWidth;
      const containerWidth = container.offsetWidth;

      if (positionRef.current < -stripWidth) {
        positionRef.current = containerWidth;
      }

      stripRef.current.style.transform =
        `translateX(${positionRef.current}px)`;

      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrame);
  }, []); // 🔥 no data dependency

  return (
    <div className="w-full bg-white py-2 overflow-hidden relative">
      <div
        ref={stripRef}
        className="flex whitespace-nowrap will-change-transform"
      >
        {data.map((item) => (
          <div
            key={item.symbol}
            className="text-black px-6 text-sm flex items-center"
          >
            <span className="font-bold mr-2">{item.symbol}</span>
            <span
              className={
                item.regularMarketChangePercent >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {item.regularMarketPrice?.toFixed(2)} (
              {item.regularMarketChangePercent?.toFixed(2)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerStrip;