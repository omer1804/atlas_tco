import React, { useState, useEffect } from "react";
import { useCurrency } from "../../lib/CurrencyContext";
import { Check } from "lucide-react";

export default function CurrencySelector() {
  const { currency, setCurrency, rate, setRate, CURRENCIES } = useCurrency();

  const [localCurrency, setLocalCurrency] = useState(currency);
  const [localRate, setLocalRate] = useState(rate);

  useEffect(() => {
    setLocalCurrency(currency);
    setLocalRate(rate);
  }, [currency, rate]);

  function handleApply() {
    setCurrency(localCurrency);
    setRate(localCurrency.code === "USD" ? 1 : (parseFloat(localRate) || 1));
  }

  const isDirty = localCurrency.code !== currency.code || parseFloat(localRate) !== rate;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Currency</label>
      <select
        value={localCurrency.code}
        onChange={(e) => {
          const selected = CURRENCIES.find((c) => c.code === e.target.value);
          setLocalCurrency(selected);
          if (selected.code === "USD") setLocalRate(1);
        }}
        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code} — {c.name}
          </option>
        ))}
      </select>

      {localCurrency.code !== "USD" && (
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
          <span className="text-xs text-slate-500">{localCurrency.code}</span>
        </div>
      )}

      <button
        onClick={handleApply}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          isDirty
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            : "bg-slate-100 text-slate-400 cursor-default"
        }`}
        disabled={!isDirty}
      >
        <Check className="w-3.5 h-3.5" />
        Apply
      </button>
    </div>
  );
}