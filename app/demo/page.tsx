'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { DEMO_FACTORY_NAME, DEMO_FACTORY_LOCATION } from '@/lib/demo/demoData'
import { scoreColorClass, scoreLabel, productTypeLabel, formatDate } from '@/lib/utils/formatters'

interface DemoBatch {
  id: string; batch_id: string; product_type: string; units_produced: number
  status: string; sustainability_score: number | null; primary_material: string; start_date: string
}

export default function DemoPage() {
  const [batches, setBatches] = useState<DemoBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok')

  useEffect(() => { fetchDemoBatches() }, [])

  async function fetchDemoBatches() {
    const { data } = await supabase
      .from('batches')
      .select('id, batch_id, product_type, units_produced, status, sustainability_score, primary_material, start_date')
      .eq('is_demo', true)
      .order('start_date', { ascending: false })
    setBatches(data ?? [])
    setLoading(false)
  }

  async function doReset(confirmed: boolean) {
    if (confirmed && !confirm('This will clear and re-seed all demo batches. Continue?')) return
    const action = confirmed ? setResetting : setSeeding
    action(true); setMessage('')
    const resp = await fetch('/api/demo/reset', { method: 'POST' })
    if (resp.ok) {
      setMessage('Demo factory loaded successfully.')
      setMsgType('ok')
      await fetchDemoBatches()
    } else {
      setMessage('Failed to load demo data. Check connection and try again.')
      setMsgType('err')
    }
    action(false)
  }

  const completed = batches.filter(b => b.status === 'completed')
  const active    = batches.filter(b => b.status === 'active')
  const avgScore  = completed.length ? Math.round(completed.reduce((s, b) => s + (b.sustainability_score ?? 0), 0) / completed.length) : null

  return (
    <div className="px-4 pt-6">
      {/* Factory header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl font-bold text-[#1C1C1A]">{DEMO_FACTORY_NAME}</h1>
            <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold tracking-wide">DEMO FACTORY</span>
          </div>
          <p className="text-[13px] text-[#6B6B67]">{DEMO_FACTORY_LOCATION}</p>
          {batches.length > 0 && (
            <p className="text-[12px] text-[#6B6B67] mt-0.5">
              {completed.length} completed · {active.length} active
              {avgScore !== null && <span> · Avg score <strong className="text-[#1C1C1A]">{avgScore}</strong></span>}
            </p>
          )}
        </div>
        {batches.length > 0 && (
          <button onClick={() => doReset(true)} disabled={resetting}
            className="text-[12px] text-[#6B6B67] border border-[#E2E1DC] px-3 py-2 rounded-lg bg-white active:opacity-70 disabled:opacity-50 flex-shrink-0">
            {resetting ? 'Resetting…' : '↺ Reset'}
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-xl px-4 py-3 mb-4 border ${msgType === 'ok' ? 'bg-[#E8F2ED] border-[#C5DFD3] text-[#2A6349]' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <p className="text-[13px] font-medium">{message}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-[#E2E1DC] rounded-xl" />)}
        </div>
      )}

      {/* Empty / seed state */}
      {!loading && batches.length === 0 && (
        <div className="text-center py-14">
          <p className="text-5xl mb-4">🏭</p>
          <p className="text-[17px] font-bold text-[#1C1C1A] mb-2">Demo factory not loaded</p>
          <p className="text-[13px] text-[#6B6B67] mb-2 leading-relaxed max-w-xs mx-auto">
            Load 6 months of realistic production data from Shakti Textiles — a garment manufacturer in Tiruppur.
          </p>
          <p className="text-[12px] text-[#6B6B67] mb-7 max-w-xs mx-auto">
            Includes 25 batches with improving sustainability scores over time — from heavy tanker usage in January to composted waste and solar energy by June.
          </p>
          <button onClick={() => doReset(false)} disabled={seeding}
            className="bg-[#2A6349] text-white px-8 py-4 rounded-xl text-[15px] font-semibold disabled:opacity-60 active:opacity-80">
            {seeding ? 'Loading Demo Data…' : 'Load Demo Factory'}
          </button>
          <p className="text-[11px] text-[#6B6B67] mt-4">Takes about 10–15 seconds</p>
        </div>
      )}

      {/* Demo batch list */}
      {!loading && batches.length > 0 && (
        <>
          {/* Info banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
            <p className="text-[12px] text-amber-800 leading-relaxed">
              <strong>Demo mode</strong> — Tap any completed batch to see its Report Card and PDF export. Create your own batches under the Batches tab.
            </p>
          </div>

          {/* Active batches */}
          {active.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-[#6B6B67] uppercase tracking-widest mb-2.5">Active (in progress)</p>
              <div className="space-y-2">
                {active.map(batch => (
                  <Link key={batch.id} href={`/batches/${batch.id}`}>
                    <div className="bg-white border border-[#E2E1DC] rounded-xl px-4 py-3 active:bg-[#F7F6F3] border-l-4 border-l-amber-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono font-bold text-[14px] text-[#1C1C1A]">{batch.batch_id}</span>
                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-semibold">Active</span>
                          </div>
                          <p className="text-[12px] text-[#6B6B67]">{productTypeLabel(batch.product_type)} · {batch.units_produced.toLocaleString('en-IN')} units · {batch.primary_material}</p>
                          <p className="text-[11px] text-[#6B6B67]">Started {formatDate(batch.start_date)}</p>
                        </div>
                        <span className="text-[#6B6B67] ml-2">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Completed batches */}
          <div>
            <p className="text-[11px] font-semibold text-[#6B6B67] uppercase tracking-widest mb-2.5">Completed — Tap to view Report Card</p>
            <div className="space-y-2">
              {completed.map(batch => (
                <Link key={batch.id} href={`/report/${batch.id}`}>
                  <div className="bg-white border border-[#E2E1DC] rounded-xl px-4 py-3.5 active:bg-[#F7F6F3]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-mono font-bold text-[14px] text-[#1C1C1A]">{batch.batch_id}</span>
                          <span className="text-[10px] bg-[#E8F2ED] text-[#2A6349] border border-[#C5DFD3] px-1.5 py-0.5 rounded-full font-semibold">Completed</span>
                        </div>
                        <p className="text-[12px] text-[#6B6B67] truncate">{productTypeLabel(batch.product_type)} · {batch.units_produced.toLocaleString('en-IN')} units · {batch.primary_material}</p>
                      </div>
                      {batch.sustainability_score !== null && (
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className={`text-[24px] font-bold leading-none tabular-nums ${scoreColorClass(batch.sustainability_score)}`}>{batch.sustainability_score}</p>
                          <p className="text-[9px] text-[#6B6B67]">/ 100</p>
                        </div>
                      )}
                    </div>
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
