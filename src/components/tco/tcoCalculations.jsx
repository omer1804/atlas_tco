// Pure calculation functions — given editable inputs, recompute all derived values

export function computeSystem(s) {
  const { inputs } = s;

  // CAPEX
  const totalCapex = inputs.systemPrice + inputs.installation;
  const depreciation = (inputs.systemPrice * 0.16); // SLN
  const assetValueAfter5Y = inputs.systemPrice * 0.2;

  // Performance
  const yearlyImpressions = inputs.tpt * inputs.availability * inputs.utilization * inputs.hrsPerShift * 365;
  const fiveYearImpressions = yearlyImpressions * 5;

  // Labor (5Y)
  const labor5Y = inputs.operatorsPerSystem * inputs.laborCostPerHr * inputs.hrsPerShift * 365 * 5;

  // Ink cost (5Y)
  // Ink volume per impression (ml -> L)
  const inkPerImpL = (inputs.avgInkLaydown / 1000);
  const fixaPerImpL = (inputs.fixaLaydown / inputs.fixaDilution / 1000);
  const inkCost5Y = fiveYearImpressions * (
    inkPerImpL * inputs.inkCostPerL +
    inkPerImpL * inputs.functionalConsumablesPerL +
    fixaPerImpL * inputs.fixaCostPerL
  );

  // Maintenance (5Y)
  const maintenance5Y = inputs.serviceContractPerYear * 5;

  // Energy (5Y) — KWh * cost * hours * 365 * 5
  const energyHrsPerYear = inputs.hrsPerShift * 365;
  const energyKwh5Y = (inputs.systemPower + inputs.dryerPower) * energyHrsPerYear * 5;
  const energy5Y = energyKwh5Y * inputs.kwhCost;

  // Foot print (5Y)
  const footPrintCost = (inputs.sqrFootSystem + inputs.sqrFootDryer) * inputs.sqrFootCost * 5;

  const totalOpex = labor5Y + inkCost5Y + maintenance5Y + energy5Y + footPrintCost;
  const total5YInvestment = totalCapex + totalOpex;

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
    name: "Atlas MAX Plus",
    inputs: {
      systemPrice: 650000, installation: 10000,
      operatorsPerSystem: 1, laborCostPerHr: 20, hrsPerShift: 14,
      inkCostPerL: 150, functionalConsumablesPerL: 100, fixaCostPerL: 10,
      avgInkLaydown: 5, fixaLaydown: 35, fixaDilution: 10,
      serviceContractPerYear: 32500,
      kwhCost: 0.1, systemPower: 1.5, systemPowerIdle: 0.5, dryerPower: 25,
      sqrFootSystem: 90, sqrFootDryer: 90, sqrFootCost: 5,
      tpt: 120, availability: 0.93, utilization: 0.7,
    },
  },
  {
    name: "Atlas MAX POLY",
    inputs: {
      systemPrice: 800000, installation: 10000,
      operatorsPerSystem: 1, laborCostPerHr: 20, hrsPerShift: 14,
      inkCostPerL: 175, functionalConsumablesPerL: 100, fixaCostPerL: 10,
      avgInkLaydown: 8, fixaLaydown: 35, fixaDilution: 10,
      serviceContractPerYear: 40000,
      kwhCost: 0.1, systemPower: 1.5, systemPowerIdle: 0.5, dryerPower: 25,
      sqrFootSystem: 90, sqrFootDryer: 90, sqrFootCost: 5,
      tpt: 90, availability: 0.93, utilization: 0.7,
    },
  },
  {
    name: "Apollo",
    inputs: {
      systemPrice: 1800000, installation: 10000,
      operatorsPerSystem: 1, laborCostPerHr: 20, hrsPerShift: 14,
      inkCostPerL: 117, functionalConsumablesPerL: 0, fixaCostPerL: 10,
      avgInkLaydown: 5, fixaLaydown: 35, fixaDilution: 10,
      serviceContractPerYear: 90000,
      kwhCost: 0.1, systemPower: 8, systemPowerIdle: 1, dryerPower: 100,
      sqrFootSystem: 1200, sqrFootDryer: 0, sqrFootCost: 5,
      tpt: 350, availability: 0.93, utilization: 0.7,
    },
  },
  {
    name: "Polaris",
    inputs: {
      systemPrice: 700000, installation: 20000,
      operatorsPerSystem: 2, laborCostPerHr: 20, hrsPerShift: 14,
      inkCostPerL: 90, functionalConsumablesPerL: 0, fixaCostPerL: 10,
      avgInkLaydown: 10, fixaLaydown: 8.5, fixaDilution: 1,
      serviceContractPerYear: 20000,
      kwhCost: 0.1, systemPower: 80, systemPowerIdle: 0.5, dryerPower: 50,
      sqrFootSystem: 503, sqrFootDryer: 180, sqrFootCost: 5,
      tpt: 190, availability: 0.85, utilization: 0.7,
    },
  },
  {
    name: "Atlas MATRIX",
    inputs: {
      systemPrice: 650000, installation: 10000,
      operatorsPerSystem: 1, laborCostPerHr: 20, hrsPerShift: 14,
      inkCostPerL: 166, functionalConsumablesPerL: 100, fixaCostPerL: 10,
      avgInkLaydown: 5, fixaLaydown: 35, fixaDilution: 15,
      serviceContractPerYear: 32500,
      kwhCost: 0.1, systemPower: 1.5, systemPowerIdle: 0.5, dryerPower: 25,
      sqrFootSystem: 90, sqrFootDryer: 90, sqrFootCost: 5,
      tpt: 140, availability: 0.93, utilization: 0.7,
    },
  },
  {
    name: "Atlas MATRIX POLY",
    inputs: {
      systemPrice: 650000, installation: 10000,
      operatorsPerSystem: 1, laborCostPerHr: 20, hrsPerShift: 14,
      inkCostPerL: 166, functionalConsumablesPerL: 100, fixaCostPerL: 10,
      avgInkLaydown: 7, fixaLaydown: 35, fixaDilution: 15,
      serviceContractPerYear: 32500,
      kwhCost: 0.1, systemPower: 1.5, systemPowerIdle: 0.5, dryerPower: 25,
      sqrFootSystem: 90, sqrFootDryer: 90, sqrFootCost: 5,
      tpt: 98, availability: 0.93, utilization: 0.7,
    },
  },
];