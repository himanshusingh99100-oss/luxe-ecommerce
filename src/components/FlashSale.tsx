"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

interface FlashSaleProps {
  products: any[];
}

export default function FlashSale({ products }: FlashSaleProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set simulated target to end of current day
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      return { hours, minutes, seconds };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 rounded-[32px] p-8 md:p-12 shadow-sm dark:shadow-none my-16">
      {/* Header with countdown */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-gray-150 dark:border-gray-800">
        <div>
          <span className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
            Limited Time Offer
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-950 dark:text-white mt-2">
            Flash Sale
          </h2>
        </div>

        {/* Countdown boxes */}
        <div className="flex items-center space-x-2.5">
          {[
            { label: "Hours", val: timeLeft.hours },
            { label: "Minutes", val: timeLeft.minutes },
            { label: "Seconds", val: timeLeft.seconds }
          ].map((block, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="bg-gray-900 text-white font-mono font-bold text-lg md:text-xl w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
                  {block.val.toString().padStart(2, "0")}
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">{block.label}</span>
              </div>
              {i < 2 && <span className="text-xl font-bold text-gray-850 dark:text-white self-start mt-2 px-1">:</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Products list grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
