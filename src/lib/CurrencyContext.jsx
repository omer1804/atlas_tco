import React, { createContext, useContext, useState, useCallback } from "react";

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
];

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [rate, setRate] = useState(1);

  const convert = useCallback((usdValue) => usdValue * rate, [rate]);

  const formatConverted = useCallback((usdValue) => {
    const val = usdValue * rate;
    if (Math.abs(val) >= 1000000) return `${currency.symbol}${(val / 1000000).toFixed(2)}M`;
    if (Math.abs(val) >= 1000) return `${currency.symbol}${(val / 1000).toFixed(0)}K`;
    return `${currency.symbol}${val.toFixed(2)}`;
  }, [rate, currency.symbol]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate, setRate, convert, formatConverted, CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}