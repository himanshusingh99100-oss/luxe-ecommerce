"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" }
];

const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  JPY: 155.0,
  AUD: 1.50,
  CAD: 1.36
};

interface CurrencyContextProps {
  currency: Currency;
  setCurrencyByCode: (code: string) => void;
  formatPrice: (priceInUSD: number) => string;
  exchangeRates: Record<string, number>;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0]);
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);

  // Fetch live exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates) {
            const newRates: Record<string, number> = {};
            SUPPORTED_CURRENCIES.forEach((c) => {
              if (data.rates[c.code]) {
                newRates[c.code] = data.rates[c.code];
              } else {
                newRates[c.code] = FALLBACK_RATES[c.code];
              }
            });
            setRates(newRates);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch live exchange rates, using fallbacks.", err);
      }
    };
    fetchRates();
  }, []);

  // Detect location / local timezone on first visit
  useEffect(() => {
    const savedCode = localStorage.getItem("selected_currency");
    if (savedCode) {
      const found = SUPPORTED_CURRENCIES.find((c) => c.code === savedCode);
      if (found) setCurrency(found);
    } else {
      const detectCurrency = async () => {
        // Fallback checks using locale and timezone
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        let detectedCode = "USD";

        if (tz.includes("Kolkata") || tz.includes("Calcutta") || tz.includes("India") || tz.includes("Asia/Colombo") || tz.includes("Asia/Kathmandu")) {
          detectedCode = "INR";
        } else if (tz.includes("Europe")) {
          detectedCode = "EUR";
        } else if (tz.includes("London") || tz.includes("Belfast") || tz.includes("Dublin")) {
          detectedCode = "GBP";
        } else if (tz.includes("Dubai") || tz.includes("Abu_Dhabi")) {
          detectedCode = "AED";
        } else if (tz.includes("Tokyo") || tz.includes("Japan")) {
          detectedCode = "JPY";
        } else if (tz.includes("Australia") || tz.includes("Sydney") || tz.includes("Melbourne")) {
          detectedCode = "AUD";
        } else if (tz.includes("Canada") || tz.includes("Toronto") || tz.includes("Vancouver")) {
          detectedCode = "CAD";
        }

        // Try IP geo-api detection
        try {
          const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(1500) });
          if (res.ok) {
            const data = await res.json();
            const country = data.country_code;
            if (country === "IN") detectedCode = "INR";
            else if (["FR", "DE", "IT", "ES", "NL", "BE", "AT", "FI", "IE", "GR", "PT"].includes(country)) detectedCode = "EUR";
            else if (country === "GB") detectedCode = "GBP";
            else if (country === "AE") detectedCode = "AED";
            else if (country === "JP") detectedCode = "JPY";
            else if (country === "AU") detectedCode = "AUD";
            else if (country === "CA") detectedCode = "CAD";
          }
        } catch (e) {
          // Silent catch - use tz detection result
        }

        const found = SUPPORTED_CURRENCIES.find((c) => c.code === detectedCode);
        if (found) {
          setCurrency(found);
          localStorage.setItem("selected_currency", detectedCode);
        }
      };

      detectCurrency();
    }
  }, []);

  const setCurrencyByCode = (code: string) => {
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrency(found);
      localStorage.setItem("selected_currency", code);
    }
  };

  const formatPrice = (priceInUSD: number) => {
    const rate = rates[currency.code] || FALLBACK_RATES[currency.code] || 1.0;
    const converted = priceInUSD * rate;

    // Use built-in locale formatting
    let locale = "en-US";
    if (currency.code === "INR") locale = "en-IN";
    else if (currency.code === "EUR") locale = "de-DE";
    else if (currency.code === "GBP") locale = "en-GB";
    else if (currency.code === "AED") locale = "ar-AE";
    else if (currency.code === "JPY") locale = "ja-JP";
    else if (currency.code === "AUD") locale = "en-AU";
    else if (currency.code === "CAD") locale = "en-CA";

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: currency.code === "JPY" ? 0 : 2,
        maximumFractionDigits: currency.code === "JPY" ? 0 : 2
      }).format(converted);
    } catch (e) {
      // Fallback display
      return `${currency.symbol}${converted.toFixed(2)}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyByCode, formatPrice, exchangeRates: rates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
