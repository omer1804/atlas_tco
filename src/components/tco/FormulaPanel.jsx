import React, { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";

export default function FormulaPanel() {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">How is it Calculated?</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-8 text-sm border-t border-slate-100 pt-5">

          {/* Kornit */}
          <section>
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-100">Kornit TCO Formula</h3>

            <Block title="5-Year Impressions">
              <Line>Yearly = TPT × Availability × Utilization × Hrs/Day × 252 working days</Line>
              <Line>5Y Impressions = Yearly × 5</Line>
            </Block>

            <Block title="CAPEX">
              <Line>Total CAPEX = System Price + Installation</Line>
              <Line>CAPEX Cost (5Y) = Total CAPEX − Asset Value After 5Y</Line>
              <Note>Asset Value = System Price × (1 − 5 / Lifetime) — straight-line</Note>
            </Block>

            <Block title="OPEX (5 Years)">
              <Line>Labor = Operators × Labor $/hr × Hrs/Day × 365 days × 5</Line>
              <Line>Ink = 5Y Impressions × [(Ink ml / 1000 × Ink $/L) + (Fixa ml / Fixa Dilution / 1000 × Fixa $/L)]</Line>
              <Line>Maintenance = Service Contract/Year × 5</Line>
              <Line>Energy = (System KW + Dryer KW) × Hrs/Day × 252 × 5 × KWh cost</Line>
              <Line>Footprint = (Sqft System + Sqft Dryer) × $/Sqft × 5</Line>
            </Block>

            <Block title="TCO / Impression" highlight>
              <Line>Total 5Y = CAPEX Cost (5Y) + Labor + Ink + Maintenance + Energy + Footprint</Line>
              <Line bold>TCO = Total 5Y ÷ 5Y Impressions</Line>
            </Block>
          </section>

          {/* DTF */}
          <section>
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b-2 border-orange-100">DTF TCO Formula</h3>

            <Block title="5-Year Impressions">
              <Line>Printer Capacity = Num Printers × Printer TPH × Availability × Utilization</Line>
              <Line>Press Capacity = Num Presses × Press TPH × Availability × Utilization</Line>
              <Line bold>Effective TPH = MIN(Printer Capacity, Press Capacity) ← bottleneck</Line>
              <Line>Yearly = Effective TPH × Hrs/Day × 252</Line>
              <Line>5Y Impressions = Yearly × 5</Line>
            </Block>

            <Block title="CAPEX">
              <Line>Total CAPEX = (Num Printers × Printer Cost) + Cutter Cost + (Num Presses × Press Cost)</Line>
              <Line>Asset Value After 5Y = Total CAPEX × 20%</Line>
            </Block>

            <Block title="OPEX (5 Years)">
              <Line>Labor = (Operators Printer/Cutter + Operators Matching + Operators Presses) × Labor $/hr × Hrs/Day × 365 × 5</Line>
              <Line>Consumables = 5Y Impressions × [(Ink ml / 1000 × Consumables $/L) + Powder+Film $/print]</Line>
              <Line>Maintenance = Service Contract/Year × 5</Line>
            </Block>

            <Block title="TCO / Impression" highlight>
              <Line>Total 5Y = Total CAPEX + Labor + Consumables + Maintenance − Asset Value After 5Y</Line>
              <Line bold>TCO = Total 5Y ÷ 5Y Impressions</Line>
            </Block>
          </section>

        </div>
      )}
    </div>
  );
}

function Block({ title, children, highlight }) {
  return (
    <div className={`mb-4 rounded-xl p-4 ${highlight ? "bg-blue-50 border border-blue-100" : "bg-slate-50 border border-slate-100"}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Line({ children, bold }) {
  return (
    <p className={`font-mono text-xs leading-relaxed ${bold ? "font-bold text-slate-900" : "text-slate-700"}`}>
      {children}
    </p>
  );
}

function Note({ children }) {
  return (
    <p className="text-[11px] text-slate-400 italic mt-1">{children}</p>
  );
}