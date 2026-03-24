// Pure calculation functions — given editable inputs, recompute all derived values

export function computeSystem(s) {
  const { inputs } = s;

  // CAPEX
  const totalCapex = inputs.systemPrice + inputs.installation;
  const depreciation = (inputs.systemPrice * 0.16); // SLN
  const assetValueAfter5Y = inputs.systemPrice * 0.2;

  // Performance — uses 252 working days/year (as per Excel model)
  const workingDays = 252;
  const yearlyImpressions = inputs.tpt * inputs.availability * inputs.utilization * inputs.hrsPerShift * workingDays;
  const fiveYearImpressions = yearlyImpressions * 5;

  // Labor (5Y) — uses 365 days/year (operators work every day)
  const labor5Y = inputs.operatorsPerSystem * inputs.laborCostPerHr * inputs.hrsPerShift * 365 * 5;

  // Ink cost (5Y)
  // ink (ml->L) * inkCostPerL + functional consumables (same laydown) * functionalCostPerL + fixa (ml->L after dilution) * fixaCostPerL
  const inkPerImpL = inputs.avgInkLaydown / 1000;
  const fixaPerImpL = (inputs.fixaLaydown / inputs.fixaDilution) / 1000;
  const inkCost5Y = fiveYearImpressions * (
    inkPerImpL * inputs.inkCostPerL +
    fixaPerImpL * inputs.fixaCostPerL
  );

  // Maintenance (5Y)
  const maintenance5Y = inputs.serviceContractPerYear * 5;

  // Energy (5Y) — KWh * cost * hours * workingDays * 5
  const energyHrsPerYear = inputs.hrsPerShift * workingDays;
  const energyKwh5Y = (inputs.systemPower + inputs.dryerPower) * energyHrsPerYear * 5;
  const energy5Y = energyKwh5Y * inputs.kwhCost;

  // Foot print (5Y)
  const footPrintCost = (inputs.sqrFootSystem + inputs.sqrFootDryer) * inputs.sqrFootCost * 5;

  const totalOpex = labor5Y + inkCost5Y + maintenance5Y + energy5Y + footPrintCost;
  // Subtract residual asset value after 5 years (as per Excel model)
  const total5YInvestment = totalCapex + totalOpex - assetValueAfter5Y;

  const tco = fiveYearImpressions > 0 ? total5YInvestment / fiveYearImpressions : 0;
  const cpp = fiveYearImpressions > 0 ? inkCost5Y / fiveYearImpressions : 0;

  return {
    name: s.name,
    total5YInvestment,
    tco,
    capex: { systemPrice: inputs.systemPrice, installation: inputs.installation, lifeTime: 5, depreciation, assetValueAfter5Y, totalCapex },
    opex: {
      labor: labor5Y,
      operatorsPerSystem: inputs.operatorsPerSystem,
      laborCostPerHr: inputs.laborCostPerHr,
      hrsPerShift: inputs.hrsPerShift,
      ink: inkCost5Y,
      cpp,
      inkCostPerL: inputs.inkCostPerL,
      functionalConsumablesPerL: inputs.functionalConsumablesPerL,
      fixaCostPerL: inputs.fixaCostPerL,
      avgInkLaydown: inputs.avgInkLaydown,
      fixaLaydown: inputs.fixaLaydown,
      fixaDilution: inputs.fixaDilution,
      maintenance: maintenance5Y,
      serviceContractPerYear: inputs.serviceContractPerYear,
      energyConsumption: energy5Y,
      kwhCost: inputs.kwhCost,
      systemPower: inputs.systemPower,
      systemPowerIdle: inputs.systemPowerIdle,
      dryerPower: inputs.dryerPower,
      footPrintCost,
      sqrFootSystem: inputs.sqrFootSystem,
      sqrFootDryer: inputs.sqrFootDryer,
      totalOpex,
    },
    performance: {
      tpt: inputs.tpt,
      availability: inputs.availability,
      utilization: inputs.utilization,
      yearly: yearlyImpressions,
      fiveYear: fiveYearImpressions,
    },
  };
}

export const DEFAULT_SYSTEMS = [
  {
    name: "Atlas MATRIX",
    inputs: {
      systemPrice: 600000, installation: 10000,
      operatorsPerSystem: 1.5, laborCostPerHr: 18, hrsPerShift: 12,
      inkCostPerL: 103, functionalConsumablesPerL: 103, fixaCostPerL: 13,
      avgInkLaydown: 4.7, fixaLaydown: 70, fixaDilution: 15,
      serviceContractPerYear: 30000,
      kwhCost: 0.1, systemPower: 1.5, systemPowerIdle: 0.5, dryerPower: 25,
      sqrFootSystem: 90, sqrFootDryer: 90, sqrFootCost: 5,
      tpt: 103, availability: 0.93, utilization: 0.8,
    },
  },
];