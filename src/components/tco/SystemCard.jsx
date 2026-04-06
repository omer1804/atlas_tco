import React, { useState } from "react";
import { motion } from "framer-motion";
import { formatNumber, SYSTEM_COLORS } from "./tcoData";
import { DollarSign, Cpu, Zap, Users, Droplets, Wrench } from "lucide-react";

export default function SystemCard({ system, index, convert = (v) => v, currencySymbol = "$" }) {
  const color = SYSTEM_COLORS[system.name] || "#64748b";
  const [sellingPrice, setSellingPrice] = useState("");
  const fmt = (v) => {
    const val = convert(v);
    if (Math.abs(val) >= 1000000) return `${currencySymbol}${(val / 1000000).toFixed(2)}M`;
    if (Math.abs(val) >= 1000) return `${currencySymbol}${(val / 1000).toFixed(0)}K`;
    return `${currencySymbol}${val.toFixed(0)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="h-1.5" style={{ backgroundColor: color }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">{system.name}</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
            TCO {currencySymbol}{convert(system.tco).toFixed(3)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat icon={DollarSign} label="5Y Investment" value={fmt(system.total5YInvestment)} color={color} />
          <Stat icon={DollarSign} label="System Price" value={fmt(system.capex.systemPrice)} color={color} />
          <Stat icon={Cpu} label="TPT (imp/hr)" value={
            <span>{formatNumber(system.performance.tpt)} <span className="text-[10px] font-normal text-slate-400">({formatNumber(Math.round(system.performance.yearly))}/yr)</span></span>
          } color={color} />
          <Stat icon={Users} label="Operators" value={system.opex.operatorsPerSystem} color={color} />
          <Stat icon={Droplets} label="Ink Cost" value={fmt(system.opex.ink)} color={color} />
          <Stat icon={Zap} label="Energy" value={fmt(system.opex.energyConsumption)} color={color} />
          <Stat icon={Wrench} label="Maintenance" value={fmt(system.opex.maintenance)} color={color} />
          <Stat icon={Cpu} label="5Y Impressions" value={formatNumber(system.performance.fiveYear)} color={color} />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>CAPEX / OPEX Split</span>
            <span>{((system.capex.totalCapex / system.total5YInvestment) * 100).toFixed(0)}% / {((system.opex.totalOpex / system.total5YInvestment) * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
            <div
              className="h-full rounded-l-full"
              style={{
                width: `${(system.capex.totalCapex / system.total5YInvestment) * 100}%`,
                backgroundColor: "#3b82f6",
              }}
            />
            <div
              className="h-full rounded-r-full"
              style={{
                width: `${(system.opex.totalOpex / system.total5YInvestment) * 100}%`,
                backgroundColor: "#10b981",
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}10` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 leading-tight">{label}</p>
        <p className="text-xs font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}