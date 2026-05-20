'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import {
  round1, round2, formatLitres, formatKwh, formatKg,
  formatDate, formatReportDate, scoreColorClass, scoreLabel, productTypeLabel
} from '@/lib/utils/formatters'
import type { DeductionBreakdown, ComparisonResult } from '@/lib/scoring/types'

interface Batch {
  id: string; batch_id: string; product_type: string
  units_produced: number; start_date: string; primary_material: string
  status: string; is_demo: boolean
}

interface Report {
  score: number
  water_total: number; water_per_unit: number
  electricity_total: number; electricity_per_unit: number
  fuel_total: number; fuel_per_unit: number
  waste_total: number; waste_per_unit: number
  deductions_json: DeductionBreakdown
  comparison_json: ComparisonResult | null
  observation: string
  generated_at: string
}

export default function ReportPage() {
  const router = useRouter()
  const params = useParams()
  const batchId = params.id as string
  const [batch, setBatch] = useState<Batch | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = useCallback(async () => {
    const [{ data: b }, { data: r }] = await Promise.all([
      supabase.from('batches').select('*').eq('id', batchId).single(),
      supabase.from('batch_reports').select('*').eq('batch_uuid', batchId)
        .order('generated_at', { ascending: false }).limit(1).single(),
    ])
    if (!b || !r) { router.push('/batches'); return }
    setBatch(b); setReport(r); setLoading(false)
  }, [batchId, router])

  useEffect(() => { fetchReport() }, [fetchReport])

  if (loading) return (
    <div className="px-4 pt-6 animate-pulse space-y-4">
      <div className="h-6 bg-[#E2E1DC] rounded w-40" />
      <div className="h-40 bg-[#E2E1DC] rounded" />
      <div className="h-56 bg-[#E2E1DC] rounded" />
    </div>
  )
  if (!batch || !report) return null

  const d = report.deductions_json
  const c = report.comparison_json
  const totalDed = d.water_deduction + d.electricity_deduction + d.fuel_deduction + d.waste_deduction + d.tanker_deduction
  const genDate = report.generated_at ? formatDate(report.generated_at) : formatReportDate()

  return (
    <>
      {/* Screen toolbar */}
      <div className="no-print px-4 pt-5 pb-3 flex items-center justify-between border-b border-[#E2E1DC] bg-[#F7F6F3] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E1DC] bg-white text-[#1C1C1A] text-lg active:opacity-70">←</button>
          <div>
            <p className="font-bold text-[15px] text-[#1C1C1A] leading-tight">Report Card</p>
            <p className="text-[11px] text-[#6B6B67] font-mono">{batch.batch_id}</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#2A6349] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold active:opacity-80">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print / Save PDF
        </button>
      </div>

      {/* REPORT DOCUMENT */}
      <div className="print-report px-4 pt-6 pb-12 max-w-2xl mx-auto">

        {/* SECTION 1: HEADER */}
        <div className="print-section mb-5 pb-5 border-b-2 border-[#1C1C1A]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2 no-print">
                <div className="w-7 h-7 rounded bg-[#2A6349] flex items-center justify-center"><span className="text-white text-xs font-bold">T</span></div>
                <span className="text-[22px] font-bold tracking-tight text-[#1C1C1A]">Trace</span>
              </div>
              {/* Print-only wordmark */}
              <p className="hidden print:block text-[18px] font-bold text-[#1C1C1A] mb-1">Trace</p>
              <p className="text-[12px] font-semibold text-[#6B6B67] uppercase tracking-widest">Batch Sustainability Report</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-[22px] text-[#1C1C1A]">{batch.batch_id}</p>
              <p className="text-[12px] text-[#6B6B67] mt-0.5">{productTypeLabel(batch.product_type)}</p>
              <p className="text-[11px] text-[#6B6B67]">Completed {genDate}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-0 border border-[#E2E1DC] rounded-lg overflow-hidden bg-white">
            {([['Total Units', batch.units_produced.toLocaleString('en-IN')], ['Raw Material', batch.primary_material], ['Start Date', formatDate(batch.start_date)]] as [string,string][]).map(([label, value], i) => (
              <div key={label} className={`px-4 py-3 ${i < 2 ? 'border-r border-[#E2E1DC]' : ''}`}>
                <p className="text-[10px] text-[#6B6B67] uppercase tracking-wide font-medium">{label}</p>
                <p className="text-[13px] font-semibold text-[#1C1C1A] mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: SCORE + DEDUCTIONS */}
        <div className="print-section mb-6">
          <div className="bg-white border border-[#E2E1DC] rounded-xl overflow-hidden">
            {/* Score hero */}
            <div className="px-6 pt-7 pb-5 text-center border-b border-[#E2E1DC] bg-[#FAFAF8]">
              <p className="text-[10px] font-semibold text-[#6B6B67] uppercase tracking-widest mb-4">Sustainability Score</p>
              <div className="flex items-end justify-center gap-2 mb-1">
                <span className={`font-bold leading-none ${scoreColorClass(report.score)}`} style={{ fontSize: '72px' }}>{report.score}</span>
                <span className="text-[28px] font-light text-[#6B6B67] mb-2">/ 100</span>
              </div>
              <p className={`text-[13px] font-semibold mt-1 ${scoreColorClass(report.score)}`}>{scoreLabel(report.score)}</p>
            </div>

            {/* Deduction table */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold text-[#6B6B67] uppercase tracking-widest mb-3">Deduction Breakdown</p>
              <div className="divide-y divide-[#F0EFEB]">
                <div className="flex justify-between py-2.5"><span className="text-[13px] font-medium text-[#1C1C1A]">Starting score</span><span className="text-[13px] font-bold text-[#1C1C1A]">100</span></div>
                {[
                  { label: 'Water usage', sub: d.water_deduction > 0 ? `${round1(report.water_per_unit)} L/unit · ${round1(Math.max(0, report.water_per_unit - 50))} L above 50 L threshold` : null, val: d.water_deduction },
                  { label: 'Tanker water', sub: d.tanker_deduction === 0 ? 'not used' : null, val: d.tanker_deduction },
                  { label: 'Electricity usage', sub: d.electricity_deduction > 0 ? `${round2(report.electricity_per_unit)} kWh/unit` : null, val: d.electricity_deduction },
                  { label: 'Fuel used', sub: d.fuel_deduction === 0 ? 'none this batch' : null, val: d.fuel_deduction },
                  { label: 'Waste disposal', sub: d.waste_deduction === 15 ? 'landfill / unknown' : d.waste_deduction === 5 ? 'recycler' : report.waste_total > 0 ? 'composted' : 'none logged', val: d.waste_deduction },
                ].map(({ label, sub, val }) => (
                  <div key={label} className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="text-[13px] text-[#6B6B67]">{label}</span>
                      {sub && <span className="text-[11px] text-[#6B6B67] ml-2">({sub})</span>}
                    </div>
                    <span className={`text-[13px] font-semibold tabular-nums ${val > 0 ? 'text-red-600' : 'text-[#2A6349]'}`}>{val > 0 ? `−${val}` : '0'}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2.5 border-t border-[#E2E1DC] mt-1">
                  <span className="text-[13px] font-medium text-[#1C1C1A]">Total deductions</span>
                  <span className="text-[13px] font-bold text-red-600 tabular-nums">−{totalDed}</span>
                </div>
                <div className="flex justify-between pt-3 pb-1">
                  <span className="text-[15px] font-bold text-[#1C1C1A]">Final Score</span>
                  <span className={`text-[18px] font-bold tabular-nums ${scoreColorClass(report.score)}`}>{report.score} / 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: RESOURCE SUMMARY */}
        <div className="print-section mb-6">
          <h2 className="text-[10px] font-semibold text-[#6B6B67] uppercase tracking-widest mb-3">Resource Summary</h2>
          <div className="bg-white border border-[#E2E1DC] rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 bg-[#F7F6F3] border-b border-[#E2E1DC]">
              {['Resource', 'Total', 'Per Unit'].map((h, i) => (
                <div key={h} className={`px-4 py-2.5 text-[10px] font-semibold text-[#6B6B67] uppercase tracking-wide ${i > 0 ? 'text-right' : ''}`}>{h}</div>
              ))}
            </div>
            {[
              { icon: '💧', label: 'Water',       total: report.water_total > 0 ? formatLitres(report.water_total) : '—',            perUnit: report.water_total > 0 ? `${round1(report.water_per_unit)} L` : '—',           flagged: d.water_deduction > 0 || d.tanker_deduction > 0 },
              { icon: '⚡', label: 'Electricity',  total: report.electricity_total > 0 ? formatKwh(report.electricity_total) : '—',   perUnit: report.electricity_total > 0 ? `${round2(report.electricity_per_unit)} kWh` : '—', flagged: d.electricity_deduction > 0 },
              { icon: '🔥', label: 'Fuel',         total: report.fuel_total > 0 ? formatLitres(report.fuel_total) : 'None used',      perUnit: report.fuel_total > 0 ? `${round2(report.fuel_per_unit)} /unit` : '—',           flagged: d.fuel_deduction > 0 },
              { icon: '♻️', label: 'Waste',        total: report.waste_total > 0 ? formatKg(report.waste_total) : '—',               perUnit: report.waste_total > 0 ? `${round2(report.waste_per_unit)} kg` : '—',             flagged: d.waste_deduction > 0 },
            ].map((row, idx) => (
              <div key={row.label} className={`grid grid-cols-3 items-center ${idx < 3 ? 'border-b border-[#E2E1DC]' : ''}`}>
                <div className="px-4 py-3.5 flex items-center gap-2">
                  <span className="text-base">{row.icon}</span>
                  <span className="text-[13px] font-medium text-[#1C1C1A]">{row.label}</span>
                  {row.flagged && <span className="text-[9px] bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded font-semibold uppercase">−pts</span>}
                </div>
                <div className="px-4 py-3.5 text-right text-[13px] text-[#1C1C1A]">{row.total}</div>
                <div className="px-4 py-3.5 text-right text-[13px] font-semibold text-[#1C1C1A]">{row.perUnit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: COMPARISON */}
        <div className="print-section mb-6">
          <h2 className="text-[10px] font-semibold text-[#6B6B67] uppercase tracking-widest mb-3">
            Compared to Previous {productTypeLabel(batch.product_type)} Batch
          </h2>
          {!c ? (
            <div className="bg-white border border-[#E2E1DC] rounded-xl px-5 py-4">
              <p className="text-[13px] text-[#6B6B67]">No previous batch of this product type to compare against. Complete more batches to enable comparison.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E2E1DC] rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-[#F7F6F3] border-b border-[#E2E1DC]">
                <p className="text-[12px] text-[#6B6B67]">vs. batch <span className="font-mono font-bold text-[#1C1C1A]">{c.previous_batch_id}</span><span className="ml-2">(scored {c.previous_score} / 100)</span></p>
              </div>
              <div className="divide-y divide-[#F0EFEB]">
                {[
                  { label: 'Water per unit',       pct: c.water_per_unit_change_pct,       better: c.water_per_unit_change_pct < 0 },
                  { label: 'Electricity per unit',  pct: c.electricity_per_unit_change_pct, better: c.electricity_per_unit_change_pct < 0 },
                  { label: 'Fuel per unit',         pct: c.fuel_per_unit_change_pct,        better: c.fuel_per_unit_change_pct <= 0 },
                  { label: 'Waste per unit',        pct: c.waste_per_unit_change_pct,       better: c.waste_per_unit_change_pct < 0 },
                  { label: 'Overall score',         pct: c.score_change,                   better: c.score_change > 0, isScore: true },
                ].map(({ label, pct, better, isScore }) => {
                  const abs = Math.abs(Math.round(pct))
                  const flat = Math.round(pct) === 0
                  return (
                    <div key={label} className="flex items-center justify-between px-5 py-3">
                      <span className="text-[13px] text-[#6B6B67]">{label}</span>
                      {flat ? (
                        <span className="text-[13px] text-[#6B6B67]">No change</span>
                      ) : (
                        <span className={`text-[13px] font-semibold ${better ? 'text-[#2A6349]' : 'text-red-600'}`}>
                          {pct > 0 ? '↑' : '↓'} {abs}{isScore ? ' pts' : '%'} <span className="font-normal text-[11px]">{better ? '(better)' : '(worse)'}</span>
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: OBSERVATION */}
        <div className="print-section print-observation mb-6">
          <h2 className="text-[10px] font-semibold text-[#6B6B67] uppercase tracking-widest mb-3">Operational Observation</h2>
          <div className="bg-[#F7F6F3] border border-[#E2E1DC] rounded-xl px-5 py-4 flex gap-3">
            <span className="text-[18px] mt-0.5 flex-shrink-0">📋</span>
            <p className="text-[14px] text-[#1C1C1A] leading-relaxed">{report.observation}</p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="print-footer print-section border-t border-[#E2E1DC] pt-4 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#1C1C1A]">Trace — Batch Sustainability Report</p>
              <p className="text-[10px] text-[#6B6B67]">Operational Sustainability Tracking for Indian SMEs</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#6B6B67]">{genDate}</p>
              <p className="font-mono text-[10px] text-[#6B6B67]">{batch.batch_id}</p>
            </div>
          </div>
        </div>

        {/* Screen buttons */}
        <div className="no-print mt-8 flex gap-3">
          <Link href={`/batches/${batch.id}`} className="flex-1 text-center border border-[#E2E1DC] bg-white text-[#1C1C1A] py-4 rounded-xl text-[14px] font-medium active:opacity-70">← Back to Batch</Link>
          <button onClick={() => window.print()} className="flex-1 bg-[#2A6349] text-white py-4 rounded-xl text-[14px] font-semibold active:opacity-80">⎙ Print / Save PDF</button>
        </div>
      </div>
    </>
  )
}
