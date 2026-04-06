import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatNumber, SYSTEM_COLORS } from "./tcoData";
import { motion } from "framer-motion";

export default function PerformanceTable({ systems, title, convert = (v) => v, currencySymbol = "$" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="p-6 pb-0">
        <h3 className="text-base font-semibold text-slate-900 mb-4">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="text-xs font-semibold text-slate-500">System</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 text-right">TPT (imp/hr)</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 text-right">Availability</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 text-right">Utilization</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 text-right">1Y Impressions</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 text-right">5Y Impressions</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 text-right">CPP ({currencySymbol})</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 text-right">TCO ({currencySymbol})</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {systems.map((s) => (
              <TableRow key={s.name} className="hover:bg-slate-50/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SYSTEM_COLORS[s.name] || "#64748b" }} />
                    <span className="font-medium text-sm text-slate-900">{s.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm">{formatNumber(s.performance.tpt)}</TableCell>
                <TableCell className="text-right text-sm">{(s.performance.availability * 100).toFixed(0)}%</TableCell>
                <TableCell className="text-right text-sm">{(s.performance.utilization * 100).toFixed(0)}%</TableCell>
                <TableCell className="text-right text-sm">{formatNumber(s.performance.yearly)}</TableCell>
                <TableCell className="text-right text-sm">{formatNumber(s.performance.fiveYear)}</TableCell>
                <TableCell className="text-right text-sm font-medium">{currencySymbol}{convert(s.opex.cpp).toFixed(3)}</TableCell>
                <TableCell className="text-right text-sm font-bold">{currencySymbol}{convert(s.tco).toFixed(3)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}