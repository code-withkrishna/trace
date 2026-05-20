// ============================================================
// TRACE Scoring Engine — calculateScore.ts
//
// Formula (exact, no deviations):
//   Start at 100
//   - Water per unit > 50L: deduct 1 per 10L above threshold, max 20
//   - Electricity per unit > 2 kWh: deduct 1 per 0.5 kWh above, max 20
//   - Any fuel used: deduct 10
//   - Waste disposal landfill/unknown: deduct 15; recycler: 5; composted/none: 0
//   - Any tanker water: deduct 10
//   Clamp final score to 0–100
// ============================================================

import type { ScoreInput, ScoreResult, DeductionBreakdown } from './types'

export function calculateScore(input: ScoreInput): ScoreResult {
  const { units_produced, logs } = input

  if (units_produced <= 0) {
    throw new Error('units_produced must be greater than 0')
  }

  // ── Partition logs by resource type ──────────────────────
  const waterLogs       = logs.filter(l => l.resource_type === 'water')
  const electricityLogs = logs.filter(l => l.resource_type === 'electricity')
  const fuelLogs        = logs.filter(l => l.resource_type === 'fuel')
  const wasteLogs       = logs.filter(l => l.resource_type === 'waste')

  // ── Aggregate totals (full precision) ────────────────────
  const water_total       = waterLogs.reduce((sum, l) => sum + l.amount, 0)
  const electricity_total = electricityLogs.reduce((sum, l) => sum + l.amount, 0)
  const fuel_total        = fuelLogs.reduce((sum, l) => sum + l.amount, 0)
  const waste_total       = wasteLogs.reduce((sum, l) => sum + l.amount, 0)

  // ── Per-unit metrics (full precision internally) ──────────
  const water_per_unit       = water_total / units_produced
  const electricity_per_unit = electricity_total / units_produced
  const fuel_per_unit        = fuel_total / units_produced
  const waste_per_unit       = waste_total / units_produced

  // ── WATER DEDUCTION ───────────────────────────────────────
  // 1 point per 10L above 50L/unit, max 20
  let water_deduction = 0
  if (water_per_unit > 50) {
    const excess = water_per_unit - 50
    water_deduction = Math.min(Math.floor(excess / 10), 20)
  }

  // ── ELECTRICITY DEDUCTION ─────────────────────────────────
  // 1 point per 0.5 kWh above 2 kWh/unit, max 20
  let electricity_deduction = 0
  if (electricity_per_unit > 2) {
    const excess = electricity_per_unit - 2
    electricity_deduction = Math.min(Math.floor(excess / 0.5), 20)
  }

  // ── FUEL DEDUCTION ────────────────────────────────────────
  // Flat 10 if ANY fuel logged with amount > 0
  const fuel_deduction = (fuelLogs.length > 0 && fuel_total > 0) ? 10 : 0

  // ── WASTE DEDUCTION ───────────────────────────────────────
  // Priority: landfill/unknown → 15, recycler → 5, composted/zero → 0
  let waste_deduction = 0
  if (wasteLogs.length > 0) {
    const methods = wasteLogs.map(l =>
      (l.disposal_method ?? 'unknown').toLowerCase().trim()
    )
    if (methods.some(m => m === 'landfill' || m === 'unknown')) {
      waste_deduction = 15
    } else if (methods.some(m => m === 'recycler')) {
      waste_deduction = 5
    } else {
      // composted or any unrecognised method treated as 0
      waste_deduction = 0
    }
  }

  // ── TANKER DEDUCTION ──────────────────────────────────────
  // 10 if ANY water entry has source === 'tanker'
  const tanker_deduction = waterLogs.some(
    l => (l.source ?? '').toLowerCase().trim() === 'tanker'
  ) ? 10 : 0

  // ── FINAL SCORE ───────────────────────────────────────────
  const raw =
    100 -
    water_deduction -
    electricity_deduction -
    fuel_deduction -
    waste_deduction -
    tanker_deduction

  const score = Math.max(0, Math.min(100, raw))

  const deductions: DeductionBreakdown = {
    water_deduction,
    electricity_deduction,
    fuel_deduction,
    waste_deduction,
    tanker_deduction,
  }

  return {
    score,
    deductions,
    water_total,
    water_per_unit,
    electricity_total,
    electricity_per_unit,
    fuel_total,
    fuel_per_unit,
    waste_total,
    waste_per_unit,
  }
}
