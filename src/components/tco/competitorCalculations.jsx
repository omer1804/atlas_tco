// Competitor calculation functions

// ─── DTF ────────────────────────────────────────────────────────────────────
export const DEFAULT_DTF_INPUTS = {
  // CAPEX
  numPrinters: 3,
  printerCostEach: 30000,
  cutterCost: 15000,
  numPressStations: 3,
  pressStationCostEach: 5000,
  // Labor
  operatorsPrinterCutter: 1.5,
  operatorsMatching: 1,
  operatorsPresses: 3,
  laborCostPerHr: 18,
  hrsPerShift: 10,
  workingDays: 252,
  // Consumables
  consumablesCostPerL: 50, // mid range $20–$80
  inkLaydownMlPerPrint: 6,  // ml per print
  powderFilmCostPerPrint: 0.20, // powder + film cost per impression
  // Performance
  printerTPH: 80,   // prints/hr per printer
  pressTPH: 60,     // garments/hr per press
  availability: 0.75,
  utilization: 0.8,
  // Service
  serviceContractPerYear: 12000,
  workingDays: 365,
};

export function computeDTF(inputs) {
  // CAPEX
  const totalCapex =
    inputs.numPrinters * inputs.printerCostEach +
    inputs.cutterCost +
    inputs.numPressStations * inputs.pressStationCostEach;
  const assetValueAfter5Y = totalCapex * 0.2;

  // Performance — bottleneck is presses (60 garments/hr × numPresses) or printers
  const printerCapacity = inputs.numPrinters * inputs.printerTPH * inputs.availability * inputs.utilization;
  const pressCapacity = inputs.numPressStations * inputs.pressTPH * inputs.availability * inputs.utilization;
  const effectiveTPH = Math.min(printerCapacity, pressCapacity);

  const yearlyImpressions = effectiveTPH * inputs.hrsPerShift * (inputs.workingDays || 252);
  const fiveYearImpressions = yearlyImpressions * 5;

  // Labor (5Y)
  const totalOperators = inputs.operatorsPrinterCutter + inputs.operatorsMatching + inputs.operatorsPresses;
  const labor5Y = totalOperators * inputs.laborCostPerHr * inputs.hrsPerShift * 365 * 5;

  // Consumables ink + powder/film (5Y)
  const consumables5Y = fiveYearImpressions * (
    (inputs.inkLaydownMlPerPrint / 1000) * inputs.consumablesCostPerL +
    inputs.powderFilmCostPerPrint
  );

  // Maintenance (5Y)
  const maintenance5Y = inputs.serviceContractPerYear * 5;

  const totalOpex = labor5Y + consumables5Y + maintenance5Y;
  const total5YInvestment = totalCapex + totalOpex - assetValueAfter5Y;

  const tco = fiveYearImpressions > 0 ? total5YInvestment / fiveYearImpressions : 0;
  const cpp = fiveYearImpressions > 0 ? consumables5Y / fiveYearImpressions : 0;

  return {
    name: "DTF",
    totalCapex,
    assetValueAfter5Y,
    labor5Y,
    consumables5Y,
    maintenance5Y,
    totalOpex,
    total5YInvestment,
    tco,
    cpp,
    effectiveTPH,
    yearlyImpressions,
    fiveYearImpressions,
    totalOperators,
  };
}

// ─── SCREEN PRINTING ────────────────────────────────────────────────────────
export const DEFAULT_SCREEN_INPUTS = {
  // Operational
  tph: 400,             // shirts per hour (carousel)
  loadUnloadSec: 9,     // seconds per print
  laborPerCarousel: 2,  // operators
  laborCostPerHr: 20,
  hrsPerShift: 10,
  // CAPEX
  carouselCapex: 0,     // some shops already own it
  // Consumables
  inkAdhesivePerPrint: 0.10, // $/print
  prepCostPerScreen: 15,     // $ incl. labor + supplies
  screenSetupTimeMins: 7,    // mins to set up 1 screen
  // Job variables (these affect CPP heavily)
  numColors: 4,         // screens needed
  runLength: 100,       // pieces per job
  // Availability / utilization
  availability: 0.85,
  utilization: 0.75,
};

