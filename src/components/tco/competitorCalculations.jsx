// Competitor calculation functions

const WORKING_DAYS = 252;

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
  // Consumables
  consumablesCostPerL: 50, // mid range $20–$80
  inkLaydownMlPerPrint: 6,  // ml per print
  // Performance
  printerTPH: 80,   // prints/hr per printer
  pressTPH: 60,     // garments/hr per press
  availability: 0.75,
  utilization: 0.8,
  // Service
  serviceContractPerYear: 12000,
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

  const yearlyImpressions = effectiveTPH * inputs.hrsPerShift * WORKING_DAYS;
  const fiveYearImpressions = yearlyImpressions * 5;

  // Labor (5Y)
  const totalOperators = inputs.operatorsPrinterCutter + inputs.operatorsMatching + inputs.operatorsPresses;
  const labor5Y = totalOperators * inputs.laborCostPerHr * inputs.hrsPerShift * 365 * 5;

  // Consumables ink (5Y) — ml per print → L, × cost/L
  const consumables5Y = fiveYearImpressions * (inputs.inkLaydownMlPerPrint / 1000) * inputs.consumablesCostPerL;

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
  const yearlyImpressions = effectiveTPH * inputs.hrsPerShift * WORKING_DAYS;
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

// Screen CPP lookup table (run length × num colors)
// Rows = run lengths, Cols = num colors 1–14
export const SCREEN_CPP_TABLE = {
  10:  [3.30, 7.66, 13.43, 21.64, 30.44, 40.64, 53.98, 67.21, 81.85, 100.32, 117.99, 137.06, 157.53, 182.76],
  20:  [1.53, 3.30, 5.08, 7.66, 10.72, 13.43, 17.30, 21.64, 25.29, 30.44, 36.06, 40.64, 47.08, 53.98],
  50:  [0.72, 1.31, 1.75, 2.47, 3.30, 3.83, 4.79, 5.84, 6.47, 7.66, 8.95, 9.67, 11.10, 12.62],
  75:  [0.59, 0.85, 1.31, 1.60, 2.15, 2.47, 3.12, 3.47, 3.83, 4.60, 4.98, 5.84, 6.26, 7.22],
  100: [0.52, 0.72, 0.92, 1.31, 1.53, 1.75, 2.23, 2.47, 2.72, 3.30, 3.56, 3.83, 4.50, 4.79],
  150: [0.46, 0.59, 0.72, 0.85, 1.16, 1.31, 1.45, 1.60, 1.75, 2.15, 2.31, 2.47, 2.64, 3.12],
  200: [0.42, 0.52, 0.62, 0.72, 0.82, 0.92, 1.20, 1.31, 1.42, 1.53, 1.64, 1.75, 2.11, 2.23],
  250: [0.41, 0.48, 0.56, 0.64, 0.72, 0.80, 0.88, 1.13, 1.22, 1.31, 1.40, 1.48, 1.57, 1.66],
  300: [0.39, 0.46, 0.52, 0.59, 0.65, 0.72, 0.79, 0.85, 0.92, 1.16, 1.23, 1.31, 1.38, 1.45],
  350: [0.38, 0.44, 0.50, 0.55, 0.61, 0.66, 0.72, 0.78, 0.83, 0.89, 1.12, 1.18, 1.24, 1.31],
  400: [0.38, 0.42, 0.47, 0.52, 0.57, 0.62, 0.67, 0.72, 0.77, 0.82, 0.87, 0.92, 1.14, 1.20],
  450: [0.37, 0.41, 0.46, 0.50, 0.55, 0.59, 0.63, 0.68, 0.72, 0.76, 0.81, 0.85, 0.89, 1.11],
  500: [0.37, 0.41, 0.44, 0.48, 0.52, 0.56, 0.60, 0.64, 0.68, 0.72, 0.76, 0.80, 0.84, 0.88],
};

export const SCREEN_RUN_LENGTHS = [10, 20, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500];
export const SCREEN_MAX_COLORS = 14;

// Returns a TCO breakdown for screen printing: { labor, consumables, setup, capex, total }
// Uses the same constants baked into the lookup table:
//   - 2 operators, $20/hr, 400 shirts/hr → laborPerPrint = 2*20/400 = $0.10
//   - Ink/adhesive = $0.10/print
//   - Screen prep = $15/screen + 7min setup time @ $20/hr × 2 ops
//   - CAPEX = $0 (carousel assumed owned)
export function getScreenBreakdown(runLength, numColors, polyesterAddon = 0) {
  const tph = 400;
  const laborCostPerHr = 20;
  const laborPerCarousel = 2;
  const prepCostPerScreen = 15;
  const screenSetupTimeMins = 7;

  const laborPerPrint = (laborPerCarousel * laborCostPerHr) / tph; // $0.10
  const consumablesPerPrint = 0.10 + polyesterAddon;
  const setupCostPerJob = numColors * (
    prepCostPerScreen + (screenSetupTimeMins / 60) * laborCostPerHr * laborPerCarousel
  );
  const setupPerPrint = setupCostPerJob / runLength;
  const capexPerPrint = 0; // carousel assumed owned

  return {
    labor: laborPerPrint,
    consumables: consumablesPerPrint,
    setup: setupPerPrint,
    capex: capexPerPrint,
    total: laborPerPrint + consumablesPerPrint + setupPerPrint,
  };
}

// Get CPP from table, interpolating between nearest run lengths
export function getScreenCPP(runLength, numColors) {
  const colorIdx = Math.min(Math.max(Math.round(numColors) - 1, 0), SCREEN_MAX_COLORS - 1);
  const lengths = SCREEN_RUN_LENGTHS;
  
  // Clamp
  if (runLength <= lengths[0]) return SCREEN_CPP_TABLE[lengths[0]][colorIdx];
  if (runLength >= lengths[lengths.length - 1]) return SCREEN_CPP_TABLE[lengths[lengths.length - 1]][colorIdx];
  
  // Find surrounding rows
  let lower = lengths[0], upper = lengths[lengths.length - 1];
  for (let i = 0; i < lengths.length - 1; i++) {
    if (runLength >= lengths[i] && runLength <= lengths[i + 1]) {
      lower = lengths[i];
      upper = lengths[i + 1];
      break;
    }
  }
  
  // Linear interpolation
  const t = (runLength - lower) / (upper - lower);
  const cppLower = SCREEN_CPP_TABLE[lower][colorIdx];
  const cppUpper = SCREEN_CPP_TABLE[upper][colorIdx];
  return cppLower + t * (cppUpper - cppLower);
}