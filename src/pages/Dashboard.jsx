import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingDown, Printer, BarChart3 } from "lucide-react";
import KPICard from "../components/tco/KPICard";
import TCOBarChart from "../components/tco/TCOBarChart";
import CapexOpexChart from "../components/tco/CapexOpexChart";
import CostBreakdownChart from "../components/tco/CostBreakdownChart";
import SystemCard from "../components/tco/SystemCard";
import PerformanceTable from "../components/tco/PerformanceTable";
import {
  elecFactorData,
  tcoHighData,
  cppBreakdownElec,
  cppBreakdownHigh,
  formatCurrency,
} from "../components/tco/tcoData";

export default function Dashboard() {
  const [scenario, setScenario] = useState("elec");

  const dataset = scenario === "elec" ? elecFactorData : tcoHighData;
  const cppData = scenario === "elec" ? cppBreakdownElec : cppBreakdownHigh;
  const systems = dataset.systems;

  const lowestTCO = systems.reduce((min, s) => (s.tco < min.tco ? s : min), systems[0]);
  const totalInvestmentAvg = systems.reduce((sum, s) => sum + s.total5YInvestment, 0) / systems.length;
  const highestTPT = systems.reduce((max, s) => (s.performance.tpt > max.performance.tpt ? s : max), systems[0]);

  const tcoChartData = systems.map((s) => ({ name: s.name, TCO: s.tco }));
  const investmentChartData = systems.map((s) => ({ name: s.name, Investment: s.total5YInvestment }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Atlas TCO Analyzer</h1>
            <p className="text-sm text-slate-500 mt-0.5">5-Year Total Cost of Ownership Comparison</p>
          </div>
          <Tabs value={scenario} onValueChange={setScenario}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="elec" className="text-xs">Standard Electricity</TabsTrigger>
              <TabsTrigger value="high" className="text-xs">High Electricity</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Lowest TCO"
            value={`$${lowestTCO.tco.toFixed(3)}`}
            subtitle={lowestTCO.name}
            icon={TrendingDown}
            color="#10b981"
            delay={0}
          />
          <KPICard
            label="Systems Compared"
            value={systems.length}
            subtitle={dataset.name}
            icon={Printer}
            color="#3b82f6"
            delay={0.1}
          />
          <KPICard
            label="Avg 5Y Investment"
            value={formatCurrency(totalInvestmentAvg)}
            subtitle="Per system"
            icon={DollarSign}
            color="#8b5cf6"
            delay={0.2}
          />
          <KPICard
            label="Highest Throughput"
            value={`${highestTPT.performance.tpt} imp/hr`}
            subtitle={highestTPT.name}
            icon={BarChart3}
            color="#f59e0b"
            delay={0.3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TCOBarChart data={tcoChartData} dataKey="TCO" title="TCO per Impression ($)" yAxisLabel="$/impression" />
          <CapexOpexChart systems={systems} title="CAPEX vs OPEX Breakdown" />
        </div>

        {/* Investment + Cost Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TCOBarChart data={investmentChartData} dataKey="Investment" title="Total 5-Year Investment" yAxisLabel="$" />
          <CostBreakdownChart data={cppData} title="Cost Per Print Breakdown ($)" />
        </div>

        {/* Performance Table */}
        <PerformanceTable systems={systems} title="Performance & Cost Comparison" />

        {/* System Cards */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">System Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {systems.map((system, i) => (
              <SystemCard key={system.name} system={system} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs text-slate-400 text-center">Atlas TCO Comparison · Data based on 5-year projection · All costs in USD</p>
        </div>
      </div>
    </div>
  );
}