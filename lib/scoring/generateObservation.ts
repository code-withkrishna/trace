// ============================================================
// TRACE Scoring Engine — generateObservation.ts
// Template-based observation logic — NO AI, NO external calls
// Generates exactly ONE plain-language operational insight
// ============================================================

import type { ScoreResult, ComparisonResult } from './types'

export function generateObservation(
  current: ScoreResult,
  comparison: ComparisonResult | null,
  productType: string
): string {
  const type = productType.replace('_', ' ')

  // ── No previous batch ────────────────────────────────────
  if (!comparison) {
    if (current.score >= 85) {
      return `Strong start for your first ${type} batch. Water, electricity, and waste are within efficient ranges. Continue logging to track trends over time.`
    }
    if (current.score >= 65) {
      return `First ${type} batch logged. Score is reasonable. Continue logging more batches to identify areas for improvement and track your progress.`
    }
    return `First ${type} batch logged. Score indicates room for improvement. Focus on reducing tanker water use and reviewing waste disposal methods in upcoming batches.`
  }

  // ── Find the most significant metric change ───────────────
  const changes = [
    { metric: 'water',       pct: comparison.water_per_unit_change_pct },
    { metric: 'electricity', pct: comparison.electricity_per_unit_change_pct },
    { metric: 'fuel',        pct: comparison.fuel_per_unit_change_pct },
    { metric: 'waste',       pct: comparison.waste_per_unit_change_pct },
  ]
  const biggest = changes.reduce((a, b) =>
    Math.abs(a.pct) >= Math.abs(b.pct) ? a : b
  )

  const absPct = Math.abs(biggest.pct)
  const direction = biggest.pct > 0 ? 'increased' : 'decreased'
  const rounded = Math.round(absPct)

  // Only call out a metric if change is meaningful (> 5%)
  if (absPct > 5) {
    if (biggest.metric === 'water') {
      if (biggest.pct > 0) {
        return `Water consumption per unit ${direction} ${rounded}% compared to your previous ${type} batch. Check if the washing or dyeing process changed.`
      } else {
        return `Water consumption per unit ${direction} ${rounded}% compared to your previous ${type} batch. Good improvement — keep monitoring for consistency.`
      }
    }

    if (biggest.metric === 'electricity') {
      if (biggest.pct > 0) {
        return `Electricity consumption per unit ${direction} ${rounded}% compared to your previous ${type} batch. Check if any additional machines were used or if idle time increased.`
      } else {
        return `Electricity consumption per unit ${direction} ${rounded}% compared to your previous ${type} batch. Efficient energy use — note what changed and replicate it.`
      }
    }

    if (biggest.metric === 'fuel') {
      if (biggest.pct > 0) {
        return `Fuel usage per unit ${direction} ${rounded}% compared to your previous ${type} batch. Reducing fuel use or switching to electric alternatives will improve your score.`
      } else {
        return `Fuel usage per unit ${direction} ${rounded}% compared to your previous ${type} batch. Lower fuel use is a positive change for the sustainability score.`
      }
    }

    if (biggest.metric === 'waste') {
      if (biggest.pct > 0) {
        return `Waste generated per unit ${direction} ${rounded}% compared to your previous ${type} batch. Review cutting or production processes for efficiency gains.`
      } else {
        return `Waste per unit ${direction} ${rounded}% compared to your previous ${type} batch. Less waste generated this batch — track what changed.`
      }
    }
  }

  // ── Score-level observation if no big metric change ───────
  if (comparison.score_change > 5) {
    return `This batch performed better than the previous ${type} batch with a score of ${current.score} vs ${comparison.previous_score}. Overall resource efficiency improved.`
  }
  if (comparison.score_change < -5) {
    return `This batch scored lower than the previous ${type} batch (${current.score} vs ${comparison.previous_score}). Review resource logs to identify what changed.`
  }

  return `This batch performed similarly to the previous ${type} batch. Score remained stable at ${current.score}. Continue monitoring resource usage per unit.`
}