export function computeScreen(inputs) {
  const { numColors, runLength } = inputs;

  // CAPEX
  const totalCapex = inputs.carouselCapex;
  const assetValueAfter5Y = totalCapex * 0.2;

  // Performance
  const effectiveTPH = inputs.tph * inputs.availability * inputs.utilization;
  const yearlyImpressions = effectiveTPH * inputs.hrsPerShift * (inputs.workingDays || 252);
  const fiveYearImpressions = yearlyImpressions * 5;

  // Labor (5Y)
  const labor5Y = inputs.laborPerCarousel * inputs.laborCostPerHr * inputs.hrsPerShift * 365 * 5;

  // Screen setup cost per job — numColors screens × prepCost + time cost
  const screenSetupCostPerJob = numColors * (
    inputs.prepCostPerScreen +
    (inputs.screenSetupTimeMins / 60) * inputs.laborCostPerHr * inputs.laborPerCarousel
  );

  // Setup cost amortized per print
  const setupCostPerPrint = screenSetupCostPerJob / runLength;

  // Ink + adhesive per print
  const consumablesPerPrint = inputs.inkAdhesivePerPrint;

  // Labor per print (pure run time)
  const laborPerPrint = (inputs.laborPerCarousel * inputs.laborCostPerHr) / inputs.tph;

  // Total CPP
  const tcoPerPrint = setupCostPerPrint + consumablesPerPrint + laborPerPrint;

  // 5Y cost estimate based on throughput
  const consumables5Y = fiveYearImpressions * consumablesPerPrint;
  const setupCosts5Y = fiveYearImpressions * setupCostPerPrint;
  const totalOpex = labor5Y + consumables5Y + setupCosts5Y;
  const total5YInvestment = totalCapex + totalOpex - assetValueAfter5Y;
  const tco = fiveYearImpressions > 0 ? total5YInvestment / fiveYearImpressions : 0;

  return {
    name: "Screen Printing",
    totalCapex,
    assetValueAfter5Y,
    labor5Y,
    consumables5Y,
    setupCosts5Y,
    totalOpex,
    total5YInvestment,
    tco,
    cpp: tcoPerPrint,
    setupCostPerPrint,
    consumablesPerPrint,
    laborPerPrint,
    effectiveTPH,
    yearlyImpressions,
    fiveYearImpressions,
  };
}

export const SCREEN_LABOR_TIERS = [5, 10, 15, 20];
export const SCREEN_RUN_LENGTHS = [10, 20, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500];
export const SCREEN_MAX_COLORS = 14;
export const SCREEN_CPP_TABLE = {};

// Interpolate CPP from table for a given run length (handles rows between defined run lengths)
function getCPPFromTable(table, runLength, colorIdx) {
  const allLengths = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (runLength <= allLengths[0]) return table[allLengths[0]][colorIdx];
  if (runLength >= allLengths[allLengths.length - 1]) return table[allLengths[allLengths.length - 1]][colorIdx];
  for (let i = 0; i < allLengths.length - 1; i++) {
    if (runLength >= allLengths[i] && runLength <= allLengths[i + 1]) {
      const t = (runLength - allLengths[i]) / (allLengths[i + 1] - allLengths[i]);
      return table[allLengths[i]][colorIdx] + t * (table[allLengths[i + 1]][colorIdx] - table[allLengths[i]][colorIdx]);
    }
  }
  return table[allLengths[allLengths.length - 1]][colorIdx];
}

