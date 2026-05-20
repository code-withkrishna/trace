// ============================================================
// TRACE Scoring Engine — compareBatches.ts
// Compare current batch metrics against previous batch of same type
// ============================================================

import type { ScoreResult, ComparisonResult } from './types'

/**
 * Calculate percentage change: positive = increased, negative = decreased.
 * Returns 0 if previous value is 0 to avoid division by zero.
 */
function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function compareBatches(
  current: ScoreResult,
  previousReport: {
    score: number
    water_per_unit: number
    electricity_per_unit: number
    fuel_per_unit: number
    waste_per_unit: number
    batch_id: string
  }
): ComparisonResult {
  return {
    water_per_unit_change_pct:       pctChange(current.water_per_unit,       previousReport.water_per_unit),
    electricity_per_unit_change_pct: pctChange(current.electricity_per_unit, previousReport.electricity_per_unit),
    fuel_per_unit_change_pct:        pctChange(current.fuel_per_unit,        previousReport.fuel_per_unit),
    waste_per_unit_change_pct:       pctChange(current.waste_per_unit,       previousReport.waste_per_unit),
    score_change:                    current.score - previousReport.score,
    previous_batch_id:               previousReport.batch_id,
    previous_score:                  previousReport.score,
  }
}
