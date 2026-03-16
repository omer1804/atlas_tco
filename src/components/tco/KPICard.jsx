import React from "react";
import { motion } from "framer-motion";

export default function KPICard({ label, value, subtitle, icon: Icon, color = "#3b82f6", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10" style={{ backgroundColor: color }} />
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}