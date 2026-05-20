'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { supabase } from '@/lib/supabase/client'
import { scoreColorClass, scoreLabel, productTypeLabel } from '@/lib/utils/formatters'

interface CompletedBatch {
  id: string; batch_id: string; product_type: string
  units_produced: number; sustainability_score: number; updated_at: string; is_demo: boolean
}

interface ChartPoint { date: string; score: number; batch_id: string; full_date: string }

function ScoreDot({ color }: { color: string }) {
  return <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
}

export default function TrendsPage() {
  const [batches, setBatches]   = useState<CompletedBatch[]>([])
  const [chartData, setChart]   = useState<ChartPoint[]>([])
  const [loading, setLoading]   = useState(true)
  const [showDemo, setShowDemo] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('batches')
      .select('id, batch_id, product_type, units_produced, sustainability_score, updated_at, is_demo')
      .eq('status', 'completed')
      .eq('is_demo', showDemo)
      .order('updated_at', { ascending: true })

    const all = (data ?? []).filter(b => b.sustainability_score !== null)
    setBatches(all)
    setChart(all.map(b => ({
      date: new Date(b.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      full_date: new Date(b.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      score: b.sustainability_score,
      batch_id: b.batch_id,
    })))
    setLoading(false)
  }, [showDemo])

  useEffect(() => { void fetchData() }, [fetchData])

  const sorted = [...batches].sort((a, b) => b.sustainability_score - a.sustainability_score)
  const top3   = sorted.slice(0, 3)
  const bot3   = sorted.length > 3 ? sorted.slice(-3).reverse() : []
  const avg    = batches.length ? Math.round(batches.reduce((s, b) => s + b.sustainability_score, 0) / batches.length) : 0
  const best   = batches.length ? Math.max(...batches.map(b => b.sustainability_score)) : 0
  const trend  = batches.length >= 2 ? batches[batches.length - 1].sustainability_score - batches[0].sustainability_score : null

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartPoint; value: number }> }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white border border-[#E2E1DC] rounded-xl px-3 py-2.5 shadow-md">
        <p className="font-mono text-[11px] text-[#6B6B67]">{d.batch_id}</p>
        <p className="text-[16px] font-bold text-[#1C1C1A]">{d.score} <span className="text-[12px] font-normal text-[#6B6B67]">/ 100</span></p>
        <p className="text-[10px] text-[#6B6B67]">{d.full_date}</p>
      </div>
    )
  }

  function scoreToColor(s: number) {
    if (s >= 80) return '#2A6349'
    if (s >= 60) return '#D4821A'
    return '#C0392B'
  }

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1C1C1A]">Trend Dashboard</h1>
          <p className="text-[13px] text-[#6B6B67]">Sustainability score over time</p>
        </div>
        {/* Demo toggle */}
        <button onClick={() => setShowDemo(d => !d)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors ${showDemo ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-[#E2E1DC] text-[#6B6B67]'}`}>
          {showDemo ? '● Demo' : '○ Demo'}
        </button>
      </div>

      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-16 bg-[#E2E1DC] rounded-xl" />
          <div className="h-52 bg-[#E2E1DC] rounded-xl" />
          <div className="h-32 bg-[#E2E1DC] rounded-xl" />
        </div>
      )}

      {!loading && batches.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📈</p>
          <p className="text-[15px] font-medium text-[#1C1C1A] mb-1">No completed batches yet</p>
          <p className="text-[13px] text-[#6B6B67] mb-6">
            {showDemo ? 'Toggle Demo off to see your own data.' : 'Complete a production batch to start tracking your score trend.'}
          </p>
          {!showDemo && (
            <Link href="/batches/new" className="inline-block bg-[#2A6349] text-white px-6 py-3 rounded-xl text-[14px] font-semibold">
              Start New Batch
            </Link>
          )}
        </div>
      )}

      {!loading && batches.length > 0 && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: 'Batches Completed', val: batches.length.toString(), sub: null },
              { label: 'Average Score', val: avg.toString(), sub: scoreLabel(avg) },
              { label: trend !== null ? (trend >= 0 ? 'Trend ↑' : 'Trend ↓') : 'Best Score', val: trend !== null ? `${Math.abs(trend)} pts` : best.toString(), sub: trend !== null ? (trend >= 0 ? 'improving' : 'declining') : '/ 100', good: trend !== null ? trend >= 0 : true },
            ].map(item => (
              <div key={item.label} className="bg-white border border-[#E2E1DC] rounded-xl p-3 text-center">
                <p className="text-[9px] text-[#6B6B67] uppercase tracking-wide mb-1 leading-tight">{item.label}</p>
                <p className={`text-[22px] font-bold ${item.good === false ? 'text-red-600' : item.good === true ? 'text-[#2A6349]' : 'text-[#1C1C1A]'}`}>{item.val}</p>
                {item.sub && <p className="text-[10px] text-[#6B6B67]">{item.sub}</p>}
              </div>
            ))}
          </div>

          {/* Score trend line chart */}
          <div className="bg-white border border-[#E2E1DC] rounded-xl p-4 mb-5">
            <p className="text-[11px] font-semibold text-[#6B6B67] uppercase tracking-widest mb-4">Score Over Time</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E1DC" vertical={false} />
                  <ReferenceLine y={80} stroke="#2A6349" strokeDasharray="4 4" strokeOpacity={0.4} />
                  <ReferenceLine y={60} stroke="#D4821A" strokeDasharray="4 4" strokeOpacity={0.4} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B6B67' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 60, 75, 80, 100]} tick={{ fontSize: 10, fill: '#6B6B67' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" stroke="#2A6349" strokeWidth={2.5}
                    dot={(props) => {
                      const { cx, cy, payload } = props
                      return <circle key={payload.batch_id} cx={cx} cy={cy} r={4} fill={scoreToColor(payload.score)} stroke="white" strokeWidth={2} />
                    }}
                    activeDot={{ r: 6, fill: '#2A6349', stroke: 'white', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E2E1DC]">
              <div className="flex items-center gap-1.5"><ScoreDot color="#2A6349" /><span className="text-[10px] text-[#6B6B67]">≥ 80 (Good)</span></div>
              <div className="flex items-center gap-1.5"><ScoreDot color="#D4821A" /><span className="text-[10px] text-[#6B6B67]">60–79 (Moderate)</span></div>
              <div className="flex items-center gap-1.5"><ScoreDot color="#C0392B" /><span className="text-[10px] text-[#6B6B67]">{'< 60 (Low)'}</span></div>
            </div>
          </div>

          {/* Top performing */}
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-[#6B6B67] uppercase tracking-widest mb-3">Top Performing Batches</p>
            <div className="bg-white border border-[#E2E1DC] rounded-xl overflow-hidden divide-y divide-[#F0EFEB]">
              {top3.map((b, i) => (
                <Link key={b.id} href={`/report/${b.id}`}>
                  <div className="flex items-center px-4 py-3.5 active:bg-[#F7F6F3] gap-3">
                    <span className="text-[13px] font-bold text-[#6B6B67] w-5 text-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-bold text-[14px] text-[#1C1C1A]">{b.batch_id}</p>
                      <p className="text-[11px] text-[#6B6B67]">{productTypeLabel(b.product_type)} · {b.units_produced.toLocaleString('en-IN')} units</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ScoreDot color={scoreToColor(b.sustainability_score)} />
                      <span className={`text-[18px] font-bold tabular-nums ${scoreColorClass(b.sustainability_score)}`}>{b.sustainability_score}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Needs attention */}
          {bot3.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-semibold text-[#6B6B67] uppercase tracking-widest mb-3">Needs Attention</p>
              <div className="bg-white border border-[#E2E1DC] rounded-xl overflow-hidden divide-y divide-[#F0EFEB]">
                {bot3.map(b => (
                  <Link key={b.id} href={`/report/${b.id}`}>
                    <div className="flex items-center px-4 py-3.5 active:bg-[#F7F6F3] gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-bold text-[14px] text-[#1C1C1A]">{b.batch_id}</p>
                        <p className="text-[11px] text-[#6B6B67]">{productTypeLabel(b.product_type)} · {b.units_produced.toLocaleString('en-IN')} units</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ScoreDot color={scoreToColor(b.sustainability_score)} />
                        <span className={`text-[18px] font-bold tabular-nums ${scoreColorClass(b.sustainability_score)}`}>{b.sustainability_score}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <p className="text-[11px] text-[#6B6B67] mt-2 px-1">Review the report cards for these batches to see what drove the lower scores.</p>
            </div>
          )}

          {/* Recent activity timeline */}
          <div className="mb-6">
            <p className="text-[11px] font-semibold text-[#6B6B67] uppercase tracking-widest mb-3">Recent Activity</p>
            <div className="space-y-2">
              {[...batches].reverse().slice(0, 6).map(b => (
                <Link key={b.id} href={`/report/${b.id}`}>
                  <div className="bg-white border border-[#E2E1DC] rounded-xl flex items-center px-4 py-3 gap-3 active:bg-[#F7F6F3]">
                    <ScoreDot color={scoreToColor(b.sustainability_score)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[13px] font-bold text-[#1C1C1A]">{b.batch_id}</p>
                      <p className="text-[11px] text-[#6B6B67]">
                        {productTypeLabel(b.product_type)} · {new Date(b.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-[16px] font-bold tabular-nums ${scoreColorClass(b.sustainability_score)}`}>{b.sustainability_score}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
