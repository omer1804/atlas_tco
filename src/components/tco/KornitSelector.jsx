import React from "react";
import { SYSTEM_COLORS } from "./tcoData";
import { CheckCircle2 } from "lucide-react";

export default function KornitSelector({ systems, selectedName, onSelect }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Select Kornit System to Compare
      </p>
      <div className="flex flex-wrap gap-2">
        {systems.map((s) => {
          const active = s.name === selectedName;
          const color = SYSTEM_COLORS[s.name] || "#3b82f6";
          return (
            <button
              key={s.name}
              onClick={() => onSelect(s.name)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"
              style={{
                backgroundColor: active ? `${color}15` : "#f8fafc",
                borderColor: active ? color : "#e2e8f0",
                color: active ? color : "#94a3b8",
              }}
            >
              {active ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: "#cbd5e1" }} />
              )}
              {s.name}
              {active && (
                <span className="ml-1 text-xs font-bold">${s.tco.toFixed(2)}/imp</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}