import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { generateReport } from '@/lib/reports/generateReport'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const batchUuid = params.id

  try {
    // ── 1. Verify batch exists and is active ────────────────
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('id, status')
      .eq('id', batchUuid)
      .single()

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found.' }, { status: 404 })
    }

    if (batch.status === 'completed') {
      // Already completed — redirect to existing report
      return NextResponse.json({ ok: true, already_completed: true })
    }

    // ── 2. Check at least one log entry exists ──────────────
    const { data: logs } = await supabase
      .from('resource_logs')
      .select('id')
      .eq('batch_uuid', batchUuid)
      .limit(1)

    if (!logs || logs.length === 0) {
      return NextResponse.json(
        { error: 'No resource entries found. Add at least one entry before completing.' },
        { status: 400 }
      )
    }

    // ── 3. Generate report (score + comparison + observation) ─
    const report = await generateReport(batchUuid)

    // ── 4. Save immutable report snapshot ───────────────────
    const { error: reportError } = await supabase
      .from('batch_reports')
      .insert({
        batch_uuid:           batchUuid,
        score:                report.score,
        water_total:          report.water_total,
        water_per_unit:       report.water_per_unit,
        electricity_total:    report.electricity_total,
        electricity_per_unit: report.electricity_per_unit,
        fuel_total:           report.fuel_total,
        fuel_per_unit:        report.fuel_per_unit,
        waste_total:          report.waste_total,
        waste_per_unit:       report.waste_per_unit,
        deductions_json:      report.deductions_json,
        comparison_json:      report.comparison_json,
        observation:          report.observation,
      })

    if (reportError) {
      return NextResponse.json(
        { error: 'Unable to save report. Check connection and try again.' },
        { status: 500 }
      )
    }

    // ── 5. Mark batch as completed ──────────────────────────
    const { error: updateError } = await supabase
      .from('batches')
      .update({
        status: 'completed',
        sustainability_score: report.score,
      })
      .eq('id', batchUuid)

    if (updateError) {
      return NextResponse.json(
        { error: 'Report saved but batch status update failed. Try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, score: report.score })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Unable to complete batch: ${message}` },
      { status: 500 }
    )
  }
}