// Get CPP by interpolating between the 4 tier tables for any labor rate 1–25+
export function getScreenCPP(runLength, numColors, laborCostPerHr = 20) {
  const rl = Math.max(1, runLength);
  const colorIdx = Math.min(Math.max(Math.round(numColors) - 1, 0), SCREEN_MAX_COLORS - 1);
  const tiers = SCREEN_LABOR_TIERS; // [5, 10, 15, 20]

  // Below $5: extrapolate using the slope between $5 and $10
  if (laborCostPerHr <= tiers[0]) {
    const cpp5 = getCPPFromTable(SCREEN_CPP_TABLES[5], rl, colorIdx);
    const cpp10 = getCPPFromTable(SCREEN_CPP_TABLES[10], rl, colorIdx);
    const slope = (cpp10 - cpp5) / (10 - 5);
    return cpp5 + slope * (laborCostPerHr - 5);
  }

  if (laborCostPerHr >= tiers[tiers.length - 1]) {
    // Extrapolate linearly beyond $20 using the slope between $15 and $20
    const cpp15 = getCPPFromTable(SCREEN_CPP_TABLES[15], rl, colorIdx);
    const cpp20 = getCPPFromTable(SCREEN_CPP_TABLES[20], rl, colorIdx);
    const slope = (cpp20 - cpp15) / (20 - 15);
    return cpp20 + slope * (laborCostPerHr - 20);
  }

  // Interpolate between surrounding tiers
  for (let i = 0; i < tiers.length - 1; i++) {
    if (laborCostPerHr >= tiers[i] && laborCostPerHr <= tiers[i + 1]) {
      const t = (laborCostPerHr - tiers[i]) / (tiers[i + 1] - tiers[i]);
      const cppLow = getCPPFromTable(SCREEN_CPP_TABLES[tiers[i]], rl, colorIdx);
      const cppHigh = getCPPFromTable(SCREEN_CPP_TABLES[tiers[i + 1]], rl, colorIdx);
      return cppLow + t * (cppHigh - cppLow);
    }
  }
  return getCPPFromTable(SCREEN_CPP_TABLES[20], rl, colorIdx);
}

export function getScreenBreakdown(runLength, numColors, polyesterAddon = 0, laborCostPerHr = 20) {
  const total = getScreenCPP(runLength, numColors, laborCostPerHr);
  // Approximate breakdown: consumables are fixed, rest split between labor+setup
  const consumables = 0.10 + polyesterAddon;
  const laborSetup = Math.max(0, total - consumables);
  return {
    labor: laborSetup,
    consumables,
    setup: 0,
    capex: 0,
    total,
  };
}

export function getClosestLaborTier(laborCost) {
  return SCREEN_LABOR_TIERS.reduce((best, tier) => Math.abs(tier - laborCost) < Math.abs(best - laborCost) ? tier : best, SCREEN_LABOR_TIERS[0]);
}

