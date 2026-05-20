// ============================================================
// TRACE — generateReport.ts
// Orchestrates: score calculation → comparison → observation → save
// ============================================================

import { supabase } from '@/lib/supabase/client'
import { calculateScore } from '@/lib/scoring/calculateScore'
import { compareBatches } from '@/lib/scoring/compareBatches'
import { generateObservation } from '@/lib/scoring/generateObservation'
import type { ResourceLogEntry, BatchReport } from '@/lib/scoring/types'

export async function generateReport(batchUuid: string): Promise<BatchReport> {
  // ── 1. Fetch batch details ────────────────────────────────
  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .select('*')
    .eq('id', batchUuid)
    .single()

  if (batchError || !batch) {
    throw new Error(`Batch not found: ${batchError?.message}`)
  }

  // ── 2. Fetch all resource logs for this batch ─────────────
  const { data: logs, error: logsError } = await supabase
    .from('resource_logs')
    .select('*')
    .eq('batch_uuid', batchUuid)

  if (logsError) {
    throw new Error(`Failed to fetch logs: ${logsError.message}`)
  }

  const resourceLogs: ResourceLogEntry[] = (logs ?? []).map(l => ({
    resource_type:   l.resource_type,
    amount:          Number(l.amount),
    unit:            l.unit,
    source:          l.source,
    subtype:         l.subtype,
    disposal_method: l.disposal_method,
    solar_units:     l.solar_units ? Number(l.solar_units) : undefined,
  }))

  // ── 3. Calculate score ────────────────────────────────────
  const scoreResult = calculateScore({
    units_produced: batch.units_produced,
    logs: resourceLogs,
  })

  // ── 4. Find previous completed batch of same product type ─
  const { data: previousBatches } = await supabase
    .from('batches')
    .select('id, batch_id')
    .eq('product_type', batch.product_type)
    .eq('status', 'completed')
    .eq('is_demo', batch.is_demo)
    .neq('id', batchUuid)
    .order('updated_at', { ascending: false })
    .limit(1)

  let comparison = null
  if (previousBatches && previousBatches.length > 0) {
    const prevBatch = previousBatches[0]
    const { data: prevReport } = await supabase
      .from('batch_reports')
      .select('score, water_per_unit, electricity_per_unit, fuel_per_unit, waste_per_unit')
      .eq('batch_uuid', prevBatch.id)
      .single()

    if (prevReport) {
      comparison = compareBatches(scoreResult, {
        score:                  prevReport.score,
        water_per_unit:         Number(prevReport.water_per_unit),
        electricity_per_unit:   Number(prevReport.electricity_per_unit),
        fuel_per_unit:          Number(prevReport.fuel_per_unit),
        waste_per_unit:         Number(prevReport.waste_per_unit),
        batch_id:               prevBatch.batch_id,
      })
    }
  }

  // ── 5. Generate observation ───────────────────────────────
  const observation = generateObservation(scoreResult, comparison, batch.product_type)

  // ── 6. Build report object ────────────────────────────────
  const report: BatchReport = {
    score:                  scoreResult.score,
    water_total:            scoreResult.water_total,
    water_per_unit:         scoreResult.water_per_unit,
    electricity_total:      scoreResult.electricity_total,
    electricity_per_unit:   scoreResult.electricity_per_unit,
    fuel_total:             scoreResult.fuel_total,
    fuel_per_unit:          scoreResult.fuel_per_unit,
    waste_total:            scoreResult.waste_total,
    waste_per_unit:         scoreResult.waste_per_unit,
    deductions_json:        scoreResult.deductions,
    comparison_json:        comparison,
    observation,
  }

  return report
}
