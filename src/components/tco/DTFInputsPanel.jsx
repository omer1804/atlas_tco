import React, { useState } from "react";
import { Lock, Unlock, RotateCcw } from "lucide-react";

const UNLOCK_PASSWORD = "Kk123456!";

// All locked params (non-cost fields)
const LOCKED_PARAMS = [
  "numPrinters", "numPressStations",
  "operatorsPrinterCutter", "operatorsMatching", "operatorsPresses",
  "hrsPerShift", "workingDays",
  "printerTPH", "pressTPH", "availability", "utilization",
];

export default function DTFInputsPanel({ inputs, onChange, onReset, kornitLaborCostPerHr, kornitHrsPerShift, kornitWorkingDays }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [showPwField, setShowPwField] = useState(false);

  function handleUnlock() {
    if (pwInput === UNLOCK_PASSWORD) {
      setUnlocked(true);
      setShowPwField(false);
      setPwInput("");
      setPwError(false);
    } else {
      setPwError(true);
      setPwInput("");
    }
  }

  function isLocked(key) {
    return !unlocked && LOCKED_PARAMS.includes(key);
  }

  function lockedCell(value, prefix = "") {
    return (
      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded inline-flex items-center gap-1">
        <Lock className="w-2.5 h-2.5 text-slate-400" />{prefix}{value}
      </span>
    );
  }

  function row(label, key, opts = {}) {
    const locked = isLocked(key);
    const { step = 1, prefix = "", isPercent = false, min, max } = opts;
    const rawVal = inputs[key];
    const displayVal = isPercent ? ((rawVal || 0) * 100).toFixed(1) : rawVal;

    return (
      <tr key={key} className="border-t border-slate-50 hover:bg-slate-50/50">
        <td className="py-1.5 px-4 text-slate-600 pl-6 text-xs">{label}</td>
        <td className="py-1 px-3 text-center">
          {locked ? lockedCell(isPercent ? `${displayVal}%` : displayVal, isPercent ? "" : prefix) : (
            <input
              type="number"
              step={step}
              min={min}
              max={max}
              value={displayVal}
              onChange={(e) =>
                onChange(key, isPercent ? parseFloat(e.target.value) / 100 : parseFloat(e.target.value))
              }
              className="w-24 text-center border border-slate-200 rounded-lg py-1 px-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          )}
        </td>
      </tr>
    );
  }

  // Press operators: always shown, locked when Auto (=1) OR when Manual (locked to 2)
  const pressOpsLocked = !unlocked; // always locked unless advanced unlocked
  const effectivePressOps = inputs.pressAuto ? 1 : 2;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <h4 className="text-sm font-semibold text-slate-800">DTF Parameters</h4>
        <div className="flex items-center gap-2">
          {unlocked ? (
            <button onClick={() => setUnlocked(false)} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800">
              <Unlock className="w-3.5 h-3.5" /> Advanced
            </button>
          ) : (
            <button onClick={() => setShowPwField((v) => !v)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
              <Lock className="w-3.5 h-3.5" /> Unlock
            </button>
          )}
          <button onClick={onReset} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {showPwField && !unlocked && (
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
          <input
            type="password"
            value={pwInput}
            onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="Enter password..."
            className={`text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400 ${pwError ? "border-red-400 bg-red-50" : "border-slate-200"}`}
          />
          <button onClick={handleUnlock} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700">
            Unlock
          </button>
          {pwError && <span className="text-xs text-red-500">Incorrect password</span>}
        </div>
      )}

      {!unlocked && (
        <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          Locked: 2 printers · 3 press stations · labor headcount · performance
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 px-4 pl-6 text-slate-500 font-medium">Parameter</th>
              <th className="text-center py-2 px-3 text-slate-500 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>

            {/* CAPEX */}
            <tr><td colSpan={2} className="py-1.5 px-4 font-bold text-slate-700 text-xs bg-amber-50">CAPEX</td></tr>
            {row("Num Printers", "numPrinters", { step: 1, min: 1 })}
            {row("Printer Cost Each ($)", "printerCostEach", { step: 1000, prefix: "$" })}
            {row("Cutter Cost ($)", "cutterCost", { step: 1000, prefix: "$" })}
            {row("Num Press Stations", "numPressStations", { step: 1, min: 1 })}
            {row("Press Station Cost Each ($)", "pressStationCostEach", { step: 500, prefix: "$" })}

            {/* Labor */}
            <tr><td colSpan={2} className="py-1.5 px-4 font-bold text-slate-700 text-xs bg-pink-50">Labor</td></tr>
            {row("Operators (Printer/Cutter)", "operatorsPrinterCutter", { step: 1 })}
            {row("Operators (Matching)", "operatorsMatching", { step: 1 })}

            {/* Press Auto/Manual toggle */}
            <tr className="border-t border-slate-50 hover:bg-slate-50/50">
              <td className="py-1.5 px-4 pl-6 text-slate-600 text-xs">Press Operators Mode</td>
              <td className="py-1 px-3 text-center">
                <div className="flex items-center justify-center gap-0">
                  <button
                    onClick={() => onChange("pressAuto", false)}
                    className={`text-xs px-2 py-1 rounded-l border transition-all ${!inputs.pressAuto ? "bg-orange-600 text-white border-orange-600" : "bg-white text-slate-500 border-slate-200"}`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => onChange("pressAuto", true)}
                    className={`text-xs px-2 py-1 rounded-r border-t border-r border-b transition-all ${inputs.pressAuto ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-500 border-slate-200"}`}
                  >
                    Auto
                  </button>
                </div>
              </td>
            </tr>

            {/* Press operators — always shown, always locked (Auto=1, Manual=2) */}
            <tr className="border-t border-slate-50 hover:bg-slate-50/50">
              <td className="py-1.5 px-4 pl-6 text-slate-600 text-xs">
                Operators (Presses)
                <span className="ml-1 text-[10px] text-slate-400">{inputs.pressAuto ? "— Auto: 1" : "— Manual: 2"}</span>
              </td>
              <td className="py-1 px-3 text-center">
                {pressOpsLocked ? lockedCell(inputs.pressAuto ? 1 : 2) : (
                  <input
                    type="number"
                    step={1}
                    min={1}
                    value={inputs.operatorsPresses}
                    onChange={(e) => onChange("operatorsPresses", parseFloat(e.target.value))}
                    className="w-24 text-center border border-slate-200 rounded-lg py-1 px-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                )}
              </td>
            </tr>

            {/* Labor cost — synced from Kornit (locked) */}
            <tr className="border-t border-slate-50 hover:bg-slate-50/50">
              <td className="py-1.5 px-4 pl-6 text-slate-600 text-xs">
                Labor Cost ($/hr)
                <span className="ml-1 text-[10px] text-slate-400">(from Kornit)</span>
              </td>
              <td className="py-1 px-3 text-center">
                {lockedCell(kornitLaborCostPerHr ?? inputs.laborCostPerHr, "$")}
              </td>
            </tr>

            {/* Hrs/Day — synced from Kornit */}
            <tr className="border-t border-slate-50 hover:bg-slate-50/50">
              <td className="py-1.5 px-4 pl-6 text-slate-600 text-xs">
                Hrs / Day<span className="ml-1 text-[10px] text-slate-400">(from Kornit)</span>
              </td>
              <td className="py-1 px-3 text-center">
                {lockedCell(kornitHrsPerShift ?? inputs.hrsPerShift)}
              </td>
            </tr>
            {/* Working Days — synced from Kornit */}
            <tr className="border-t border-slate-50 hover:bg-slate-50/50">
              <td className="py-1.5 px-4 pl-6 text-slate-600 text-xs">
                Working Days / Year<span className="ml-1 text-[10px] text-slate-400">(from Kornit)</span>
              </td>
              <td className="py-1 px-3 text-center">
                {lockedCell(kornitWorkingDays ?? inputs.workingDays)}
              </td>
            </tr>

            {/* Consumables — all editable */}
            <tr><td colSpan={2} className="py-1.5 px-4 font-bold text-slate-700 text-xs bg-green-50">Consumables</td></tr>
            <tr className="border-t border-slate-50 hover:bg-slate-50/50">
              <td className="py-1.5 px-4 pl-6 text-slate-600 text-xs">Consumables Cost ($/L)</td>
              <td className="py-1 px-3 text-center">
                <input type="number" step={1} value={inputs.consumablesCostPerL}
                  onChange={(e) => onChange("consumablesCostPerL", parseFloat(e.target.value))}
                  className="w-24 text-center border border-slate-200 rounded-lg py-1 px-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </td>
            </tr>
            <tr className="border-t border-slate-50 hover:bg-slate-50/50">
              <td className="py-1.5 px-4 pl-6 text-slate-600 text-xs">Ink Laydown (ml/print)</td>
              <td className="py-1 px-3 text-center">
                <input type="number" step={0.5} value={inputs.inkLaydownMlPerPrint}
                  onChange={(e) => onChange("inkLaydownMlPerPrint", parseFloat(e.target.value))}
                  className="w-24 text-center border border-slate-200 rounded-lg py-1 px-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </td>
            </tr>
            <tr className="border-t border-slate-50 hover:bg-slate-50/50">
              <td className="py-1.5 px-4 pl-6 text-slate-600 text-xs">Powder+Film Cost ($/print)</td>
              <td className="py-1 px-3 text-center">
                <input type="number" step={0.01} value={inputs.powderFilmCostPerPrint}
                  onChange={(e) => onChange("powderFilmCostPerPrint", parseFloat(e.target.value))}
                  className="w-24 text-center border border-slate-200 rounded-lg py-1 px-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </td>
            </tr>

            {/* Performance — all locked */}
            <tr><td colSpan={2} className="py-1.5 px-4 font-bold text-slate-700 text-xs bg-blue-50">Performance</td></tr>
            {row("Printer TPH (prints/hr each)", "printerTPH", { step: 5 })}
            {row("Press TPH (garments/hr each)", "pressTPH", { step: 5 })}
            {row("Availability (%)", "availability", { step: 0.01, isPercent: true })}
            {row("Utilization (%)", "utilization", { step: 0.01, isPercent: true })}

            {/* Maintenance */}
            <tr><td colSpan={2} className="py-1.5 px-4 font-bold text-slate-700 text-xs bg-slate-50">Maintenance</td></tr>
            <tr className="border-t border-slate-50 hover:bg-slate-50/50">
              <td className="py-1.5 px-4 pl-6 text-slate-600 text-xs">Service Contract ($/year)</td>
              <td className="py-1 px-3 text-center">
                <input type="number" step={1000} value={inputs.serviceContractPerYear}
                  onChange={(e) => onChange("serviceContractPerYear", parseFloat(e.target.value))}
                  className="w-24 text-center border border-slate-200 rounded-lg py-1 px-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}