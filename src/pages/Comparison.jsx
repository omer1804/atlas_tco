import React, { useState, useMemo } from "react";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";
import { computeSystem, DEFAULT_SYSTEMS } from "../components/tco/tcoCalculations";
import { computeDTF, DEFAULT_DTF_INPUTS, computeScreen, getScreenCPP, getScreenBreakdown } from "../components/tco/competitorCalculations";
import { formatCurrency, SYSTEM_COLORS } from "../components/tco/tcoData";
import InputsPanel from "../components/tco/InputsPanel";
import KornitSelector from "../components/tco/KornitSelector";
import DTFInputsPanel from "../components/tco/DTFInputsPanel";
import ScreenInputsPanel from "../components/tco/ScreenInputsPanel";
import ComparisonChart from "../components/tco/ComparisonChart";
import ComparisonCards from "../components/tco/ComparisonCards";

export default function Comparison() {
  // ── Kornit state ──────────────────────────────────────────────────────────
  const [systemsInputs, setSystemsInputs] = useState(
    DEFAULT_SYSTEMS.map((s) => ({ name: s.name, inputs: { ...s.inputs } }))
  );
  const [selectedKornit, setSelectedKornit] = useState(DEFAULT_SYSTEMS[0].name);
  const [showKornitInputs, setShowKornitInputs] = useState(false);

  const allKornitSystems = useMemo(() => systemsInputs.map(computeSystem), [systemsInputs]);
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

  // ── Fabric type ───────────────────────────────────────────────────────────
  const [fabric, setFabric] = useState("cotton"); // "cotton" | "polyester"

  // ── Screen state ──────────────────────────────────────────────────────────
  const [runLength, setRunLength] = useState(100);
  const [numColors, setNumColors] = useState(4);
  const [showScreenInputs, setShowScreenInputs] = useState(false);

  const screenCPP = useMemo(
    () => getScreenCPP(runLength, numColors) + (fabric === "polyester" ? 0.2 : 0),
    [runLength, numColors, fabric]
  );

  // ── Chart data (stacked: labor / consumables / setup / capex) ──────────────
  const screenBreakdown = useMemo(
    () => getScreenBreakdown(runLength, numColors, fabric === "polyester" ? 0.2 : 0),
    [runLength, numColors, fabric]
  );

  const chartData = useMemo(() => {
    // Kornit: derive per-impression components from 5Y totals
    const k = kornitSystem;
    const kImpr = k.performance.fiveYear;
    const kCapexPerImp = (k.capex.totalCapex - k.capex.assetValueAfter5Y) / kImpr;
    const kLaborPerImp = k.opex.labor / kImpr;
    const kConsumablesPerImp = k.opex.ink / kImpr;

    // DTF: derive per-impression components
    const d = dtfResult;
    const dImpr = d.fiveYearImpressions;
    const dCapexPerImp = (d.totalCapex - d.assetValueAfter5Y) / dImpr;
    const dLaborPerImp = d.labor5Y / dImpr;
    const dConsumablesPerImp = d.consumables5Y / dImpr;

    return [
      {
        name: kornitSystem.name,
        labor: kLaborPerImp,
        consumables: kConsumablesPerImp,
        setup: 0,
        capex: kCapexPerImp,
      },
      {
        name: "DTF",
        labor: dLaborPerImp,
        consumables: dConsumablesPerImp,
        setup: 0,
        capex: dCapexPerImp,
      },
      {
        name: `Screen (${runLength}pcs, ${numColors}sc)`,
        labor: screenBreakdown.labor,
        consumables: screenBreakdown.consumables,
        setup: screenBreakdown.setup,
        capex: 0,
      },
    ];
  }, [kornitSystem, dtfResult, screenBreakdown, runLength, numColors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Technology Comparison</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kornit Digital vs. DTF vs. Screen Printing · TCO per Impression</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Step 1 — Kornit system selector */}
        <KornitSelector
          systems={allKornitSystems}
          selectedName={selectedKornit}
          onSelect={setSelectedKornit}
        />

        {/* Fabric toggle */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Fabric Type</p>
          <div className="flex gap-3">
            {["cotton", "polyester"].map((f) => (
            <button
            key={f}
            onClick={() => setFabric(f)}
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
                <span className="text-xs font-normal">TCO: ${kornitSystem.tco.toFixed(3)}/imp</span>
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
            {/* Kornit summary */}
            <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3">Kornit Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Total CAPEX", formatCurrency(kornitSystem.capex.totalCapex)],
                  ["Throughput", `${kornitSystem.performance.tpt} imp/hr`],
                  ["Operators", kornitSystem.opex.operatorsPerSystem],
                  ["Ink/Consumables", `$${kornitSystem.opex.cpp.toFixed(3)}`],
                  ["Labor 5Y", formatCurrency(kornitSystem.opex.labor)],
                  ["TCO/impression", `$${kornitSystem.tco.toFixed(3)}`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-blue-50 rounded-lg p-2">
                    <p className="text-blue-400 text-[10px]">{label}</p>
                    <p className="text-blue-800 font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DTF */}
          <div className="space-y-3">
            <button
              onClick={() => setShowDTFInputs((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm font-semibold text-orange-700 hover:bg-orange-100 transition-all"
            >
              <span>DTF Settings</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-normal">TCO: ${dtfResult.tco.toFixed(2)}/imp</span>
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
            {/* DTF summary */}
            <div className="bg-white rounded-2xl border border-orange-100 p-4 shadow-sm">
              <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-3">DTF Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Total CAPEX", formatCurrency(dtfResult.totalCapex)],
                  ["Throughput", `${dtfResult.effectiveTPH.toFixed(0)} imp/hr`],
                  ["Operators", dtfResult.totalOperators],
                  ["Consumables/imp", `$${dtfResult.cpp.toFixed(3)}`],
                  ["Labor 5Y", formatCurrency(dtfResult.labor5Y)],
                  ["TCO/impression", `$${dtfResult.tco.toFixed(3)}`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-orange-50 rounded-lg p-2">
                    <p className="text-orange-400 text-[10px]">{label}</p>
                    <p className="text-orange-800 font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Screen */}
          <div className="space-y-3">
            <button
              onClick={() => setShowScreenInputs((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl text-sm font-semibold text-purple-700 hover:bg-purple-100 transition-all"
            >
              <span>Screen Printing Settings</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-normal">TCO: ${screenCPP.toFixed(2)}</span>
                {showScreenInputs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            {showScreenInputs && (
              <ScreenInputsPanel
                runLength={runLength}
                numColors={numColors}
                onRunLengthChange={setRunLength}
                onNumColorsChange={setNumColors}
              />
            )}
            {/* Screen summary */}
            <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-sm">
              <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-3">Screen Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Run Length", `${runLength} pcs`],
                  ["# Screens", `${numColors} screens`],
                  ["TCO (from table)", `$${screenCPP.toFixed(2)}${fabric === "polyester" ? " (+$0.20 poly)" : ""}`],
                  ["Low-run TCO", `$${getScreenCPP(10, numColors).toFixed(2)} (10pcs)`],
                  ["High-run TCO", `$${getScreenCPP(500, numColors).toFixed(2)} (500pcs)`],
                  ["Throughput", "400 shirts/hr"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-purple-50 rounded-lg p-2">
                    <p className="text-purple-400 text-[10px]">{label}</p>
                    <p className="text-purple-800 font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>{/* end 3-col grid */}

        {/* Comparison Chart */}
        <ComparisonChart data={chartData} title="TCO Comparison" />

        {/* Comparison Cards */}
        <ComparisonCards
          kornit={kornitSystem}
          dtf={dtfResult}
          screenCPP={screenCPP}
          screenRunLength={runLength}
          screenNumColors={numColors}
          fabric={fabric}
        />

        {/* Context note for screen */}
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 text-sm text-purple-700">
          <p className="font-semibold mb-1">Screen Printing Variability</p>
          <p className="text-xs leading-relaxed">
            Screen printing TCO ranges from <b>$0.37</b> (500 pieces, 1 screen) to <b>$182+</b> (10 pieces, 14 screens).
            The table shows actual TCO based on amortized setup costs. For long runs with few colors it can be competitive;
            for short runs or complex designs, digital printing (Kornit/DTF) is significantly more cost-effective.
          </p>
        </div>

      </div>

      <div className="border-t border-slate-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="text-xs text-slate-400 text-center">Technology Comparison · 5-Year Projection · All costs in USD</p>
        </div>
      </div>
    </div>
  );
}