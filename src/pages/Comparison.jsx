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

    // Screen: absorb any gap into setup so total matches screenCPP
    const sKnown = screenBreakdown.labor + screenBreakdown.consumables + screenBreakdown.setup;
    const sSetupAdjusted = screenBreakdown.setup + Math.max(0, screenCPP - sKnown);
    const sOthers = 0;

    return [
      {
        name: kornitSystem.name,
        labor: kLaborPerImp,
        consumables: kConsumablesPerImp,
        setup: 0,
        capex: kCapexPerImp,
        others: kOthers,
      },
      {
        name: "DTF",
        labor: dLaborPerImp,
        consumables: dConsumablesPerImp,
        setup: 0,
        capex: dCapexPerImp,
        others: dOthers,
      },
      {
        name: `Screen (${runLength}pcs, ${numColors}sc)`,
        labor: screenBreakdown.labor,
        consumables: screenBreakdown.consumables,
        setup: sSetupAdjusted,
        capex: 0,
        others: sOthers,
      },
    ];
  }, [kornitSystem, dtfResult, screenBreakdown, runLength, numColors, screenCPP]);

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
          </div>
        </div>{/* end 3-col grid */}

        {/* Chart + Summary side by side */}
        <div className="flex gap-6 items-stretch">
          {/* Chart — left, takes majority of width */}
          <div className="flex-1 min-w-0">
            <ComparisonChart data={chartData} title="TCO Comparison" />
          </div>

          {/* Summary cards — right, stacked vertically, same height as chart */}
          <div className="flex flex-col gap-3 w-64 shrink-0">
            {/* Kornit */}
            <div className="flex-1 bg-white rounded-2xl border border-blue-100 p-4 shadow-sm flex flex-col">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">{kornitSystem.name}</p>
              <div className="flex flex-col gap-1.5 flex-1 justify-around text-xs">
                {[
                  ["CAPEX", formatCurrency(kornitSystem.capex.totalCapex)],
                  ["Throughput", `${kornitSystem.performance.tpt} imp/hr`],
                  ["Ink/imp", `$${kornitSystem.opex.cpp.toFixed(3)}`],
                  ["Labor 5Y", formatCurrency(kornitSystem.opex.labor)],
                  ["TCO/imp", `$${kornitSystem.tco.toFixed(3)}`],
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
                  ["CAPEX", formatCurrency(dtfResult.totalCapex)],
                  ["Throughput", `${dtfResult.effectiveTPH.toFixed(0)} imp/hr`],
                  ["Consumables/imp", `$${dtfResult.cpp.toFixed(3)}`],
                  ["Labor 5Y", formatCurrency(dtfResult.labor5Y)],
                  ["TCO/imp", `$${dtfResult.tco.toFixed(3)}`],
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
                  ["Low-run TCO", `$${getScreenCPP(10, numColors).toFixed(2)} (10pcs)`],
                  ["High-run TCO", `$${getScreenCPP(500, numColors).toFixed(2)} (500pcs)`],
                  ["TCO/imp", `$${screenCPP.toFixed(3)}${fabric === "polyester" ? "*" : ""}`],
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