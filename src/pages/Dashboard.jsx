import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { DollarSign, TrendingDown, Printer, BarChart3, Settings, Download } from "lucide-react";
import { exportSystemsToCSV } from "../utils/exportToExcel";
import KPICard from "../components/tco/KPICard";
import TCOBarChart from "../components/tco/TCOBarChart";
import CapexOpexChart from "../components/tco/CapexOpexChart";
import SystemCard from "../components/tco/SystemCard";
import PerformanceTable from "../components/tco/PerformanceTable";
import InputsPanel from "../components/tco/InputsPanel";
import CurrencySelector from "../components/tco/CurrencySelector";
import FormulaPanel from "../components/tco/FormulaPanel";
import { computeSystem, DEFAULT_SYSTEMS } from "../components/tco/tcoCalculations";
import { formatCurrency, SYSTEM_COLORS } from "../components/tco/tcoData";
import { useCurrency } from "../lib/CurrencyContext";
import { logUsageEvent } from "../lib/usageTracking";

export default function Dashboard() {
  const [systemsInputs, setSystemsInputs] = useState(
    DEFAULT_SYSTEMS.map((s) => ({ name: s.name, inputs: { ...s.inputs } }))
  );
  const [showInputs, setShowInputs] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState(
    DEFAULT_SYSTEMS.map((s) => s.name)
  );

  const allSystems = useMemo(() => systemsInputs.map(computeSystem), [systemsInputs]);
  const systems = useMemo(() => allSystems.filter((s) => selectedSystems.includes(s.name)), [allSystems, selectedSystems]);

  function toggleSystem(name) {
    setSelectedSystems((prev) =>
      prev.includes(name)
        ? prev.length > 1 ? prev.filter((n) => n !== name) : prev
        : [...prev, name]
    );
  }

  function handleUpdate(systemName, field, value) {
    setSystemsInputs((prev) =>
      prev.map((s) =>
        s.name === systemName ? { ...s, inputs: { ...s.inputs, [field]: value } } : s
      )
    );
  }

  function handleReset() {
    setSystemsInputs(DEFAULT_SYSTEMS.map((s) => ({ name: s.name, inputs: { ...s.inputs } })));
  }

  const { formatConverted, convert, currency } = useCurrency();

  const lowestTCO = systems.reduce((min, s) => (s.tco < min.tco ? s : min), systems[0]);
  const totalInvestmentAvg = systems.reduce((sum, s) => sum + s.total5YInvestment, 0) / systems.length;
  const highestTPT = systems.reduce((max, s) => (s.performance.tpt > max.performance.tpt ? s : max), systems[0]);

  const tcoChartData = systems.map((s) => ({ name: s.name, TCO: parseFloat(convert(s.tco).toFixed(4)) }));
  const investmentChartData = systems.map((s) => ({ name: s.name, Investment: convert(s.total5YInvestment) }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Atlas TCO Analyzer</h1>
            <p className="text-sm text-slate-500 mt-0.5">5-Year Total Cost of Ownership · Standard Electricity</p>
            <Link to="/Comparison" className="text-xs text-blue-500 hover:underline mt-1 inline-block">→ Compare vs DTF &amp; Screen</Link>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <CurrencySelector />
            <button
              onClick={() => {
                exportSystemsToCSV(systems, systemsInputs);
                logUsageEvent({
                  eventType: 'calculation_completed',
                  pageOrAction: 'Dashboard',
                  details: `systems=${systems.map((s) => s.name).join('|')}`,
                });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={() => setShowInputs((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                showInputs
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Settings className="w-4 h-4" />
              Edit Inputs
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* System Selector */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Select systems to compare</p>
          <div className="flex flex-wrap gap-2">
            {allSystems.map((s) => {
              const active = selectedSystems.includes(s.name);
              const color = SYSTEM_COLORS[s.name] || "#64748b";
              return (
                <button
                  key={s.name}
                  onClick={() => toggleSystem(s.name)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    backgroundColor: active ? `${color}15` : "#f8fafc",
                    borderColor: active ? color : "#e2e8f0",
                    color: active ? color : "#94a3b8",
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: active ? color : "#cbd5e1" }} />
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs Panel */}
        {showInputs && (
          <InputsPanel
            systemsInputs={systemsInputs.filter((s) => selectedSystems.includes(s.name))}
            onUpdate={handleUpdate}
            onReset={handleReset}
          />
        )}



        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TCOBarChart data={tcoChartData} dataKey="TCO" title={`TCO per Impression (${currency.code})`} yAxisLabel={`${currency.symbol}/impression`} currencySymbol={currency.symbol} />
          <CapexOpexChart systems={systems} title="CAPEX vs OPEX Breakdown" convert={convert} currencySymbol={currency.symbol} />
        </div>

        {/* Investment */}
        <TCOBarChart data={investmentChartData} dataKey="Investment" title={`Total 5-Year Investment (${currency.code})`} yAxisLabel={currency.symbol} currencySymbol={currency.symbol} />

        {/* Formula Panel trigger */}
        <FormulaPanel />

        {/* Performance Table */}
        <PerformanceTable systems={systems} title="Performance & Cost Comparison" convert={convert} currencySymbol={currency.symbol} />

        {/* System Cards */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">System Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {systems.map((system, i) => (
              <SystemCard key={system.name} system={system} index={i} convert={convert} currencySymbol={currency.symbol} />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs text-slate-400 text-center">Atlas TCO Comparison · Data based on 5-year projection · All costs in {currency.code}</p>
        </div>
      </div>
    </div>
  );
}