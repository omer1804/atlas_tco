import React from "react";
import { SYSTEM_COLORS } from "./tcoData";
import { RotateCcw } from "lucide-react";

const ROW_GROUPS = [
  {
    section: "CAPEX",
    color: "#fef3c7",
    rows: [
      { key: "systemPrice", label: "System price [ASP]", prefix: "$", step: 1000 },
      { key: "installation", label: "Installation", prefix: "$", step: 1000 },
      { key: "lifeTime", label: "Life time (years)", step: 1 },
      { key: "interestRate", label: "Interest rate (%)", step: 0.5, isPercent: true, hint: "PMT annuity method" },
    ],
    totals: [
      { label: "Total CAPEX", fn: (inp) => inp.systemPrice + inp.installation },
      {
        label: "Annual CAPEX Payment",
        fn: (inp) => {
          const r = inp.interestRate || 0;
          const n = inp.lifeTime || 5;
          const pv = inp.systemPrice;
          if (r === 0) return pv / n;
          return (pv * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        },
        prefix: "$",
        note: "PMT / year",
      },
    ],
  },
  {
    section: "OPEX",
    color: "#fce7f3",
    rows: [],
    subsections: [
      {
        label: "Labor",
        rows: [
          { key: "operatorsPerSystem", label: "Operator per system", step: 0.5 },
          { key: "laborCostPerHr", label: "Labor cost ($/hr)", prefix: "$", step: 1 },
          { key: "hrsPerShift", label: "Hr/Day", step: 1 },
        ],
        total: { label: "Labor (5Y)", fn: (inp) => inp.operatorsPerSystem * inp.laborCostPerHr * inp.hrsPerShift * 365 * 5 },
      },
      {
        label: "Ink",
        rows: [
          { key: "inkCostPerL", label: "Ink Cost ($/L)", prefix: "$", step: 1 },
          { key: "functionalConsumablesPerL", label: "Functional consumables ($/L)", prefix: "$", step: 1 },
          { key: "fixaCostPerL", label: "Fixa Cost ($/L)", prefix: "$", step: 1 },
          { key: "avgInkLaydown", label: "Avg ink Laydown (ml)", step: 0.5 },
          { key: "fixaLaydown", label: "Fixa laydown (ml)", step: 0.5 },
          { key: "fixaDilution", label: "Fixa dilution", step: 1 },
        ],
        total: null,
      },
      {
        label: "Maintenance",
        rows: [
          { key: "serviceContractPerYear", label: "Service contract/Year", prefix: "$", step: 1000 },
        ],
        total: { label: "Maintenance (5Y)", fn: (inp) => inp.serviceContractPerYear * 5 },
      },
      {
        label: "Energy",
        rows: [
          { key: "kwhCost", label: "KWh cost [$]", prefix: "$", step: 0.01 },
          { key: "systemPower", label: "System power [KWh]", step: 0.5 },
          { key: "systemPowerIdle", label: "System power idle [KWh]", step: 0.1 },
          { key: "dryerPower", label: "Dryer power [KWh]", step: 1 },
        ],
        total: { label: "Energy (5Y)", fn: (inp) => (inp.systemPower + inp.dryerPower) * inp.hrsPerShift * 365 * 5 * inp.kwhCost },
      },
      {
        label: "Foot Print",
        rows: [
          { key: "sqrFootCost", label: "$/Sqr foot", prefix: "$", step: 1 },
          { key: "sqrFootSystem", label: "Sqr foot - system", step: 10 },
          { key: "sqrFootDryer", label: "Sqr foot - dryer", step: 10 },
        ],
        total: { label: "Foot Print (5Y)", fn: (inp) => (inp.sqrFootSystem + inp.sqrFootDryer) * inp.sqrFootCost * 5 },
      },
    ],
  },
  {
    section: "Performance",
    color: "#d1fae5",
    rows: [
      { key: "tpt", label: "TPT - impression per hour", step: 5 },
      { key: "availability", label: "Availability", step: 0.01, isPercent: true },
      { key: "utilization", label: "Utilization", step: 0.01, isPercent: true },
      { key: "workingDays", label: "Working days / year", step: 1 },
    ],
  },
];

export default function InputsPanel({ systemsInputs, onUpdate, onReset }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">Edit Inputs</h3>
        <button onClick={onReset} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors">
          <RotateCcw className="w-3.5 h-3.5" /> Reset to defaults
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-4 text-slate-500 font-medium w-56 min-w-[14rem]">Parameter</th>
              {systemsInputs.map((s) => (
                <th key={s.name} className="text-center py-3 px-3 font-bold min-w-[120px]" style={{ color: SYSTEM_COLORS[s.name] || "#64748b" }}>
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROW_GROUPS.map((group) => (
              <React.Fragment key={group.section}>
                <tr>
                  <td colSpan={systemsInputs.length + 1} className="py-2 px-4 font-bold text-slate-800 text-sm" style={{ backgroundColor: group.color }}>
                    {group.section}
                  </td>
                </tr>

                {group.rows && group.rows.map((row) => (
                  <tr key={row.label} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="py-1.5 px-4 text-slate-600 pl-6">
                      {row.label}
                      {row.hint && <span className="ml-1 text-[9px] text-slate-400">({row.hint})</span>}
                    </td>
                    {systemsInputs.map((s) => (
                      <td key={s.name} className="py-1 px-2 text-center">
                        <input
                          type="number"
                          step={row.step}
                          value={row.isPercent ? ((s.inputs[row.key] || 0) * 100).toFixed(1) : s.inputs[row.key]}
                          onChange={(e) => onUpdate(s.name, row.key, row.isPercent ? parseFloat(e.target.value) / 100 : parseFloat(e.target.value))}
                          className="w-full text-center border border-slate-200 rounded-lg py-1 px-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                      </td>
                    ))}
                  </tr>
                ))}

                {group.totals && group.totals.map((total) => (
                  <tr key={total.label} className="border-t-2 border-slate-200" style={{ backgroundColor: group.color }}>
                    <td className="py-2 px-4 font-bold text-slate-800 pl-4">
                      {total.label}
                      {total.note && <span className="ml-1 text-[9px] font-normal text-slate-500">({total.note})</span>}
                    </td>
                    {systemsInputs.map((s) => (
                      <td key={s.name} className="py-2 px-2 text-center font-bold text-slate-800">
                        ${total.fn(s.inputs).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                    ))}
                  </tr>
                ))}

                {group.subsections && group.subsections.map((sub) => (
                  <React.Fragment key={sub.label}>
                    <tr className="border-t border-slate-200">
                      <td className="py-1.5 px-4 font-semibold text-slate-700 pl-5 bg-slate-50">{sub.label}</td>
                      {systemsInputs.map((s) => (
                        <td key={s.name} className="py-1.5 px-2 text-center font-semibold text-slate-700 bg-slate-50">
                          {sub.total ? `$${sub.total.fn(s.inputs).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ""}
                        </td>
                      ))}
                    </tr>
                    {sub.rows.map((row) => (
                      <tr key={row.label} className="border-t border-slate-50 hover:bg-slate-50/50">
                        <td className="py-1.5 px-4 text-slate-500 pl-8">{row.label}</td>
                        {systemsInputs.map((s) => (
                          <td key={s.name} className="py-1 px-2 text-center">
                            {row.key ? (
                              <input
                                type="number"
                                step={row.step}
                                value={row.isPercent ? (s.inputs[row.key] * 100).toFixed(0) : s.inputs[row.key]}
                                onChange={(e) => onUpdate(s.name, row.key, row.isPercent ? parseFloat(e.target.value) / 100 : parseFloat(e.target.value))}
                                className="w-full text-center border border-slate-200 rounded-lg py-1 px-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                              />
                            ) : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* Yearly impressions row after Performance */}
                    {sub.label === "Labor" && (
                      <tr className="border-t border-slate-50 bg-green-50/50">
                        <td className="py-1.5 px-4 text-green-700 pl-8 font-medium">Yearly impressions</td>
                        {systemsInputs.map((s) => {
                          const yearly = s.inputs.tpt * s.inputs.availability * s.inputs.utilization * s.inputs.hrsPerShift * (s.inputs.workingDays || 252);
                          return (
                            <td key={s.name} className="py-1 px-2 text-center text-green-700 font-semibold">
                              {Math.round(yearly).toLocaleString()}
                            </td>
                          );
                        })}
                      </tr>
                    )}
                  </React.Fragment>
                ))}

                {/* Yearly impressions under Performance section */}
                {group.section === "Performance" && (
                  <tr className="border-t border-slate-50 bg-green-50/50">
                    <td className="py-1.5 px-4 text-green-700 pl-6 font-medium">→ Yearly impressions</td>
                    {systemsInputs.map((s) => {
                      const yearly = s.inputs.tpt * s.inputs.availability * s.inputs.utilization * s.inputs.hrsPerShift * (s.inputs.workingDays || 252);
                      return (
                        <td key={s.name} className="py-1 px-2 text-center text-green-700 font-semibold">
                          {Math.round(yearly).toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}