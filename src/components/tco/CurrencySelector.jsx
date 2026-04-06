import React, { useState } from "react";
import { CURRENCIES, useCurrency } from "../../lib/CurrencyContext";

export default function CurrencySelector() {
  const { currency, setCurrency, setRate } = useCurrency();

  const [localCode, setLocalCode] = useState(currency.code);
  const [localRate, setLocalRate] = useState(1);

  function handleApply() {
    const selected = CURRENCIES.find((c) => c.code === localCode);
    setCurrency(selected);
    setRate(selected.code === "USD" ? 1 : parseFloat(localRate) || 1);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Currency</label>
      <select
        value={localCode}
        onChange={(e) => {
          setLocalCode(e.target.value);
          if (e.target.value === "USD") setLocalRate(1);
        }}
        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code} — {c.name}
          </option>
        ))}
      </select>

      {localCode !== "USD" && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 whitespace-nowrap">1 USD =</span>
          <input
            type="number"
            min="0.0001"
            step="0.01"
            value={localRate}
            onChange={(e) => setLocalRate(e.target.value)}
            className="w-20 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-center text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <span className="text-xs text-slate-500">{localCode}</span>
        </div>
      )}

      <button
        onClick={handleApply}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all"
      >
        Apply
      </button>
    </div>
  );
}