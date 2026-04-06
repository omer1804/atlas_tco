import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { SCREEN_MAX_COLORS, getScreenCPP } from "./competitorCalculations";

export default function ScreenInputsPanel({ runLength, numColors, onRunLengthChange, onNumColorsChange, fabric, laborCostPerHr, onLaborCostChange }) {
  const [laborInput, setLaborInput] = useState(laborCostPerHr ?? 20);
  const baseCpp = getScreenCPP(runLength, numColors, laborInput);
  const cpp = baseCpp + (fabric === "polyester" ? 0.2 : 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <h4 className="text-sm font-semibold text-slate-800">Screen Printing Parameters</h4>
      </div>
      <div className="p-4 space-y-4">
        <div className="rounded-xl p-3 bg-amber-50 border border-amber-100 flex gap-2 text-xs text-amber-700">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Screen printing TCO varies significantly with <b>run length</b>, <b>number of screens</b>, and <b>labor cost</b>.</span>
        </div>

        {/* Labor cost input */}
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Labor Cost ($/hr)</label>
          <input
            type="number"
            min={1}
            max={25}
            step={1}
            value={laborInput}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 1;
              setLaborInput(val);
              onLaborCostChange && onLaborCostChange(val);
            }}
            className="w-24 text-center border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Run Length (pieces per job)</label>
          <input
            type="range"
            min={10} max={500} step={1}
            value={runLength}
            onChange={(e) => onRunLengthChange(parseInt(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>10</span>
            <span className="font-bold text-purple-600 text-sm">{runLength} pcs</span>
            <span>500</span>
          </div>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1 mt-2">
            {[10, 50, 100, 200, 500].map((v) => (
              <button
                key={v}
                onClick={() => onRunLengthChange(v)}
                className={`text-xs px-2 py-0.5 rounded border transition-all ${runLength === v ? "bg-purple-600 text-white border-purple-600" : "border-slate-200 text-slate-500 hover:border-purple-300"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Number of Screens</label>
          <input
            type="range"
            min={1} max={SCREEN_MAX_COLORS} step={1}
            value={numColors}
            onChange={(e) => onNumColorsChange(parseInt(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1</span>
            <span className="font-bold text-purple-600 text-sm">{numColors} screen{numColors > 1 ? "s" : ""}</span>
            <span>{SCREEN_MAX_COLORS}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {[1, 2, 4, 6, 8, 14].map((v) => (
              <button
                key={v}
                onClick={() => onNumColorsChange(v)}
                className={`text-xs px-2 py-0.5 rounded border transition-all ${numColors === v ? "bg-purple-600 text-white border-purple-600" : "border-slate-200 text-slate-500 hover:border-purple-300"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-3 bg-purple-50 border border-purple-100 text-center">
          <p className="text-xs text-purple-500 mb-0.5">CPP from table</p>
          <p className="text-2xl font-bold text-purple-700">${cpp.toFixed(2)}</p>
          <p className="text-xs text-purple-400">{runLength} pcs · {numColors} screen{numColors > 1 ? "s" : ""}</p>
        </div>

        {/* Mini heatmap — show row for selected run length */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">TCO by # Screens (at {runLength} pcs)</p>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: SCREEN_MAX_COLORS }, (_, i) => {
              const c = getScreenCPP(runLength, i + 1, laborInput) + (fabric === "polyester" ? 0.2 : 0);
              const selected = i + 1 === numColors;
              return (
                <button
                  key={i}
                  onClick={() => onNumColorsChange(i + 1)}
                  className={`text-xs rounded px-1.5 py-1 transition-all border ${selected ? "border-purple-500 text-white" : "border-transparent text-slate-600"}`}
                  style={{
                    backgroundColor: selected
                      ? "#7c3aed"
                      : `rgba(124,58,237,${Math.min(c / 5, 0.5)})`,
                    minWidth: "2.5rem",
                  }}
                >
                  <div className="text-[9px] opacity-70">{i + 1}sc</div>
                  <div className="font-semibold">${c.toFixed(2)}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}