export const SCREEN_CPP_TABLES = {
  5: {
    10:   [1.78, 4.92, 8.76, 14.64, 22.03, 30.92, 39.51, 51.14, 64.28, 78.92, 92.26, 109.64, 128.53, 148.91],
    20:   [0.86, 1.78, 2.95, 4.92, 6.71, 8.76, 11.97, 14.64, 18.74, 22.03, 25.58, 30.92, 35.09, 39.51],
    50:   [0.39, 0.59, 0.99, 1.24, 1.78, 2.08, 2.78, 3.57, 3.97, 4.92, 5.37, 6.46, 6.96, 8.21],
    75:   [0.32, 0.46, 0.59, 0.90, 1.07, 1.24, 1.68, 1.88, 2.08, 2.66, 2.89, 3.57, 3.84, 4.11],
    100:  [0.22, 0.39, 0.49, 0.59, 0.86, 0.99, 1.11, 1.24, 1.63, 1.78, 1.93, 2.08, 2.60, 2.78],
    150:  [0.20, 0.32, 0.39, 0.46, 0.52, 0.59, 0.66, 0.90, 0.99, 1.07, 1.15, 1.24, 1.58, 1.68],
    200:  [0.18, 0.22, 0.34, 0.39, 0.44, 0.49, 0.54, 0.59, 0.64, 0.86, 0.92, 0.99, 1.05, 1.11],
    250:  [0.18, 0.21, 0.24, 0.35, 0.39, 0.43, 0.47, 0.51, 0.55, 0.59, 0.63, 0.67, 0.89, 0.94],
    300:  [0.17, 0.20, 0.22, 0.32, 0.36, 0.39, 0.42, 0.46, 0.49, 0.52, 0.56, 0.59, 0.62, 0.66],
    350:  [0.17, 0.19, 0.21, 0.23, 0.33, 0.36, 0.39, 0.42, 0.45, 0.48, 0.51, 0.53, 0.56, 0.59],
    400:  [0.16, 0.18, 0.20, 0.22, 0.32, 0.34, 0.37, 0.39, 0.42, 0.44, 0.47, 0.49, 0.52, 0.54],
    450:  [0.16, 0.18, 0.20, 0.21, 0.23, 0.32, 0.35, 0.37, 0.39, 0.41, 0.44, 0.46, 0.48, 0.50],
    500:  [0.16, 0.18, 0.19, 0.21, 0.22, 0.24, 0.33, 0.35, 0.37, 0.39, 0.41, 0.43, 0.45, 0.47],
    550:  [0.16, 0.17, 0.19, 0.20, 0.21, 0.23, 0.32, 0.34, 0.35, 0.37, 0.39, 0.41, 0.43, 0.45],
    600:  [0.16, 0.17, 0.18, 0.20, 0.21, 0.22, 0.23, 0.32, 0.34, 0.36, 0.37, 0.39, 0.41, 0.42],
    650:  [0.16, 0.17, 0.18, 0.19, 0.20, 0.21, 0.23, 0.31, 0.33, 0.34, 0.36, 0.38, 0.39, 0.41],
    700:  [0.16, 0.17, 0.18, 0.19, 0.20, 0.21, 0.22, 0.23, 0.32, 0.33, 0.35, 0.36, 0.38, 0.39],
    750:  [0.16, 0.17, 0.18, 0.19, 0.20, 0.21, 0.22, 0.23, 0.24, 0.32, 0.34, 0.35, 0.36, 0.38],
    800:  [0.15, 0.16, 0.17, 0.18, 0.19, 0.20, 0.21, 0.22, 0.23, 0.32, 0.33, 0.34, 0.35, 0.37],
    850:  [0.15, 0.16, 0.17, 0.18, 0.19, 0.20, 0.21, 0.22, 0.22, 0.23, 0.32, 0.33, 0.34, 0.36],
    900:  [0.15, 0.16, 0.17, 0.18, 0.19, 0.20, 0.20, 0.21, 0.22, 0.23, 0.24, 0.32, 0.34, 0.35],
    950:  [0.15, 0.16, 0.17, 0.18, 0.18, 0.19, 0.20, 0.21, 0.22, 0.22, 0.23, 0.32, 0.33, 0.34],
    1000: [0.15, 0.16, 0.17, 0.18, 0.18, 0.19, 0.20, 0.21, 0.21, 0.22, 0.23, 0.24, 0.32, 0.33],
    1050: [0.15, 0.16, 0.17, 0.17, 0.18, 0.19, 0.20, 0.20, 0.21, 0.22, 0.22, 0.23, 0.31, 0.32],
    1100: [0.15, 0.16, 0.17, 0.17, 0.18, 0.19, 0.19, 0.20, 0.21, 0.21, 0.22, 0.23, 0.23, 0.32],
    1150: [0.15, 0.16, 0.16, 0.17, 0.18, 0.18, 0.19, 0.20, 0.20, 0.21, 0.22, 0.23, 0.23, 0.24],
    1200: [0.15, 0.16, 0.16, 0.17, 0.18, 0.18, 0.19, 0.20, 0.20, 0.21, 0.21, 0.22, 0.22, 0.23],
    1250: [0.15, 0.16, 0.16, 0.17, 0.18, 0.18, 0.19, 0.19, 0.20, 0.21, 0.21, 0.22, 0.22, 0.23],
    1300: [0.15, 0.16, 0.16, 0.17, 0.17, 0.18, 0.19, 0.19, 0.20, 0.20, 0.21, 0.22, 0.22, 0.23],
    1350: [0.15, 0.16, 0.16, 0.17, 0.17, 0.18, 0.18, 0.19, 0.20, 0.20, 0.21, 0.21, 0.22, 0.22],
    1400: [0.15, 0.16, 0.16, 0.17, 0.17, 0.18, 0.18, 0.19, 0.19, 0.20, 0.20, 0.21, 0.21, 0.22],
    1450: [0.15, 0.16, 0.16, 0.17, 0.17, 0.18, 0.18, 0.19, 0.19, 0.20, 0.20, 0.21, 0.21, 0.22],
    1500: [0.15, 0.16, 0.16, 0.17, 0.17, 0.18, 0.18, 0.19, 0.19, 0.19, 0.20, 0.20, 0.21, 0.21],
  },
  10: {
    10:   [2.46, 6.24, 10.67, 17.19, 25.21, 34.73, 43.91, 56.19, 69.96, 85.23, 99.16, 117.18, 136.71, 157.73],
    20:   [1.25, 2.46, 3.93, 6.24, 8.33, 10.67, 14.22, 17.19, 21.62, 25.21, 29.05, 34.73, 39.20, 43.91],
    50:   [0.58, 0.88, 1.42, 1.77, 2.46, 2.86, 3.70, 4.64, 5.14, 6.24, 6.79, 8.03, 8.63, 10.02],
    75:   [0.48, 0.68, 0.88, 1.31, 1.54, 1.77, 2.33, 2.60, 2.86, 3.55, 3.85, 4.64, 4.98, 5.31],
    100:  [0.32, 0.58, 0.73, 0.88, 1.25, 1.42, 1.60, 1.77, 2.26, 2.46, 2.66, 2.86, 3.48, 3.70],
    150:  [0.27, 0.48, 0.58, 0.68, 0.78, 0.88, 0.98, 1.31, 1.42, 1.54, 1.66, 1.77, 2.20, 2.33],
    200:  [0.25, 0.32, 0.51, 0.58, 0.66, 0.73, 0.81, 0.88, 0.96, 1.25, 1.33, 1.42, 1.51, 1.60],
    250:  [0.24, 0.29, 0.34, 0.52, 0.58, 0.64, 0.70, 0.76, 0.82, 0.88, 0.94, 1.00, 1.28, 1.35],
    300:  [0.23, 0.27, 0.32, 0.48, 0.53, 0.58, 0.63, 0.68, 0.73, 0.78, 0.83, 0.88, 0.93, 0.98],
    350:  [0.23, 0.26, 0.30, 0.33, 0.50, 0.54, 0.58, 0.62, 0.67, 0.71, 0.75, 0.80, 0.84, 0.88],
    400:  [0.22, 0.25, 0.28, 0.32, 0.47, 0.51, 0.54, 0.58, 0.62, 0.66, 0.69, 0.73, 0.77, 0.81],
    450:  [0.22, 0.25, 0.27, 0.30, 0.33, 0.48, 0.51, 0.55, 0.58, 0.61, 0.65, 0.68, 0.71, 0.75],
    500:  [0.22, 0.24, 0.27, 0.29, 0.32, 0.34, 0.49, 0.52, 0.55, 0.58, 0.61, 0.64, 0.67, 0.70],
    550:  [0.21, 0.24, 0.26, 0.28, 0.30, 0.33, 0.47, 0.50, 0.53, 0.55, 0.58, 0.61, 0.64, 0.66],
    600:  [0.21, 0.23, 0.25, 0.27, 0.29, 0.32, 0.34, 0.48, 0.51, 0.53, 0.56, 0.58, 0.61, 0.63],
    650:  [0.21, 0.23, 0.25, 0.27, 0.29, 0.31, 0.33, 0.47, 0.49, 0.51, 0.54, 0.56, 0.58, 0.60],
    700:  [0.21, 0.23, 0.24, 0.26, 0.28, 0.30, 0.32, 0.33, 0.47, 0.50, 0.52, 0.54, 0.56, 0.58],
    750:  [0.21, 0.22, 0.24, 0.26, 0.27, 0.29, 0.31, 0.32, 0.34, 0.48, 0.50, 0.52, 0.54, 0.56],
    800:  [0.21, 0.22, 0.24, 0.25, 0.27, 0.28, 0.30, 0.32, 0.33, 0.47, 0.49, 0.51, 0.53, 0.54],
    850:  [0.21, 0.22, 0.23, 0.25, 0.26, 0.28, 0.29, 0.31, 0.32, 0.34, 0.48, 0.49, 0.51, 0.53],
    900:  [0.20, 0.22, 0.23, 0.25, 0.26, 0.27, 0.29, 0.30, 0.32, 0.33, 0.34, 0.48, 0.50, 0.51],
    950:  [0.20, 0.22, 0.23, 0.24, 0.26, 0.27, 0.28, 0.30, 0.31, 0.32, 0.34, 0.47, 0.49, 0.50],
    1000: [0.20, 0.22, 0.23, 0.24, 0.25, 0.27, 0.28, 0.29, 0.30, 0.32, 0.33, 0.34, 0.48, 0.49],
    1050: [0.20, 0.21, 0.23, 0.24, 0.25, 0.26, 0.27, 0.29, 0.30, 0.31, 0.32, 0.33, 0.47, 0.48],
    1100: [0.20, 0.21, 0.22, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.30, 0.32, 0.33, 0.34, 0.47],
    1150: [0.20, 0.21, 0.22, 0.23, 0.25, 0.26, 0.27, 0.28, 0.29, 0.30, 0.31, 0.32, 0.33, 0.34],
    1200: [0.20, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.31, 0.32, 0.33, 0.34],
    1250: [0.20, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.30, 0.31, 0.32, 0.33],
    1300: [0.20, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.30, 0.31, 0.32, 0.33],
    1350: [0.20, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.27, 0.28, 0.29, 0.30, 0.31, 0.32],
    1400: [0.20, 0.21, 0.22, 0.23, 0.24, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.30, 0.31, 0.32],
    1450: [0.20, 0.21, 0.22, 0.23, 0.24, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.30, 0.31, 0.32],
    1500: [0.20, 0.21, 0.22, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.27, 0.28, 0.29, 0.30, 0.31],
  },
  15: {
    10:   [3.64, 9.30, 15.95, 25.73, 37.77, 52.05, 65.82, 84.23, 104.89, 127.80, 148.69, 175.73, 205.01, 236.54],
    20:   [1.82, 3.64, 5.84, 9.30, 12.44, 15.95, 21.28, 25.73, 32.38, 37.77, 43.53, 52.05, 58.75, 65.82],
    50:   [0.82, 1.27, 2.08, 2.61, 3.64, 4.24, 5.51, 6.92, 7.67, 9.30, 10.13, 11.99, 12.89, 14.97],
    75:   [0.67, 0.97, 1.27, 1.91, 2.26, 2.61, 3.44, 3.84, 4.24, 5.28, 5.73, 6.92, 7.42, 7.92],
    100:  [0.42, 0.82, 1.05, 1.27, 1.82, 2.08, 2.35, 2.61, 3.34, 3.64, 3.94, 4.24, 5.17, 5.51],
    150:  [0.36, 0.67, 0.82, 0.97, 1.12, 1.27, 1.42, 1.91, 2.08, 2.26, 2.43, 2.61, 3.24, 3.44],
    200:  [0.33, 0.42, 0.71, 0.82, 0.93, 1.05, 1.16, 1.27, 1.38, 1.82, 1.95, 2.08, 2.21, 2.35],
    250:  [0.31, 0.39, 0.46, 0.73, 0.82, 0.91, 1.00, 1.09, 1.18, 1.27, 1.36, 1.45, 1.87, 1.98],
    300:  [0.30, 0.36, 0.42, 0.67, 0.75, 0.82, 0.90, 0.97, 1.05, 1.12, 1.20, 1.27, 1.35, 1.42],
    350:  [0.29, 0.34, 0.40, 0.45, 0.69, 0.76, 0.82, 0.89, 0.95, 1.02, 1.08, 1.14, 1.21, 1.27],
    400:  [0.28, 0.33, 0.38, 0.42, 0.65, 0.71, 0.77, 0.82, 0.88, 0.93, 0.99, 1.05, 1.10, 1.16],
    450:  [0.28, 0.32, 0.36, 0.40, 0.44, 0.67, 0.72, 0.77, 0.82, 0.87, 0.92, 0.97, 1.02, 1.07],
    500:  [0.27, 0.31, 0.35, 0.39, 0.42, 0.46, 0.69, 0.73, 0.78, 0.82, 0.87, 0.91, 0.96, 1.00],
    550:  [0.27, 0.30, 0.34, 0.37, 0.41, 0.44, 0.66, 0.70, 0.74, 0.78, 0.82, 0.86, 0.90, 0.94],
    600:  [0.27, 0.30, 0.33, 0.36, 0.39, 0.42, 0.45, 0.67, 0.71, 0.75, 0.78, 0.82, 0.86, 0.90],
    650:  [0.26, 0.29, 0.32, 0.35, 0.38, 0.41, 0.44, 0.65, 0.68, 0.72, 0.75, 0.79, 0.82, 0.86],
    700:  [0.26, 0.29, 0.32, 0.34, 0.37, 0.40, 0.42, 0.45, 0.66, 0.69, 0.73, 0.76, 0.79, 0.82],
    750:  [0.26, 0.29, 0.31, 0.34, 0.36, 0.39, 0.41, 0.44, 0.46, 0.67, 0.70, 0.73, 0.76, 0.79],
    800:  [0.26, 0.28, 0.31, 0.33, 0.35, 0.38, 0.40, 0.42, 0.45, 0.65, 0.68, 0.71, 0.74, 0.77],
    850:  [0.26, 0.28, 0.30, 0.32, 0.35, 0.37, 0.39, 0.41, 0.43, 0.46, 0.66, 0.69, 0.72, 0.74],
    900:  [0.26, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42, 0.44, 0.47, 0.67, 0.70, 0.72],
    950:  [0.26, 0.28, 0.30, 0.32, 0.33, 0.35, 0.37, 0.39, 0.41, 0.43, 0.45, 0.66, 0.68, 0.70],
    1000: [0.25, 0.27, 0.29, 0.31, 0.33, 0.35, 0.37, 0.39, 0.40, 0.42, 0.44, 0.46, 0.66, 0.69],
    1050: [0.25, 0.27, 0.29, 0.31, 0.33, 0.34, 0.36, 0.38, 0.40, 0.41, 0.43, 0.45, 0.65, 0.67],
    1100: [0.25, 0.27, 0.29, 0.30, 0.32, 0.34, 0.36, 0.37, 0.39, 0.41, 0.42, 0.44, 0.46, 0.66],
    1150: [0.25, 0.27, 0.28, 0.30, 0.32, 0.33, 0.35, 0.37, 0.38, 0.40, 0.42, 0.43, 0.45, 0.46],
    1200: [0.25, 0.27, 0.28, 0.30, 0.31, 0.33, 0.35, 0.36, 0.38, 0.39, 0.41, 0.42, 0.44, 0.45],
    1250: [0.25, 0.27, 0.28, 0.30, 0.31, 0.33, 0.34, 0.36, 0.37, 0.39, 0.40, 0.42, 0.43, 0.45],
    1300: [0.25, 0.26, 0.28, 0.29, 0.31, 0.32, 0.34, 0.35, 0.37, 0.38, 0.39, 0.41, 0.42, 0.44],
    1350: [0.25, 0.26, 0.28, 0.29, 0.31, 0.32, 0.33, 0.35, 0.36, 0.37, 0.39, 0.40, 0.42, 0.43],
    1400: [0.25, 0.26, 0.27, 0.29, 0.30, 0.32, 0.33, 0.34, 0.36, 0.37, 0.38, 0.40, 0.41, 0.42],
    1450: [0.25, 0.26, 0.27, 0.29, 0.30, 0.31, 0.33, 0.34, 0.35, 0.37, 0.38, 0.39, 0.40, 0.42],
    1500: [0.25, 0.26, 0.27, 0.29, 0.30, 0.31, 0.32, 0.34, 0.35, 0.36, 0.37, 0.39, 0.40, 0.41],
  },
  20: {
    10:   [4.83, 12.37, 21.23, 34.28, 50.32, 69.37, 87.73, 112.27, 139.82, 170.36, 198.22, 234.27, 273.31, 315.36],
    20:   [2.39, 4.83, 7.76, 12.37, 16.55, 21.23, 28.35, 34.28, 43.14, 50.32, 58.00, 69.37, 78.30, 87.73],
    50:   [1.06, 1.66, 2.74, 3.44, 4.83, 5.63, 7.31, 9.19, 10.19, 12.37, 13.47, 15.95, 17.15, 19.93],
    75:   [0.86, 1.26, 1.66, 2.51, 2.98, 3.44, 4.56, 5.09, 5.63, 7.01, 7.61, 9.19, 9.86, 10.52],
    100:  [0.53, 1.06, 1.36, 1.66, 2.39, 2.74, 3.09, 3.44, 4.43, 4.83, 5.23, 5.63, 6.86, 7.31],
    150:  [0.45, 0.86, 1.06, 1.26, 1.46, 1.66, 1.86, 2.51, 2.74, 2.98, 3.21, 3.44, 4.79, 4.56],
    200:  [0.41, 0.53, 0.91, 1.06, 1.21, 1.36, 1.51, 1.66, 1.81, 2.39, 2.57, 2.74, 2.92, 3.09],
    250:  [0.38, 0.48, 0.58, 0.94, 1.06, 1.18, 1.30, 1.42, 1.54, 1.66, 1.78, 1.90, 2.46, 2.60],
    300:  [0.36, 0.45, 0.53, 0.86, 0.96, 1.06, 1.16, 1.26, 1.36, 1.46, 1.56, 1.66, 1.76, 1.86],
    350:  [0.35, 0.42, 0.50, 0.57, 0.80, 0.89, 0.98, 1.06, 1.15, 1.32, 1.41, 1.49, 1.58, 1.66],
    400:  [0.34, 0.41, 0.47, 0.53, 0.84, 0.91, 0.99, 1.06, 1.14, 1.21, 1.29, 1.36, 1.44, 1.51],
    450:  [0.34, 0.39, 0.45, 0.50, 0.56, 0.86, 0.93, 1.00, 1.06, 1.13, 1.20, 1.26, 1.33, 1.40],
    500:  [0.33, 0.38, 0.43, 0.48, 0.53, 0.58, 0.88, 0.94, 1.00, 1.06, 1.12, 1.18, 1.24, 1.30],
    550:  [0.33, 0.37, 0.42, 0.46, 0.51, 0.55, 0.84, 0.90, 0.90, 1.01, 1.06, 1.12, 1.17, 1.23],
    600:  [0.32, 0.36, 0.41, 0.45, 0.49, 0.53, 0.57, 0.86, 0.91, 0.96, 1.01, 1.06, 1.11, 1.16],
    650:  [0.32, 0.36, 0.40, 0.44, 0.47, 0.51, 0.55, 0.83, 0.88, 0.92, 0.97, 1.02, 1.06, 1.11],
    700:  [0.32, 0.35, 0.39, 0.42, 0.46, 0.50, 0.53, 0.57, 0.85, 0.89, 0.93, 0.98, 1.02, 1.06],
    750:  [0.31, 0.35, 0.38, 0.41, 0.45, 0.48, 0.51, 0.55, 0.58, 0.86, 0.90, 0.94, 0.98, 1.02],
    800:  [0.31, 0.34, 0.38, 0.41, 0.44, 0.47, 0.50, 0.53, 0.56, 0.80, 0.84, 0.91, 0.95, 0.99],
    850:  [0.31, 0.34, 0.37, 0.40, 0.43, 0.46, 0.49, 0.52, 0.55, 0.58, 0.85, 0.89, 0.92, 0.96],
    900:  [0.31, 0.34, 0.36, 0.39, 0.42, 0.45, 0.48, 0.50, 0.53, 0.56, 0.59, 0.86, 0.90, 0.93],
    950:  [0.31, 0.33, 0.36, 0.39, 0.41, 0.44, 0.47, 0.49, 0.52, 0.54, 0.57, 0.84, 0.87, 0.90],
    1000: [0.31, 0.33, 0.36, 0.38, 0.41, 0.43, 0.46, 0.48, 0.51, 0.53, 0.56, 0.58, 0.85, 0.88],
    1050: [0.31, 0.33, 0.35, 0.38, 0.40, 0.42, 0.45, 0.47, 0.50, 0.52, 0.54, 0.57, 0.83, 0.86],
    1100: [0.30, 0.33, 0.35, 0.37, 0.40, 0.42, 0.44, 0.46, 0.49, 0.51, 0.53, 0.55, 0.58, 0.84],
    1150: [0.30, 0.32, 0.35, 0.37, 0.39, 0.41, 0.43, 0.46, 0.48, 0.50, 0.52, 0.54, 0.56, 0.59],
    1200: [0.30, 0.32, 0.34, 0.36, 0.39, 0.41, 0.43, 0.45, 0.47, 0.49, 0.51, 0.53, 0.55, 0.57],
    1250: [0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42, 0.44, 0.46, 0.48, 0.50, 0.52, 0.54, 0.56],
    1300: [0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42, 0.44, 0.45, 0.47, 0.49, 0.51, 0.53, 0.55],
    1350: [0.30, 0.32, 0.34, 0.35, 0.37, 0.39, 0.41, 0.43, 0.45, 0.47, 0.49, 0.50, 0.52, 0.54],
    1400: [0.30, 0.32, 0.34, 0.35, 0.37, 0.39, 0.41, 0.42, 0.44, 0.46, 0.48, 0.50, 0.51, 0.53],
    1450: [0.30, 0.32, 0.33, 0.35, 0.37, 0.38, 0.40, 0.42, 0.44, 0.45, 0.47, 0.49, 0.51, 0.52],
    1500: [0.30, 0.31, 0.33, 0.35, 0.36, 0.38, 0.40, 0.41, 0.43, 0.45, 0.46, 0.48, 0.50, 0.51],
  },
};