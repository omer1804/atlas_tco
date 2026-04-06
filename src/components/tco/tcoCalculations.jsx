// Pure calculation functions — given editable inputs, recompute all derived values

// PMT function: annuity payment to amortize principal P over n periods at rate r
function pmt(rate, nper, pv) {
  if (rate === 0) return pv / nper;
  return (pv * rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1);
}

export function computeSystem(s) {
  const { inputs } = s;
  const lifeTime = inputs.lifeTime || 5;
  const interestRate = inputs.interestRate || 0; // annual rate as decimal e.g. 0.05

  // CAPEX
  const totalCapex = inputs.systemPrice + inputs.installation;

  // Amortization using PMT (loan/annuity method) if interest rate > 0
  // Annual payment to recover the equipment cost over lifeTime years
  const annualCapexPayment = pmt(interestRate, lifeTime, inputs.systemPrice);
  const totalCapexCost = annualCapexPayment * lifeTime; // total paid over life
  const assetValueAfter5Y = interestRate === 0
    ? inputs.systemPrice * (1 - 5 / lifeTime)  // straight-line residual after 5Y
    : 0; // when financed, asset is fully expensed via payments

  // Performance — uses workingDays/year (default 252)
  const workingDays = inputs.workingDays || 252;
  const yearlyImpressions = inputs.tpt * inputs.availability * inputs.utilization * inputs.hrsPerShift * workingDays;
  const fiveYearImpressions = yearlyImpressions * 5;

  // Labor (5Y) — uses 365 days/year
  const labor5Y = inputs.operatorsPerSystem * inputs.laborCostPerHr * inputs.hrsPerShift * 365 * 5;

  // Ink cost (5Y)
  const inkPerImpL = inputs.avgInkLaydown / 1000;
  const fixaPerImpL = (inputs.fixaLaydown / inputs.fixaDilution) / 1000;
  const inkCost5Y = fiveYearImpressions * (
    inkPerImpL * inputs.inkCostPerL +
    fixaPerImpL * inputs.fixaCostPerL
  );

  // Maintenance (5Y)
  const maintenance5Y = inputs.serviceContractPerYear * 5;

  // Energy (5Y) — uses workingDays
  const energyHrsPerYear = inputs.hrsPerShift * workingDays;
  const energyKwh5Y = (inputs.systemPower + inputs.dryerPower) * energyHrsPerYear * 5;
  const energy5Y = energyKwh5Y * inputs.kwhCost;

  // Foot print (5Y)
  const footPrintCost = (inputs.sqrFootSystem + inputs.sqrFootDryer) * inputs.sqrFootCost * 5;

  const totalOpex = labor5Y + inkCost5Y + maintenance5Y + energy5Y + footPrintCost;

  // Total 5Y investment: if interest rate provided, use PMT-based 5Y capex cost; else straight-line with residual
  const capex5YCost = interestRate === 0
    ? totalCapex - assetValueAfter5Y
    : annualCapexPayment * 5 + inputs.installation;

  const total5YInvestment = capex5YCost + totalOpex;

  const tco = fiveYearImpressions > 0 ? total5YInvestment / fiveYearImpressions : 0;
  const cpp = fiveYearImpressions > 0 ? inkCost5Y / fiveYearImpressions : 0;

  return {
    name: s.name,
    total5YInvestment,
    tco,
    capex: {
      systemPrice: inputs.systemPrice,
      installation: inputs.installation,
      lifeTime,
      interestRate,
      annualCapexPayment,
      assetValueAfter5Y,
      totalCapex,
    },
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
      lifeTime: 5, interestRate: 0,
      operatorsPerSystem: 1.5, laborCostPerHr: 18, hrsPerShift: 12,
      inkCostPerL: 103, functionalConsumablesPerL: 103, fixaCostPerL: 13,
      avgInkLaydown: 4.7, fixaLaydown: 35, fixaDilution: 15,
      serviceContractPerYear: 30000,
      kwhCost: 0.1, systemPower: 1.5, systemPowerIdle: 0.5, dryerPower: 25,
      sqrFootSystem: 90, sqrFootDryer: 90, sqrFootCost: 5,
      tpt: 103, availability: 0.93, utilization: 0.8,
      workingDays: 252,
    },
  },
  {
    name: "Atlas MAX Plus",
    inputs: {
      systemPrice: 600000, installation: 10000,
      lifeTime: 5, interestRate: 0,
      operatorsPerSystem: 1, laborCostPerHr: 18, hrsPerShift: 12,
      inkCostPerL: 150, functionalConsumablesPerL: 100, fixaCostPerL: 10,
      avgInkLaydown: 5, fixaLaydown: 35, fixaDilution: 10,
      serviceContractPerYear: 32500,
      kwhCost: 0.1, systemPower: 1.5, systemPowerIdle: 0.5, dryerPower: 25,
      sqrFootSystem: 90, sqrFootDryer: 90, sqrFootCost: 5,
      tpt: 100, availability: 0.93, utilization: 0.8,
      workingDays: 252,
    },
  },
  {
    name: "Atlas MAX POLY",
    inputs: {
      systemPrice: 800000, installation: 10000,
      lifeTime: 5, interestRate: 0,
      operatorsPerSystem: 1, laborCostPerHr: 18, hrsPerShift: 12,
      inkCostPerL: 175, functionalConsumablesPerL: 100, fixaCostPerL: 10,
      avgInkLaydown: 8, fixaLaydown: 35, fixaDilution: 10,
      serviceContractPerYear: 40000,
      kwhCost: 0.1, systemPower: 1.5, systemPowerIdle: 0.5, dryerPower: 25,
      sqrFootSystem: 90, sqrFootDryer: 90, sqrFootCost: 5,
      tpt: 90, availability: 0.93, utilization: 0.8,
      workingDays: 252,
    },
  },
];