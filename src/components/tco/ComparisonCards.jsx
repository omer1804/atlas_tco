import React from "react";
import { formatCurrency } from "./tcoData";
import { SYSTEM_COLORS } from "./tcoData";
import { TrendingDown, Users, Zap, DollarSign } from "lucide-react";

const TECH_COLORS = {
  DTF: "#f97316",
  "Screen Printing": "#7c3aed",
};

function getColor(name) {
  return SYSTEM_COLORS[name] || TECH_COLORS[name] || "#64748b";
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function Card({ name, cpp, stats, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 min-w-[220px]">
      <div className="h-1.5" style={{ backgroundColor: color }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">{name}</h3>
          <span
            className="text-sm font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: `${color}15`, color }}
          >
            ${typeof cpp === "number" ? cpp.toFixed(2) : cpp} CPP
          </span>
        </div>
        <div className="space-y-0">
          {stats.map((s) => (
            <StatRow key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ComparisonCards({ kornit, dtf, screenCPP, screenRunLength, screenNumColors, fabric }) {
  const kornitColor = getColor(kornit.name);

  const kornitStats = [
    { label: "5Y Total Investment", value: formatCurrency(kornit.total5YInvestment) },
    { label: "5Y Impressions", value: new Intl.NumberFormat().format(Math.round(kornit.performance.fiveYear)) },
    { label: "Ink / Consumables CPP", value: `$${kornit.opex.cpp.toFixed(3)}` },
    { label: "Labor (5Y)", value: formatCurrency(kornit.opex.labor) },
    { label: "Throughput", value: `${kornit.performance.tpt} imp/hr` },
    { label: "System CAPEX", value: formatCurrency(kornit.capex.totalCapex) },
  ];

  const dtfStats = [
    { label: "5Y Total Investment", value: formatCurrency(dtf.total5YInvestment) },
    { label: "5Y Impressions", value: new Intl.NumberFormat().format(Math.round(dtf.fiveYearImpressions)) },
    { label: "Consumables CPP", value: `$${dtf.cpp.toFixed(3)}` },
    { label: "Labor (5Y)", value: formatCurrency(dtf.labor5Y) },
    { label: "Throughput", value: `${dtf.effectiveTPH.toFixed(0)} imp/hr` },
    { label: "Total CAPEX", value: formatCurrency(dtf.totalCapex) },
    { label: "Total Operators", value: `${dtf.totalOperators}` },
  ];

  const screenStats = [
    { label: "CPP (table lookup)", value: `$${screenCPP.toFixed(2)}${fabric === "polyester" ? " (+$0.20)" : ""}` },
    { label: "Fabric", value: fabric === "polyester" ? "Polyester" : "Cotton" },
    { label: "Run length", value: `${screenRunLength} pcs` },
    { label: "# Colors", value: `${screenNumColors} colors` },
    { label: "CPP range (typical)", value: "$0.37 – $182" },
    { label: "Note", value: "Highly variable by job" },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      <Card
        name={kornit.name}
        cpp={kornit.tco.toFixed(3)}
        stats={kornitStats}
        color={kornitColor}
      />
      <Card
        name="DTF"
        cpp={dtf.tco.toFixed(3)}
        stats={dtfStats}
        color={TECH_COLORS.DTF}
      />
      <Card
        name="Screen Printing"
        cpp={screenCPP.toFixed(2)}
        stats={screenStats}
        color={TECH_COLORS["Screen Printing"]}
      />
    </div>
  );
}