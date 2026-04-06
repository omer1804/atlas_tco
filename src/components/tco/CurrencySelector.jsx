import React from "react";
import { useCurrency } from "../../lib/CurrencyContext";

export default function CurrencySelector() {
  const { currency, setCurrency, rate, setRate, CURRENCIES } = useCurrency();

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Currency</label>
        <select
          value={currency.code}
          onChange={(e) => {
            const selected = CURRENCIES.find((c) => c.code === e.target.value);
            setCurrency(selected);
            if (selected.code === "USD") setRate(1);
          }}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      {currency.code !== "USD" && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">
            1 USD =
          </label>
          <input
            type="number"
            min="0.0001"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 1)}
            className="w-24 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-center text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <span className="text-xs text-slate-500">{currency.code}</span>
        </div>
      )}
    </div>
  );
}