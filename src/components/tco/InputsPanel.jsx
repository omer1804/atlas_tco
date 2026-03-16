import React, { useState } from "react";
import { SYSTEM_COLORS } from "./tcoData";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { DEFAULT_SYSTEMS } from "./tcoCalculations";

const FIELD_GROUPS = [
  {
    label: "CAPEX",
    fields: [
      { key: "systemPrice", label: "System Price ($)", step: 1000 },
      { key: "installation", label: "Installation ($)", step: 1000 },
    ],
  },
  {
    label: "Labor",
    fields: [
      { key: "operatorsPerSystem", label: "Operators", step: 1 },
      { key: "laborCostPerHr", label: "Labor Cost ($/hr)", step: 1 },
      { key: "hrsPerShift", label: "Hrs/Shift", step: 1 },
    ],
  },
  {
    label: "Ink",
    fields: [
      { key: "inkCostPerL", label: "Ink Cost ($/L)", step: 1 },
      { key: "avgInkLaydown", label: "Avg Ink Laydown (ml)", step: 0.5 },
      { key: "functionalConsumablesPerL", label: "Func. Consumables ($/L)", step: 1 },
      { key: "fixaCostPerL", label: "Fixa Cost ($/L)", step: 1 },
      { key: "fixaLaydown", label: "Fixa Laydown", step: 0.5 },
      { key: "fixaDilution", label: "Fixa Dilution", step: 1 },
    ],
  },
  {
    label: "Maintenance",
    fields: [
      { key: "serviceContractPerYear", label: "Service Contract/Year ($)", step: 1000 },
    ],
  },
  {
    label: "Energy",
    fields: [
      { key: "kwhCost", label: "KWh Cost ($)", step: 0.01 },
      { key: "systemPower", label: "System Power (KWh)", step: 0.5 },
      { key: "dryerPower", label: "Dryer Power (KWh)", step: 1 },
    ],
  },
  {
    label: "Footprint",
    fields: [
      { key: "sqrFootSystem", label: "Sqr Ft - System", step: 10 },
      { key: "sqrFootDryer", label: "Sqr Ft - Dryer", step: 10 },
      { key: "sqrFootCost", label: "$/Sqr Ft", step: 1 },
    ],
  },
  {
    label: "Performance",
    fields: [
      { key: "tpt", label: "TPT (imp/hr)", step: 10 },
      { key: "availability", label: "Availability (0-1)", step: 0.01 },
      { key: "utilization", label: "Utilization (0-1)", step: 0.01 },
    ],
  },
];

export default function InputsPanel({ systemsInputs, onUpdate, onReset }) {
  const [openGroup, setOpenGroup] = useState("CAPEX");

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">Edit Inputs</h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset to defaults
        </button>
      </div>

      {FIELD_GROUPS.map((group) => (
        <div key={group.label} className="border-b border-slate-100 last:border-0">
          <button
            className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
          >
            <span>{group.label}</span>
            {openGroup === group.label ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openGroup === group.label && (
            <div className="px-4 pb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left py-2 pl-2 text-slate-400 font-medium w-44">Parameter</th>
                    {systemsInputs.map((s) => (
                      <th key={s.name} className="text-center py-2 px-1 font-semibold" style={{ color: SYSTEM_COLORS[s.name] || "#64748b" }}>
                        {s.name.replace("Atlas ", "").replace("MATRIX ", "MTX ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.fields.map((field) => (
                    <tr key={field.key} className="border-t border-slate-50">
                      <td className="py-1.5 pl-2 text-slate-500">{field.label}</td>
                      {systemsInputs.map((s) => (
                        <td key={s.name} className="py-1 px-1">
                          <input
                            type="number"
                            step={field.step}
                            value={s.inputs[field.key]}
                            onChange={(e) => onUpdate(s.name, field.key, parseFloat(e.target.value))}
                            className="w-full text-center border border-slate-200 rounded-lg py-1 px-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}