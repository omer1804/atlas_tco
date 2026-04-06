import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "./tcoData";

const CustomTooltip = ({ active, payload, label, currencySymbol, convert }) => {
  if (!active || !payload?.length) return null;
  const fmt = (v) => {
    const val = convert(v);
    if (Math.abs(val) >= 1000000) return `${currencySymbol}${(val / 1000000).toFixed(2)}M`;
    if (Math.abs(val) >= 1000) return `${currencySymbol}${(val / 1000).toFixed(0)}K`;
    return `${currencySymbol}${val.toFixed(0)}`;
  };
  return (
    <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="text-white font-medium">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

export default function CapexOpexChart({ systems, title, convert = (v) => v, currencySymbol = "$" }) {
  const data = systems.map((s) => ({
    name: s.name,
    CAPEX: s.capex.totalCapex,
    OPEX: s.opex.totalOpex,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => { const val = convert(v); if (val >= 1000000) return `${currencySymbol}${(val/1000000).toFixed(1)}M`; if (val >= 1000) return `${currencySymbol}${(val/1000).toFixed(0)}K`; return `${currencySymbol}${val.toFixed(0)}`; }} />
          <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} convert={convert} />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="CAPEX" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} barSize={48} />
          <Bar dataKey="OPEX" stackId="a" fill="#10b981" radius={[8, 8, 0, 0]} barSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}