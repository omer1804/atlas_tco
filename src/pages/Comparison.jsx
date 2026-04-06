import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { exportSystemsToCSV } from "../utils/exportToExcel";
import CurrencySelector from "../components/tco/CurrencySelector";
import { computeSystem, DEFAULT_SYSTEMS } from "../components/tco/tcoCalculations";
import { computeDTF, DEFAULT_DTF_INPUTS, computeScreen, getScreenCPP, getScreenBreakdown } from "../components/tco/competitorCalculations";
import { formatCurrency, SYSTEM_COLORS } from "../components/tco/tcoData";
import InputsPanel from "../components/tco/InputsPanel";
import KornitSelector from "../components/tco/KornitSelector";
import DTFInputsPanel from "../components/tco/DTFInputsPanel";
import ScreenInputsPanel from "../components/tco/ScreenInputsPanel";
import ComparisonChart from "../components/tco/ComparisonChart";
import ComparisonCards from "../components/tco/ComparisonCards";
import FormulaPanel from "../components/tco/FormulaPanel";
import { useCurrency } from "../lib/CurrencyContext";

export default function Comparison() {
  const { convert, currency } = useCurrency();
  const sym = currency.symbol;

  // helper: format a USD value into converted currency string
  function fmt(usdValue) {
    const val = convert(usdValue);
    if (Math.abs(val) >= 1000000) return `${sym}${(val / 1000000).toFixed(2)}M`;
    if (Math.abs(val) >= 1000) return `${sym}${(val / 1000).toFixed(0)}K`;
    return `${sym}${val.toFixed(2)}`;
  }

  // ── Fabric type (must be first — used by Kornit useMemo below) ────────────
  const [fabric, setFabric] = useState("cotton"); // "cotton" | "polyester"

  // ── Kornit state ──────────────────────────────────────────────────────────
  const [systemsInputs, setSystemsInputs] = useState(
    DEFAULT_SYSTEMS.map((s) => ({ name: s.name, inputs: { ...s.inputs } }))
  );
  const [selectedKornit, setSelectedKornit] = useState(DEFAULT_SYSTEMS[0].name);
  const [showKornitInputs, setShowKornitInputs] = useState(false);

  // Compute systems using current inputs as-is (user can override freely)
  const allKornitSystems = useMemo(() => systemsInputs.map((s) => {
    return computeSystem(s);
  }), [systemsInputs]);

  const kornitSystem = useMemo(
    () => allKornitSystems.find((s) => s.name === selectedKornit) || allKornitSystems[0],
    [allKornitSystems, selectedKornit]
  );

  function handleKornitUpdate(systemName, field, value) {
    setSystemsInputs((prev) =>
      prev.map((s) => (s.name === systemName ? { ...s, inputs: { ...s.inputs, [field]: value } } : s))
    );
  }

  // ── DTF state ─────────────────────────────────────────────────────────────
  const [dtfInputs, setDtfInputs] = useState({ ...DEFAULT_DTF_INPUTS });
  const [showDTFInputs, setShowDTFInputs] = useState(false);
  const dtfResult = useMemo(() => computeDTF(dtfInputs), [dtfInputs]);

  function handleDTFChange(key, value) {
    setDtfInputs((prev) => ({ ...prev, [key]: value }));
  }

  // ── Screen state ──────────────────────────────────────────────────────────
  const [runLength, setRunLength] = useState(100);
  const [numColors, setNumColors] = useState(7);
  const [screenLaborCost, setScreenLaborCost] = useState(20);
  const [showScreenInputs, setShowScreenInputs] = useState(false);

  const screenCPP = useMemo(
    () => getScreenCPP(runLength, numColors, screenLaborCost) + (fabric === "polyester" ? 0.2 : 0),
    [runLength, numColors, fabric, screenLaborCost]
  );

  // ── Chart data (stacked: labor / consumables / setup / capex) ──────────────
  const screenBreakdown = useMemo(
    () => getScreenBreakdown(runLength, numColors, fabric === "polyester" ? 0.2 : 0, screenLaborCost),
    [runLength, numColors, fabric, screenLaborCost]
  );

  const chartData = useMemo(() => {
    // Kornit: derive per-impression components from 5Y totals
    const k = kornitSystem;
    const kImpr = k.performance.fiveYear;
    const kCapexPerImp = (k.capex.totalCapex - k.capex.assetValueAfter5Y) / kImpr;
    const kLaborPerImp = k.opex.labor / kImpr;
    const kConsumablesPerImp = k.opex.ink / kImpr;
    const kKnown = kCapexPerImp + kLaborPerImp + kConsumablesPerImp;
    const kOthers = Math.max(0, k.tco - kKnown);

    // DTF: derive per-impression components
    const d = dtfResult;
    const dImpr = d.fiveYearImpressions;
    const dCapexPerImp = (d.totalCapex - d.assetValueAfter5Y) / dImpr;
    const dLaborPerImp = d.labor5Y / dImpr;
    const dConsumablesPerImp = d.consumables5Y / dImpr;
    const dKnown = dCapexPerImp + dLaborPerImp + dConsumablesPerImp;
    const dOthers = Math.max(0, d.tco - dKnown);

    // Screen: merge setup into labor
    const sKnown = screenBreakdown.labor + screenBreakdown.consumables + screenBreakdown.setup;

    return [
      {
        name: kornitSystem.name,
        labor: kLaborPerImp,
        consumables: kConsumablesPerImp,
        capex: kCapexPerImp,
        others: kOthers,
      },
      {
        name: "DTF",
        labor: dLaborPerImp,
        consumables: dConsumablesPerImp,
        capex: dCapexPerImp,
        others: dOthers,
      },
      {
        name: `Screen (${runLength}pcs, ${numColors}sc)`,
        labor: screenBreakdown.labor + screenBreakdown.setup + Math.max(0, screenCPP - sKnown),
        consumables: screenBreakdown.consumables,
        capex: 0,
        others: 0,
      },
    ];
  }, [kornitSystem, dtfResult, screenBreakdown, runLength, numColors, screenCPP]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Technology Comparison</h1>
            <p className="text-sm text-slate-500 mt-0.5">Kornit Digital vs. DTF vs. Screen Printing · TCO per Impression</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <CurrencySelector />
            <button
              onClick={() => exportSystemsToCSV([kornitSystem], systemsInputs.filter((s) => s.name === selectedKornit))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Fabric toggle */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Fabric Type</p>
          <div className="flex gap-3">
            {["cotton", "polyester"].map((f) => (
            <button
            key={f}
            onClick={() => {
              setFabric(f);
              const overrides = f === "polyester" ? { avgInkLaydown: 6.8, tpt: 80 } : { avgInkLaydown: 4.7, tpt: 103 };
              setSystemsInputs((prev) => prev.map((s) => ({ ...s, inputs: { ...s.inputs, ...overrides } })));
            }}
            className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all ${
              fabric === f
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400"
            }`}
            >
            {f === "cotton" ? "Cotton" : "Polyester"}
            </button>
            ))}
          </div>
          {fabric === "polyester" && (
          <p className="text-xs text-amber-600 mt-2">+$0.20 added to Screen Printing TCO for polyester ink/adhesive.</p>
          )}
        </div>

        {/* Kornit System Selector */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Select Kornit System</p>
          <div className="flex flex-wrap gap-2">
            {allKornitSystems.map((s) => {
              const active = selectedKornit === s.name;
              const color = "#3b82f6";
              return (
                <button
                  key={s.name}
                  onClick={() => setSelectedKornit(s.name)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    backgroundColor: active ? "#3b82f615" : "#f8fafc",
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

        {/* Three-column panels: Kornit + DTF + Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kornit */}
          <div className="space-y-3">
            <button
              onClick={() => setShowKornitInputs((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-all"
            >
              <span>Kornit Settings</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-normal">TCO: {sym}{convert(kornitSystem.tco).toFixed(3)}/imp</span>
                {showKornitInputs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            {showKornitInputs && (
              <InputsPanel
                systemsInputs={systemsInputs.filter((s) => s.name === selectedKornit)}
                onUpdate={handleKornitUpdate}
                onReset={() => setSystemsInputs(DEFAULT_SYSTEMS.map((s) => ({ name: s.name, inputs: { ...s.inputs } })))}
              />
            )}
          </div>

          {/* DTF */}
          <div className="space-y-3">
            <button
              onClick={() => setShowDTFInputs((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm font-semibold text-orange-700 hover:bg-orange-100 transition-all"
            >
              <span>DTF Settings</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-normal">TCO: {sym}{convert(dtfResult.tco).toFixed(2)}/imp</span>
                {showDTFInputs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            {showDTFInputs && (
              <DTFInputsPanel
                inputs={dtfInputs}
                onChange={handleDTFChange}
                onReset={() => setDtfInputs({ ...DEFAULT_DTF_INPUTS })}
              />
            )}
          </div>

          {/* Screen */}
          <div className="space-y-3">
            <button
              onClick={() => setShowScreenInputs((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl text-sm font-semibold text-purple-700 hover:bg-purple-100 transition-all"
            >
              <span>Screen Printing Settings</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-normal">TCO: {sym}{convert(screenCPP).toFixed(2)}</span>
                {showScreenInputs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            {showScreenInputs && (
              <ScreenInputsPanel
                runLength={runLength}
                numColors={numColors}
                onRunLengthChange={setRunLength}
                onNumColorsChange={setNumColors}
                fabric={fabric}
                laborCostPerHr={screenLaborCost}
                onLaborCostChange={setScreenLaborCost}
              />
            )}
          </div>
        </div>{/* end 3-col grid */}

        {/* Chart + Summary side by side */}
        <div className="flex gap-6 items-stretch">
          {/* Chart — left, takes majority of width */}
          <div className="flex-1 min-w-0">
            <ComparisonChart data={chartData} title="TCO Comparison" convert={convert} currencySymbol={sym} />
          </div>

          {/* Summary cards — right, stacked vertically, same height as chart */}
          <div className="flex flex-col gap-3 w-64 shrink-0">
            {/* Kornit */}
            <div className="flex-1 bg-white rounded-2xl border border-blue-100 p-4 shadow-sm flex flex-col">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">{kornitSystem.name}</p>
              <div className="flex flex-col gap-1.5 flex-1 justify-around text-xs">
                {[
                  ["CAPEX", fmt(kornitSystem.capex.totalCapex)],
                  ["Throughput", `${kornitSystem.performance.tpt} imp/hr`],
                  ["Ink/imp", `${sym}${convert(kornitSystem.opex.cpp).toFixed(3)}`],
                  ["Labor 5Y", fmt(kornitSystem.opex.labor)],
                  ["TCO/imp", `${sym}${convert(kornitSystem.tco).toFixed(3)}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center border-b border-blue-50 pb-1 last:border-0 last:pb-0">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-bold text-blue-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DTF */}
            <div className="flex-1 bg-white rounded-2xl border border-orange-100 p-4 shadow-sm flex flex-col">
              <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2">DTF</p>
              <div className="flex flex-col gap-1.5 flex-1 justify-around text-xs">
                {[
                  ["CAPEX", fmt(dtfResult.totalCapex)],
                  ["Throughput", `${dtfResult.effectiveTPH.toFixed(0)} imp/hr`],
                  ["Consumables/imp", `${sym}${convert(dtfResult.cpp).toFixed(3)}`],
                  ["Labor 5Y", fmt(dtfResult.labor5Y)],
                  ["TCO/imp", `${sym}${convert(dtfResult.tco).toFixed(3)}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center border-b border-orange-50 pb-1 last:border-0 last:pb-0">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-bold text-orange-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Screen */}
            <div className="flex-1 bg-white rounded-2xl border border-purple-100 p-4 shadow-sm flex flex-col">
              <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-2">Screen Printing</p>
              <div className="flex flex-col gap-1.5 flex-1 justify-around text-xs">
                {[
                  ["Run Length", `${runLength} pcs`],
                  ["# Screens", `${numColors}`],
                  ["Low-run TCO", `${sym}${convert(getScreenCPP(10, numColors, screenLaborCost) + (fabric === "polyester" ? 0.2 : 0)).toFixed(2)} (10pcs)`],
                  ["High-run TCO", `${sym}${convert(getScreenCPP(500, numColors, screenLaborCost) + (fabric === "polyester" ? 0.2 : 0)).toFixed(2)} (500pcs)`],
                  ["TCO/imp", `${sym}${convert(screenCPP).toFixed(3)}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center border-b border-purple-50 pb-1 last:border-0 last:pb-0">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-bold text-purple-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Formula Panel */}
        <FormulaPanel />

        {/* Disclaimer */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-500 text-center">
          All calculations are based on assumptions, estimates, and inputs provided, and cannot be taken as definitive results or contractual commitments.
        </div>

      </div>

      <div className="border-t border-slate-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="text-xs text-slate-400 text-center">Technology Comparison · 5-Year Projection · All costs in {currency.code}</p>
        </div>
      </div>
    </div>
  );
}