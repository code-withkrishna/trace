'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const PRODUCT_TYPES = [
  { value: 'garment',       label: 'Garment' },
  { value: 'leather_goods', label: 'Leather Goods' },
  { value: 'food',          label: 'Food Processing' },
  { value: 'ceramic',       label: 'Ceramic' },
  { value: 'paper',         label: 'Paper' },
  { value: 'other',         label: 'Other' },
]

export default function NewBatchPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    batch_id:         '',
    product_type:     '',
    units_produced:   '',
    start_date:       new Date().toISOString().split('T')[0],
    primary_material: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  async function handleSubmit() {
    if (!form.batch_id.trim())         return setError('Batch ID is required. Use your operational code, e.g. GT-2407.')
    if (!form.product_type)            return setError('Select a product type.')
    if (!form.units_produced || Number(form.units_produced) <= 0) return setError('Enter the total units produced in this batch.')
    if (!form.start_date)              return setError('Start date is required.')
    if (!form.primary_material.trim()) return setError('Enter the main raw material used.')

    setSaving(true)
    const { data, error: dbError } = await supabase.from('batches').insert({
      batch_id:         form.batch_id.trim().toUpperCase(),
      product_type:     form.product_type,
      units_produced:   parseInt(form.units_produced, 10),
      start_date:       form.start_date,
      primary_material: form.primary_material.trim(),
      status:           'active',
      is_demo:          false,
    }).select().single()

    if (dbError || !data) {
      setError('Unable to create batch. Check your connection and try again.')
      setSaving(false); return
    }
    router.push(`/batches/${data.id}`)
  }

  const inp = 'w-full border border-[#E2E1DC] rounded-xl px-4 py-3.5 text-[15px] text-[#1C1C1A] bg-white focus:outline-none focus:border-[#2A6349] focus:ring-2 focus:ring-[#2A6349]/20'
  const lbl = 'block text-[12px] font-semibold text-[#6B6B67] mb-1.5 uppercase tracking-wide'

  return (
    <div className="px-4 pt-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E1DC] bg-white text-[#1C1C1A] text-lg active:opacity-70">←</button>
        <div>
          <h1 className="text-xl font-bold text-[#1C1C1A]">Start New Production Batch</h1>
          <p className="text-[13px] text-[#6B6B67]">2 minutes to fill in · log resources next</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Batch ID */}
        <div>
          <label className={lbl}>Batch ID *</label>
          <input className={inp} placeholder="e.g. GT-2407" value={form.batch_id}
            onChange={e => set('batch_id', e.target.value)} autoCapitalize="characters" autoCorrect="off" autoFocus />
          <p className="text-[11px] text-[#6B6B67] mt-1.5">Your operational production code</p>
        </div>

        {/* Product Type */}
        <div>
          <label className={lbl}>Product Type *</label>
          <div className="grid grid-cols-3 gap-2">
            {PRODUCT_TYPES.map(pt => (
              <button key={pt.value} type="button"
                onClick={() => set('product_type', pt.value)}
                className={`px-3 py-3 rounded-xl border text-[13px] font-medium transition-all text-center ${
                  form.product_type === pt.value
                    ? 'border-[#2A6349] bg-[#E8F2ED] text-[#2A6349]'
                    : 'border-[#E2E1DC] bg-white text-[#1C1C1A]'
                }`}>
                {pt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Units */}
        <div>
          <label className={lbl}>Total Units Produced *</label>
          <input className={inp} type="number" inputMode="numeric" placeholder="e.g. 1500"
            value={form.units_produced} onChange={e => set('units_produced', e.target.value)} min="1" />
          <p className="text-[11px] text-[#6B6B67] mt-1.5">Number of finished units in this batch</p>
        </div>

        {/* Start Date */}
        <div>
          <label className={lbl}>Production Start Date *</label>
          <input className={inp} type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
        </div>

        {/* Primary Material */}
        <div>
          <label className={lbl}>Main Raw Material Used *</label>
          <input className={inp} placeholder="e.g. Cotton, Leather, Wheat flour"
            value={form.primary_material} onChange={e => set('primary_material', e.target.value)} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-[13px] text-red-700">{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={saving}
          className="w-full bg-[#2A6349] text-white py-4 rounded-xl text-[15px] font-semibold disabled:opacity-50 active:opacity-80 mt-2">
          {saving ? 'Creating Batch…' : 'Create Batch & Start Logging →'}
        </button>

        <p className="text-center text-[11px] text-[#6B6B67]">
          You can log water, electricity, fuel and waste on the next screen
        </p>
      </div>
    </div>
  )
}
