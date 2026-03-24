import React from "react";
import { RotateCcw } from "lucide-react";
import { DEFAULT_DTF_INPUTS } from "./competitorCalculations";

const FIELDS = [
  { section: "CAPEX", color: "#fef3c7", rows: [
    { key: "numPrinters", label: "Number of printers", step: 1 },
    { key: "printerCostEach", label: "Printer cost each ($)", prefix: "$", step: 1000 },
    { key: "cutterCost", label: "Cutter cost ($)", prefix: "$", step: 1000 },
    { key: "numPressStations", label: "Press stations", step: 1 },
    { key: "pressStationCostEach", label: "Press station cost each ($)", prefix: "$", step: 500 },
  ]},
  { section: "Labor", color: "#dbeafe", rows: [
    { key: "operatorsPrinterCutter", label: "Operators (printer+cutter)", step: 0.5 },
    { key: "operatorsMatching", label: "Operators (matching films)", step: 0.5 },
    { key: "operatorsPresses", label: "Operators (presses)", step: 0.5 },
    { key: "laborCostPerHr", label: "Labor cost ($/hr)", prefix: "$", step: 1 },
    { key: "hrsPerShift", label: "Hours per shift", step: 1 },
  ]},
  { section: "Consumables & Performance", color: "#d1fae5", rows: [
    { key: "consumablesCostPerL", label: "Consumables cost ($/L)", prefix: "$", step: 5 },
    { key: "inkLaydownMlPerPrint", label: "Ink laydown (ml/print)", step: 0.5 },
    { key: "powderFilmCostPerPrint", label: "Powder + Film cost ($/impression)", prefix: "$", step: 0.01 },
    { key: "printerTPH", label: "Printer throughput (prints/hr)", step: 5 },
    { key: "pressTPH", label: "Press throughput (garments/hr)", step: 5 },
    { key: "availability", label: "Availability", step: 0.01, isPercent: true },
    { key: "utilization", label: "Utilization", step: 0.01, isPercent: true },
    { key: "serviceContractPerYear", label: "Service contract/year ($)", prefix: "$", step: 1000 },
  ]},
];

export default function DTFInputsPanel({ inputs, onChange, onReset }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <h4 className="text-sm font-semibold text-slate-800">DTF Parameters</h4>
        <button onClick={onReset} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
      <div className="p-4 space-y-4">
        {FIELDS.map((section) => (
          <div key={section.section}>
            <div className="text-xs font-bold text-slate-700 px-2 py-1 rounded mb-2" style={{ backgroundColor: section.color }}>
              {section.section}
            </div>
            <div className="space-y-2">
              {section.rows.map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-3">
                  <label className="text-xs text-slate-500 flex-1">{row.label}</label>
                  <input
                    type="number"
                    step={row.step}
                    value={row.isPercent ? (inputs[row.key] * 100).toFixed(0) : inputs[row.key]}
                    onChange={(e) => onChange(row.key, row.isPercent ? parseFloat(e.target.value) / 100 : parseFloat(e.target.value))}
                    className="w-24 text-center text-xs border border-slate-200 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}