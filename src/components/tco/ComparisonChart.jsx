import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";

// Segment colors (consistent across all technologies)
const SEG_COLORS = {
  labor: "#3b82f6",       // blue
  consumables: "#10b981", // green
  setup: "#a855f7",       // purple — screen setup / amortized screens
  capex: "#f59e0b",       // amber
  others: "#94a3b8",      // slate — maintenance, energy, footprint, etc.
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  const labels = {
    labor: "Labor",
    consumables: "Ink / Consumables",
    setup: "Screen Setup (amortized)",
    capex: "CAPEX (amortized)",
    others: "Others",
  };
  return (
    <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm min-w-[210px]">
      <p className="font-semibold mb-2 border-b border-slate-700 pb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-4 text-xs py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.fill }} />
            {labels[p.dataKey] || p.dataKey}
          </span>
          <span className="font-bold">${p.value.toFixed(3)}</span>
        </div>
      ))}
      <div className="flex justify-between text-xs pt-1.5 mt-1 border-t border-slate-700 font-bold">
        <span>Total TCO</span>
        <span>${total.toFixed(3)}</span>
      </div>
    </div>
  );
};

export default function ComparisonChart({ data, title }) {
  // Determine which segments exist in data
  const hasSetup = data.some((d) => d.setup > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 mb-5">TCO per impression broken down by cost driver</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            angle={-25}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            iconType="square"
            iconSize={10}
            formatter={(value) => {
              const map = {
                labor: "Labor",
                consumables: "Ink / Consumables",
                setup: "Screen Setup",
                capex: "CAPEX",
                others: "Others",
              };
              return <span className="text-xs text-slate-600">{map[value] || value}</span>;
            }}
          />
          <Bar dataKey="capex" name="capex" stackId="tco" fill={SEG_COLORS.capex} radius={[0, 0, 0, 0]} barSize={52} />
          <Bar dataKey="consumables" name="consumables" stackId="tco" fill={SEG_COLORS.consumables} barSize={52} />
          {hasSetup && (
            <Bar dataKey="setup" name="setup" stackId="tco" fill={SEG_COLORS.setup} barSize={52} />
          )}
          <Bar dataKey="others" name="others" stackId="tco" fill={SEG_COLORS.others} barSize={52} />
          <Bar dataKey="labor" name="labor" stackId="tco" fill={SEG_COLORS.labor} radius={[8, 8, 0, 0]} barSize={52} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}