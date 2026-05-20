'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { scoreColorClass, scoreLabel, productTypeLabel, formatDate } from '@/lib/utils/formatters'

interface Batch {
  id: string; batch_id: string; product_type: string
  units_produced: number; start_date: string; status: string
  sustainability_score: number | null; primary_material: string; created_at: string
}

function StatusBadge({ batch }: { batch: Batch }) {
  const hasNoScore = batch.status === 'active'
  if (hasNoScore) {
    return (
      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
        Active — Logging
      </span>
    )
  }
  return (
    <span className="text-[10px] bg-[#E8F2ED] text-[#2A6349] border border-[#C5DFD3] px-2 py-0.5 rounded-full font-semibold">
      Completed
    </span>
  )
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('batches')
      .select('*')
      .eq('is_demo', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBatches(data ?? [])
        setLoading(false)
      })
  }, [])

  const active    = batches.filter(b => b.status === 'active')
  const completed = batches.filter(b => b.status === 'completed')

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1C1C1A]">Production Batches</h1>
          <p className="text-[13px] text-[#6B6B67]">
            {batches.length > 0 ? `${active.length} active · ${completed.length} completed` : 'No batches yet'}
          </p>
        </div>
        <Link href="/batches/new" className="bg-[#2A6349] text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold active:opacity-80">
          + New Batch
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-[#E2E1DC] rounded-xl p-4 h-20" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && batches.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-[16px] font-bold text-[#1C1C1A] mb-1">No production batches yet</p>
          <p className="text-[13px] text-[#6B6B67] mb-6 leading-relaxed max-w-xs mx-auto">
            Create your first batch to start tracking water, electricity, fuel, and waste.
          </p>
          <Link href="/batches/new" className="inline-block bg-[#2A6349] text-white px-6 py-3.5 rounded-xl text-[14px] font-semibold">
            Start New Production Batch
          </Link>
          <div className="mt-6 pt-6 border-t border-[#E2E1DC]">
            <p className="text-[12px] text-[#6B6B67] mb-2">Want to see how it works first?</p>
            <Link href="/demo" className="text-[13px] font-medium text-[#2A6349]">Explore Demo Factory →</Link>
          </div>
        </div>
      )}

      {/* Active batches */}
      {!loading && active.length > 0 && (
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-[#6B6B67] uppercase tracking-widest mb-2.5">Active Batches</p>
          <div className="space-y-2">
            {active.map(batch => (
              <Link key={batch.id} href={`/batches/${batch.id}`}>
                <div className="bg-white border border-[#E2E1DC] rounded-xl p-4 active:bg-[#F7F6F3] border-l-4 border-l-amber-400">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-bold text-[15px] text-[#1C1C1A]">{batch.batch_id}</span>
                        <StatusBadge batch={batch} />
                      </div>
                      <p className="text-[13px] text-[#6B6B67]">
                        {productTypeLabel(batch.product_type)} · {batch.units_produced.toLocaleString('en-IN')} units
                      </p>
                      <p className="text-[11px] text-[#6B6B67] mt-0.5">{batch.primary_material} · Started {formatDate(batch.start_date)}</p>
                    </div>
                    <div className="ml-3 flex-shrink-0 text-[#6B6B67] mt-1">→</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Completed batches */}
      {!loading && completed.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-[#6B6B67] uppercase tracking-widest mb-2.5">Completed Batches</p>
          <div className="space-y-2">
            {completed.map(batch => (
              <Link key={batch.id} href={`/report/${batch.id}`}>
                <div className="bg-white border border-[#E2E1DC] rounded-xl p-4 active:bg-[#F7F6F3]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-bold text-[15px] text-[#1C1C1A]">{batch.batch_id}</span>
                        <StatusBadge batch={batch} />
                      </div>
                      <p className="text-[13px] text-[#6B6B67]">
                        {productTypeLabel(batch.product_type)} · {batch.units_produced.toLocaleString('en-IN')} units
                      </p>
                      <p className="text-[11px] text-[#6B6B67] mt-0.5">{batch.primary_material}</p>
                    </div>
                    {batch.sustainability_score !== null && (
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className={`text-[26px] font-bold leading-none ${scoreColorClass(batch.sustainability_score)}`}>
                          {batch.sustainability_score}
                        </p>
                        <p className="text-[9px] text-[#6B6B67] mt-0.5">/ 100</p>
                        <p className={`text-[10px] font-medium ${scoreColorClass(batch.sustainability_score)}`}>
                          {scoreLabel(batch.sustainability_score)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!loading && batches.length > 0 && (
        <p className="text-center text-[11px] text-[#6B6B67] mt-4 mb-2">
          Tap active batch to log resources · Tap completed to view Report Card
        </p>
      )}
    </div>
  )
}
