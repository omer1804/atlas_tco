import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { SYSTEM_COLORS } from "./tcoData";

const CustomTooltip = ({ active, payload, label, currencySymbol = "$" }) => {
  if (!active || !payload?.length) return null;
  const fmt = (v) => {
    if (v >= 1000000) return `${currencySymbol}${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return `${currencySymbol}${(v / 1000).toFixed(0)}K`;
    return `${currencySymbol}${v.toFixed(3)}`;
  };
  return (
    <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-slate-300">
          {p.name}: <span className="text-white font-medium">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

export default function TCOBarChart({ data, dataKey, title, yAxisLabel, currencySymbol = "$" }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => {
              if (v >= 1000000) return `${currencySymbol}${(v / 1000000).toFixed(1)}M`;
              if (v >= 1000) return `${currencySymbol}${(v / 1000).toFixed(0)}K`;
              return `${currencySymbol}${v.toFixed(2)}`;
            }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 } : undefined}
          />
          <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} />
          <Bar dataKey={dataKey} radius={[8, 8, 0, 0]} barSize={48}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={SYSTEM_COLORS[entry.name] || "#64748b"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}