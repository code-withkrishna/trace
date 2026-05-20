// ============================================================
// TRACE — Demo Seeder
// Called by /api/demo/reset to clear and re-seed demo data
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import { DEMO_BATCHES } from './demoData'
import { calculateScore } from '@/lib/scoring/calculateScore'
import { compareBatches } from '@/lib/scoring/compareBatches'
import { generateObservation } from '@/lib/scoring/generateObservation'

/** Accepts any `createClient()` instance (anon or service role) without generated DB types. */
export async function seedDemoData(client: SupabaseClient): Promise<void> {
  // ── 1. Delete existing demo data (cascade deletes logs + reports) ──
  const { error: deleteError } = await client
    .from('batches')
    .delete()
    .eq('is_demo', true)

  if (deleteError) {
    throw new Error(`Failed to delete demo data: ${deleteError.message}`)
  }

  // Track previous completed reports per product type for comparison
  const previousCompleted: Record<string, {
    score: number
    water_per_unit: number
    electricity_per_unit: number
    fuel_per_unit: number
    waste_per_unit: number
    batch_id: string
  }> = {}

  for (const demo of DEMO_BATCHES) {
    // ── 2. Insert batch ─────────────────────────────────────
    const { data: batch, error: batchError } = await client
      .from('batches')
      .insert({
        batch_id:         demo.batch_id,
        product_type:     demo.product_type,
        units_produced:   demo.units_produced,
        start_date:       demo.start_date,
        primary_material: demo.primary_material,
        status:           demo.status,
        sustainability_score: demo.score,
        is_demo:          true,
      })
      .select()
      .single()

    if (batchError || !batch) {
      throw new Error(`Failed to insert batch ${demo.batch_id}: ${batchError?.message}`)
    }

    const batchUuid = batch.id

    // ── 3. Build resource logs ──────────────────────────────
    const logs: Array<Record<string, unknown>> = []
    const today = demo.status === 'completed' ? demo.completed_date : demo.start_date

    // Water logs
    if (demo.water_municipal > 0) {
      logs.push({
        batch_uuid: batchUuid, resource_type: 'water',
        amount: demo.water_municipal, unit: 'litres',
        source: 'municipal', entry_date: demo.start_date,
        note: 'Municipal supply',
      })
    }
    if (demo.water_tanker > 0) {
      logs.push({
        batch_uuid: batchUuid, resource_type: 'water',
        amount: demo.water_tanker, unit: 'litres',
        source: 'tanker', cost_per_litre: 0.12,
        entry_date: demo.start_date, note: 'Tanker water supplemental',
      })
    }

    // Electricity logs
    if (demo.electricity_kwh > 0) {
      logs.push({
        batch_uuid: batchUuid, resource_type: 'electricity',
        amount: demo.electricity_kwh - (demo.solar_kwh ?? 0),
        unit: 'kWh', source: 'grid',
        solar_units: demo.solar_kwh > 0 ? demo.solar_kwh : null,
        entry_date: demo.start_date,
      })
    }

    // Fuel logs
    if (demo.fuel_type && demo.fuel_amount > 0) {
      logs.push({
        batch_uuid: batchUuid, resource_type: 'fuel',
        amount: demo.fuel_amount,
        unit: demo.fuel_type === 'diesel' ? 'litres' : 'kg',
        subtype: demo.fuel_type,
        entry_date: demo.start_date, note: 'Generator / thermal process',
      })
    }

    // Waste logs
    if (demo.waste_kg > 0) {
      logs.push({
        batch_uuid: batchUuid, resource_type: 'waste',
        amount: demo.waste_kg, unit: 'kg',
        subtype: demo.waste_type,
        disposal_method: demo.waste_disposal,
        entry_date: today || demo.start_date,
      })
    }

    if (logs.length > 0) {
      const { error: logsError } = await client.from('resource_logs').insert(logs)
      if (logsError) {
        throw new Error(`Failed to insert logs for ${demo.batch_id}: ${logsError.message}`)
      }
    }

    // ── 4. Generate + insert report for completed batches ───
    if (demo.status === 'completed' && demo.score !== null) {
      const resourceLogs = [
        ...( demo.water_municipal > 0 ? [{ resource_type: 'water' as const, amount: demo.water_municipal, source: 'municipal' }] : []),
        ...( demo.water_tanker > 0    ? [{ resource_type: 'water' as const, amount: demo.water_tanker, source: 'tanker' }] : []),
        ...( demo.electricity_kwh > 0 ? [{ resource_type: 'electricity' as const, amount: demo.electricity_kwh }] : []),
        ...( demo.fuel_type && demo.fuel_amount > 0 ? [{ resource_type: 'fuel' as const, amount: demo.fuel_amount, subtype: demo.fuel_type }] : []),
        ...( demo.waste_kg > 0 ? [{ resource_type: 'waste' as const, amount: demo.waste_kg, subtype: demo.waste_type, disposal_method: demo.waste_disposal }] : []),
      ]

      const scoreResult = calculateScore({
        units_produced: demo.units_produced,
        logs: resourceLogs,
      })

      const prev = previousCompleted[demo.product_type]
      let comparison = null
      if (prev) {
        comparison = compareBatches(scoreResult, prev)
      }

      const observation = generateObservation(scoreResult, comparison, demo.product_type)

      const { error: reportError } = await client.from('batch_reports').insert({
        batch_uuid:            batchUuid,
        score:                 scoreResult.score,
        water_total:           scoreResult.water_total,
        water_per_unit:        scoreResult.water_per_unit,
        electricity_total:     scoreResult.electricity_total,
        electricity_per_unit:  scoreResult.electricity_per_unit,
        fuel_total:            scoreResult.fuel_total,
        fuel_per_unit:         scoreResult.fuel_per_unit,
        waste_total:           scoreResult.waste_total,
        waste_per_unit:        scoreResult.waste_per_unit,
        deductions_json:       scoreResult.deductions,
        comparison_json:       comparison,
        observation,
        generated_at:          demo.completed_date
          ? new Date(demo.completed_date).toISOString()
          : new Date().toISOString(),
      })
      if (reportError) {
        throw new Error(`Failed to insert report for ${demo.batch_id}: ${reportError.message}`)
      }

      // Store for next batch comparison
      previousCompleted[demo.product_type] = {
        score:                scoreResult.score,
        water_per_unit:       scoreResult.water_per_unit,
        electricity_per_unit: scoreResult.electricity_per_unit,
        fuel_per_unit:        scoreResult.fuel_per_unit,
        waste_per_unit:       scoreResult.waste_per_unit,
        batch_id:             demo.batch_id,
      }
    }
  }
}
