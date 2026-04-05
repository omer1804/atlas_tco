// Export TCO systems data to CSV (Excel-compatible)
export function exportSystemsToCSV(systems, systemsInputs) {
  const rows = [];

  // Header
  rows.push(["Atlas TCO Analyzer Export", "", ...systems.map((s) => s.name)]);
  rows.push(["Generated", new Date().toLocaleDateString(), ...systems.map(() => "")]);
  rows.push([]);

  // CAPEX
  rows.push(["CAPEX", "", ...systems.map(() => "")]);
  rows.push(["System Price ($)", "", ...systems.map((s) => s.capex.systemPrice)]);
  rows.push(["Installation ($)", "", ...systems.map((s) => s.capex.installation)]);
  rows.push(["Life Time (years)", "", ...systems.map((s) => s.capex.lifeTime)]);
  rows.push(["Interest Rate (%)", "", ...systems.map((s) => ((s.capex.interestRate || 0) * 100).toFixed(1))]);
  rows.push(["Annual CAPEX Payment ($)", "", ...systems.map((s) => s.capex.annualCapexPayment.toFixed(0))]);
  rows.push(["Total CAPEX ($)", "", ...systems.map((s) => s.capex.totalCapex)]);
  rows.push([]);

  // OPEX Labor
  rows.push(["OPEX - Labor", "", ...systems.map(() => "")]);
  rows.push(["Operators per system", "", ...systems.map((s) => s.opex.operatorsPerSystem)]);
  rows.push(["Labor cost ($/hr)", "", ...systems.map((s) => s.opex.laborCostPerHr)]);
  rows.push(["Hr/Day", "", ...systems.map((s) => s.opex.hrsPerShift)]);
  rows.push(["Labor 5Y ($)", "", ...systems.map((s) => s.opex.labor.toFixed(0))]);
  rows.push([]);

  // OPEX Ink
  rows.push(["OPEX - Ink", "", ...systems.map(() => "")]);
  rows.push(["Ink Cost ($/L)", "", ...systems.map((s) => s.opex.inkCostPerL)]);
  rows.push(["Functional consumables ($/L)", "", ...systems.map((s) => s.opex.functionalConsumablesPerL)]);
  rows.push(["Fixa Cost ($/L)", "", ...systems.map((s) => s.opex.fixaCostPerL)]);
  rows.push(["Avg Ink Laydown (ml)", "", ...systems.map((s) => s.opex.avgInkLaydown)]);
  rows.push(["Fixa Laydown (ml)", "", ...systems.map((s) => s.opex.fixaLaydown)]);
  rows.push(["Fixa Dilution", "", ...systems.map((s) => s.opex.fixaDilution)]);
  rows.push(["Ink Cost 5Y ($)", "", ...systems.map((s) => s.opex.ink.toFixed(0))]);
  rows.push([]);

  // OPEX Maintenance
  rows.push(["OPEX - Maintenance", "", ...systems.map(() => "")]);
  rows.push(["Service contract/year ($)", "", ...systems.map((s) => s.opex.serviceContractPerYear)]);
  rows.push(["Maintenance 5Y ($)", "", ...systems.map((s) => s.opex.maintenance.toFixed(0))]);
  rows.push([]);

  // OPEX Energy
  rows.push(["OPEX - Energy", "", ...systems.map(() => "")]);
  rows.push(["KWh cost ($)", "", ...systems.map((s) => s.opex.kwhCost)]);
  rows.push(["System power (KWh)", "", ...systems.map((s) => s.opex.systemPower)]);
  rows.push(["Dryer power (KWh)", "", ...systems.map((s) => s.opex.dryerPower)]);
  rows.push(["Energy 5Y ($)", "", ...systems.map((s) => s.opex.energyConsumption.toFixed(0))]);
  rows.push([]);

  // Foot Print
  rows.push(["OPEX - Foot Print", "", ...systems.map(() => "")]);
  rows.push(["$/Sqr foot", "", ...systems.map((s) => s.opex.sqrFootSystem)]);
  rows.push(["Sqr foot - system", "", ...systems.map((s) => s.opex.sqrFootSystem)]);
  rows.push(["Sqr foot - dryer", "", ...systems.map((s) => s.opex.sqrFootDryer)]);
  rows.push(["Foot Print 5Y ($)", "", ...systems.map((s) => s.opex.footPrintCost.toFixed(0))]);
  rows.push([]);

  // Performance
  rows.push(["Performance", "", ...systems.map(() => "")]);
  rows.push(["TPT (imp/hr)", "", ...systems.map((s) => s.performance.tpt)]);
  rows.push(["Availability", "", ...systems.map((s) => (s.performance.availability * 100).toFixed(0) + "%")]);
  rows.push(["Utilization", "", ...systems.map((s) => (s.performance.utilization * 100).toFixed(0) + "%")]);
  rows.push(["Yearly Impressions", "", ...systems.map((s) => Math.round(s.performance.yearly).toLocaleString())]);
  rows.push(["5Y Impressions", "", ...systems.map((s) => Math.round(s.performance.fiveYear).toLocaleString())]);
  rows.push([]);

  // Summary
  rows.push(["Summary", "", ...systems.map(() => "")]);
  rows.push(["Total OPEX 5Y ($)", "", ...systems.map((s) => s.opex.totalOpex.toFixed(0))]);
  rows.push(["Total 5Y Investment ($)", "", ...systems.map((s) => s.total5YInvestment.toFixed(0))]);
  rows.push(["TCO per impression ($)", "", ...systems.map((s) => s.tco.toFixed(4))]);
  rows.push(["CPP - Ink per impression ($)", "", ...systems.map((s) => s.opex.cpp.toFixed(4))]);

  // Convert to CSV string
  const csv = rows.map((row) =>
    row.map((cell) => {
      const str = String(cell ?? "");
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  ).join("\n");

  // Download
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `atlas-tco-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}