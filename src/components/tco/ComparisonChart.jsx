import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { SYSTEM_COLORS } from "./tcoData";

const TECH_COLORS = {
  DTF: "#f97316",
  "Screen Printing": "#7c3aed",
};

function getColor(name) {
  return SYSTEM_COLORS[name] || TECH_COLORS[name] || "#64748b";
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-slate-300">
          {p.name}: <span className="text-white font-bold">${p.value.toFixed(3)}</span>
        </p>
      ))}
    </div>
  );
};

export default function ComparisonChart({ data, title }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toFixed(2)}`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="cpp" name="CPP" radius={[8, 8, 0, 0]} barSize={52}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={getColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}