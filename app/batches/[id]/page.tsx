'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { formatLitres, formatKwh, formatKg, productTypeLabel } from '@/lib/utils/formatters'

type Tab = 'water' | 'electricity' | 'fuel' | 'waste'

interface Batch {
  id: string; batch_id: string; product_type: string
  units_produced: number; start_date: string; status: string
  primary_material: string; sustainability_score: number | null; is_demo: boolean
}
interface Log {
  id: string; resource_type: string; amount: number; unit: string
  source: string; subtype: string; disposal_method: string
  solar_units: number; cost_per_litre: number; note: string; entry_date: string
}
interface Totals { water: number; electricity: number; fuel: number; waste: number }

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto pointer-events-none">
      <div className="bg-[#1C1C1A] text-white px-4 py-3 rounded-xl text-[14px] font-medium shadow-lg flex items-center gap-2">
        <span className="text-[#4CAF82]">✓</span> {message}
      </div>
    </div>
  )
}

const TODAY = new Date().toISOString().split('T')[0]

export default function BatchDetailPage() {
  const router = useRouter()
  const params = useParams()
  const batchId = params.id as string

  const [batch, setBatch] = useState<Batch | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [totals, setTotals] = useState<Totals>({ water: 0, electricity: 0, fuel: 0, waste: 0 })
  const [activeTab, setActiveTab] = useState<Tab>('water')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  // PRIORITY 3: Sticky previous values — source and subtype are remembered
  const [waterForm, setWaterForm] = useState({ amount: '', source: 'municipal', cost_per_litre: '', note: '', entry_date: TODAY })
  const [elecForm, setElecForm]   = useState({ amount: '', solar_units: '', note: '', entry_date: TODAY })
  const [fuelForm, setFuelForm]   = useState({ amount: '', subtype: 'diesel', note: '', entry_date: TODAY })
  const [wasteForm, setWasteForm] = useState({ amount: '', subtype: 'fabric_offcuts', disposal_method: 'recycler', note: '', entry_date: TODAY })

  const fetchData = useCallback(async () => {
    const [{ data: b }, { data: l }] = await Promise.all([
      supabase.from('batches').select('*').eq('id', batchId).single(),
      supabase.from('resource_logs').select('*').eq('batch_uuid', batchId).order('entry_date', { ascending: false }),
    ])
    if (!b) { router.push('/batches'); return }
    setBatch(b)
    const allLogs = l ?? []
    setLogs(allLogs)
    computeTotals(allLogs)

    // Sticky last values: pre-fill source/subtype from most recent log of same type
    const lastWater = allLogs.find(x => x.resource_type === 'water')
    const lastFuel  = allLogs.find(x => x.resource_type === 'fuel')
    const lastWaste = allLogs.find(x => x.resource_type === 'waste')
    if (lastWater?.source)          setWaterForm(f => ({ ...f, source: lastWater.source }))
    if (lastFuel?.subtype)          setFuelForm(f => ({ ...f, subtype: lastFuel.subtype }))
    if (lastWaste?.subtype)         setWasteForm(f => ({ ...f, subtype: lastWaste.subtype }))
    if (lastWaste?.disposal_method) setWasteForm(f => ({ ...f, disposal_method: lastWaste.disposal_method }))

    setLoading(false)
  }, [batchId, router])

  useEffect(() => { fetchData() }, [fetchData])

  function computeTotals(allLogs: Log[]) {
    setTotals({
      water:       allLogs.filter(l => l.resource_type === 'water').reduce((s, l) => s + Number(l.amount), 0),
      electricity: allLogs.filter(l => l.resource_type === 'electricity').reduce((s, l) => s + Number(l.amount), 0),
      fuel:        allLogs.filter(l => l.resource_type === 'fuel').reduce((s, l) => s + Number(l.amount), 0),
      waste:       allLogs.filter(l => l.resource_type === 'waste').reduce((s, l) => s + Number(l.amount), 0),
    })
  }

  async function saveLog(resource_type: Tab, data: Record<string, unknown>) {
    if (!data.amount || Number(data.amount) <= 0) { setError('Enter a valid amount greater than 0.'); return }
    setSaving(true); setError('')
    const { error: dbError } = await supabase.from('resource_logs').insert({ batch_uuid: batchId, resource_type, ...data })
    if (dbError) {
      setError('Unable to save entry. Check your connection and try again.')
    } else {
      setToast('Entry saved')
      await fetchData()
      // Reset only amount and note — keep sticky selections
      if (resource_type === 'water')       setWaterForm(f => ({ ...f, amount: '', cost_per_litre: '', note: '' }))
      if (resource_type === 'electricity') setElecForm(f => ({ ...f, amount: '', solar_units: '', note: '' }))
      if (resource_type === 'fuel')        setFuelForm(f => ({ ...f, amount: '', note: '' }))
      if (resource_type === 'waste')       setWasteForm(f => ({ ...f, amount: '', note: '' }))
    }
    setSaving(false)
  }

  async function deleteLog(logId: string) {
    await supabase.from('resource_logs').delete().eq('id', logId)
    await fetchData()
    setToast('Entry removed')
  }

  async function completeBatch() {
    setCompleting(true); setError('')
    const resp = await fetch(`/api/batches/complete/${batchId}`, { method: 'POST' })
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}))
      setError(body.error ?? 'Unable to complete batch. Check connection and try again.')
      setCompleting(false); return
    }
    router.push(`/report/${batchId}`)
  }

  const inp  = 'w-full border border-[#E2E1DC] rounded-xl px-4 py-3 text-[15px] text-[#1C1C1A] bg-white focus:outline-none focus:border-[#2A6349] focus:ring-2 focus:ring-[#2A6349]/20'
  const lbl  = 'block text-[12px] font-semibold text-[#6B6B67] mb-1.5 uppercase tracking-wide'
  const tabLogs = logs.filter(l => l.resource_type === activeTab)

  // Tab metadata
  const TAB_META: Record<Tab, { icon: string; label: string; total: string; hint: string }> = {
    water:       { icon: '💧', label: 'Water',       total: formatLitres(totals.water),       hint: 'Log each water source separately' },
    electricity: { icon: '⚡', label: 'Electricity',  total: formatKwh(totals.electricity),    hint: 'Log total kWh consumed per period' },
    fuel:        { icon: '🔥', label: 'Fuel',         total: formatLitres(totals.fuel),        hint: 'Log diesel, LPG or coal used' },
    waste:       { icon: '♻️', label: 'Waste',        total: formatKg(totals.waste),           hint: 'Log solid waste by disposal method' },
  }

  if (loading) return (
    <div className="px-4 pt-6 animate-pulse space-y-4">
      <div className="h-7 bg-[#E2E1DC] rounded w-32" />
      <div className="h-20 bg-[#E2E1DC] rounded-xl" />
      <div className="h-48 bg-[#E2E1DC] rounded-xl" />
    </div>
  )

  if (!batch) return null

  return (
    <div className="px-4 pt-6">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start gap-3 mb-5">
        <button onClick={() => router.back()} className="w-9 h-9 mt-0.5 flex-shrink-0 flex items-center justify-center rounded-lg border border-[#E2E1DC] bg-white text-[#1C1C1A] active:opacity-70">←</button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-[18px] text-[#1C1C1A]">{batch.batch_id}</span>
            {batch.is_demo && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">DEMO</span>}
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${batch.status === 'completed' ? 'bg-[#E8F2ED] text-[#2A6349]' : 'bg-amber-50 text-amber-700'}`}>
              {batch.status === 'completed' ? 'Completed' : 'Active'}
            </span>
          </div>
          <p className="text-[13px] text-[#6B6B67] mt-0.5">
            {productTypeLabel(batch.product_type)} · {batch.units_produced.toLocaleString('en-IN')} units · {batch.primary_material}
          </p>
        </div>
      </div>

      {/* ── Metric strip — tap to switch tab ──────────────── */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {(['water','electricity','fuel','waste'] as Tab[]).map(tab => {
          const m = TAB_META[tab]
          const active = activeTab === tab
          const hasData = logs.some(l => l.resource_type === tab)
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-xl p-2.5 text-center border transition-all ${active ? 'bg-[#2A6349] border-[#2A6349] text-white shadow-sm' : 'bg-white border-[#E2E1DC] text-[#1C1C1A]'}`}>
              <div className="text-lg mb-0.5">{m.icon}</div>
              <div className={`text-[10px] font-medium ${active ? 'text-white/70' : 'text-[#6B6B67]'}`}>{m.label}</div>
              <div className={`text-[11px] font-bold mt-0.5 ${active ? 'text-white' : 'text-[#1C1C1A]'}`}>{m.total}</div>
              {hasData && !active && <div className="w-1 h-1 bg-[#2A6349] rounded-full mx-auto mt-1" />}
            </button>
          )
        })}
      </div>

      {/* ── Tab bar ───────────────────────────────────────── */}
      <div className="flex gap-1 mb-4 bg-[#EDECE9] p-1 rounded-xl">
        {(['water','electricity','fuel','waste'] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold capitalize transition-colors ${activeTab === tab ? 'bg-white text-[#1C1C1A] shadow-sm' : 'text-[#6B6B67]'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Log entry form (active batches only) ──────────── */}
      {batch.status === 'active' && (
        <div className="bg-white border border-[#E2E1DC] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-bold text-[#1C1C1A]">
              {TAB_META[activeTab].icon} Add {TAB_META[activeTab].label} Entry
            </p>
            <p className="text-[11px] text-[#6B6B67]">{TAB_META[activeTab].hint}</p>
          </div>

          {/* WATER FORM */}
          {activeTab === 'water' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Quantity (Litres) *</label>
                  <input className={inp} type="number" inputMode="decimal" placeholder="e.g. 5000" value={waterForm.amount} onChange={e => setWaterForm(f => ({ ...f, amount: e.target.value }))} autoFocus />
                </div>
                <div>
                  <label className={lbl}>Water Source *</label>
                  <select className={inp} value={waterForm.source} onChange={e => setWaterForm(f => ({ ...f, source: e.target.value }))}>
                    <option value="municipal">Municipal Supply</option>
                    <option value="borewell">Borewell</option>
                    <option value="tanker">Water Tanker</option>
                  </select>
                </div>
              </div>
              {waterForm.source === 'tanker' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-[11px] text-amber-700 font-medium mb-2">⚠ Tanker water adds a 10-point deduction to the score</p>
                  <div>
                    <label className={lbl}>Cost per Litre (₹)</label>
                    <input className={inp} type="number" inputMode="decimal" placeholder="e.g. 0.12" value={waterForm.cost_per_litre} onChange={e => setWaterForm(f => ({ ...f, cost_per_litre: e.target.value }))} />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Entry Date</label>
                  <input className={inp} type="date" value={waterForm.entry_date} onChange={e => setWaterForm(f => ({ ...f, entry_date: e.target.value }))} />
                </div>
                <div>
                  <label className={lbl}>Note (optional)</label>
                  <input className={inp} placeholder="e.g. Morning shift" value={waterForm.note} onChange={e => setWaterForm(f => ({ ...f, note: e.target.value }))} />
                </div>
              </div>
              <button onClick={() => saveLog('water', { amount: Number(waterForm.amount), unit: 'litres', source: waterForm.source, cost_per_litre: waterForm.cost_per_litre ? Number(waterForm.cost_per_litre) : null, note: waterForm.note || null, entry_date: waterForm.entry_date })}
                disabled={saving} className="w-full bg-[#2A6349] text-white py-4 rounded-xl text-[15px] font-semibold disabled:opacity-50 active:opacity-80">
                {saving ? 'Saving…' : 'Save Water Entry'}
              </button>
            </div>
          )}

          {/* ELECTRICITY FORM */}
          {activeTab === 'electricity' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>kWh Consumed *</label>
                  <input className={inp} type="number" inputMode="decimal" placeholder="e.g. 480" value={elecForm.amount} onChange={e => setElecForm(f => ({ ...f, amount: e.target.value }))} autoFocus />
                </div>
                <div>
                  <label className={lbl}>Solar kWh (if any)</label>
                  <input className={inp} type="number" inputMode="decimal" placeholder="e.g. 120" value={elecForm.solar_units} onChange={e => setElecForm(f => ({ ...f, solar_units: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Entry Date</label>
                  <input className={inp} type="date" value={elecForm.entry_date} onChange={e => setElecForm(f => ({ ...f, entry_date: e.target.value }))} />
                </div>
                <div>
                  <label className={lbl}>Note (optional)</label>
                  <input className={inp} placeholder="e.g. From MSEDCL bill" value={elecForm.note} onChange={e => setElecForm(f => ({ ...f, note: e.target.value }))} />
                </div>
              </div>
              <button onClick={() => saveLog('electricity', { amount: Number(elecForm.amount), unit: 'kWh', solar_units: elecForm.solar_units ? Number(elecForm.solar_units) : null, note: elecForm.note || null, entry_date: elecForm.entry_date })}
                disabled={saving} className="w-full bg-[#2A6349] text-white py-4 rounded-xl text-[15px] font-semibold disabled:opacity-50 active:opacity-80">
                {saving ? 'Saving…' : 'Save Electricity Entry'}
              </button>
            </div>
          )}

          {/* FUEL FORM */}
          {activeTab === 'fuel' && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-1">
                <p className="text-[11px] text-amber-700 font-medium">⚠ Any fuel use adds a flat 10-point deduction</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Amount *</label>
                  <input className={inp} type="number" inputMode="decimal" placeholder="e.g. 50" value={fuelForm.amount} onChange={e => setFuelForm(f => ({ ...f, amount: e.target.value }))} autoFocus />
                </div>
                <div>
                  <label className={lbl}>Fuel Type *</label>
                  <select className={inp} value={fuelForm.subtype} onChange={e => setFuelForm(f => ({ ...f, subtype: e.target.value }))}>
                    <option value="diesel">Diesel (Litres)</option>
                    <option value="lpg">LPG (kg)</option>
                    <option value="coal">Coal (kg)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Entry Date</label>
                  <input className={inp} type="date" value={fuelForm.entry_date} onChange={e => setFuelForm(f => ({ ...f, entry_date: e.target.value }))} />
                </div>
                <div>
                  <label className={lbl}>Note (optional)</label>
                  <input className={inp} placeholder="e.g. Generator" value={fuelForm.note} onChange={e => setFuelForm(f => ({ ...f, note: e.target.value }))} />
                </div>
              </div>
              <button onClick={() => saveLog('fuel', { amount: Number(fuelForm.amount), unit: fuelForm.subtype === 'diesel' ? 'litres' : 'kg', subtype: fuelForm.subtype, note: fuelForm.note || null, entry_date: fuelForm.entry_date })}
                disabled={saving} className="w-full bg-[#2A6349] text-white py-4 rounded-xl text-[15px] font-semibold disabled:opacity-50 active:opacity-80">
                {saving ? 'Saving…' : 'Save Fuel Entry'}
              </button>
            </div>
          )}

          {/* WASTE FORM */}
          {activeTab === 'waste' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Weight (kg) *</label>
                  <input className={inp} type="number" inputMode="decimal" placeholder="e.g. 45" value={wasteForm.amount} onChange={e => setWasteForm(f => ({ ...f, amount: e.target.value }))} autoFocus />
                </div>
                <div>
                  <label className={lbl}>Waste Type *</label>
                  <select className={inp} value={wasteForm.subtype} onChange={e => setWasteForm(f => ({ ...f, subtype: e.target.value }))}>
                    <option value="fabric_offcuts">Fabric Offcuts</option>
                    <option value="chemical">Chemical Waste</option>
                    <option value="food">Food Waste</option>
                    <option value="mixed">Mixed Waste</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>Disposal Method *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'composted', label: 'Composted', hint: '0 pts', good: true },
                    { val: 'recycler',  label: 'Recycler',  hint: '−5 pts', good: true },
                    { val: 'landfill',  label: 'Landfill',  hint: '−15 pts', good: false },
                    { val: 'unknown',   label: 'Unknown',   hint: '−15 pts', good: false },
                  ].map(opt => (
                    <button key={opt.val} type="button"
                      onClick={() => setWasteForm(f => ({ ...f, disposal_method: opt.val }))}
                      className={`px-3 py-2.5 rounded-xl border text-left transition-all ${wasteForm.disposal_method === opt.val
                        ? opt.good ? 'border-[#2A6349] bg-[#E8F2ED]' : 'border-red-400 bg-red-50'
                        : 'border-[#E2E1DC] bg-white'}`}>
                      <p className="text-[13px] font-semibold text-[#1C1C1A]">{opt.label}</p>
                      <p className={`text-[10px] font-medium ${opt.good ? 'text-[#2A6349]' : 'text-red-500'}`}>{opt.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Entry Date</label>
                  <input className={inp} type="date" value={wasteForm.entry_date} onChange={e => setWasteForm(f => ({ ...f, entry_date: e.target.value }))} />
                </div>
                <div>
                  <label className={lbl}>Note (optional)</label>
                  <input className={inp} placeholder="e.g. End of batch" value={wasteForm.note} onChange={e => setWasteForm(f => ({ ...f, note: e.target.value }))} />
                </div>
              </div>
              <button onClick={() => saveLog('waste', { amount: Number(wasteForm.amount), unit: 'kg', subtype: wasteForm.subtype, disposal_method: wasteForm.disposal_method, note: wasteForm.note || null, entry_date: wasteForm.entry_date })}
                disabled={saving} className="w-full bg-[#2A6349] text-white py-4 rounded-xl text-[15px] font-semibold disabled:opacity-50 active:opacity-80">
                {saving ? 'Saving…' : 'Save Waste Entry'}
              </button>
            </div>
          )}

          {error && <p className="text-[13px] text-red-600 mt-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>
      )}

      {/* ── Existing log entries ───────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] font-semibold text-[#6B6B67] uppercase tracking-wide">
            {TAB_META[activeTab].label} Entries ({tabLogs.length})
          </p>
          {tabLogs.length > 0 && (
            <p className="text-[12px] font-semibold text-[#1C1C1A]">
              Total: {activeTab === 'water' ? formatLitres(totals.water) : activeTab === 'electricity' ? formatKwh(totals.electricity) : activeTab === 'fuel' ? formatLitres(totals.fuel) : formatKg(totals.waste)}
            </p>
          )}
        </div>

        {tabLogs.length === 0 ? (
          <div className="bg-white border border-[#E2E1DC] border-dashed rounded-xl py-8 text-center">
            <p className="text-2xl mb-2">{TAB_META[activeTab].icon}</p>
            <p className="text-[13px] text-[#6B6B67]">No {activeTab} entries yet</p>
            {batch.status === 'active' && <p className="text-[11px] text-[#6B6B67] mt-1">Use the form above to add your first entry</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {tabLogs.map(log => (
              <div key={log.id} className="bg-white border border-[#E2E1DC] rounded-xl px-4 py-3 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[14px] text-[#1C1C1A]">
                      {log.resource_type === 'water'       && `${Number(log.amount).toLocaleString('en-IN')} L`}
                      {log.resource_type === 'electricity' && `${Number(log.amount)} kWh`}
                      {log.resource_type === 'fuel'        && `${Number(log.amount)} ${log.unit}`}
                      {log.resource_type === 'waste'       && `${Number(log.amount)} kg`}
                    </span>
                    {log.source         && <span className="text-[11px] bg-[#F0EFEB] text-[#6B6B67] px-2 py-0.5 rounded-full capitalize">{log.source}</span>}
                    {log.subtype        && <span className="text-[11px] bg-[#F0EFEB] text-[#6B6B67] px-2 py-0.5 rounded-full capitalize">{log.subtype.replace('_', ' ')}</span>}
                    {log.disposal_method && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize font-medium ${
                        log.disposal_method === 'composted' ? 'bg-[#E8F2ED] text-[#2A6349]' :
                        log.disposal_method === 'recycler'  ? 'bg-blue-50 text-blue-700' :
                        'bg-red-50 text-red-600'
                      }`}>{log.disposal_method}</span>
                    )}
                  </div>
                  {log.note && <p className="text-[11px] text-[#6B6B67] mt-0.5 truncate">{log.note}</p>}
                  <p className="text-[11px] text-[#6B6B67] mt-0.5">{log.entry_date}</p>
                </div>
                {batch.status === 'active' && !batch.is_demo && (
                  <button onClick={() => deleteLog(log.id)} className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[#6B6B67] hover:text-red-500 text-xl leading-none active:opacity-70" aria-label="Remove entry">×</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Complete batch ─────────────────────────────────── */}
      {batch.status === 'active' && (
        <div className="border-t border-[#E2E1DC] pt-5 mt-2 pb-4">
          <p className="text-[12px] text-[#6B6B67] text-center mb-3">
            Log all resources for this batch before marking it complete
          </p>
          <button onClick={completeBatch} disabled={completing || logs.length === 0}
            className="w-full bg-[#1C1C1A] text-white py-4 rounded-xl text-[15px] font-semibold disabled:opacity-40 active:opacity-80">
            {completing ? 'Calculating Score…' : 'Mark Batch Complete & Generate Report →'}
          </button>
          {logs.length === 0 && <p className="text-[11px] text-[#6B6B67] text-center mt-2">Add at least one resource entry to continue</p>}
        </div>
      )}

      {batch.status === 'completed' && (
        <div className="border-t border-[#E2E1DC] pt-5 mt-2 pb-4">
          <Link href={`/report/${batchId}`} className="block w-full bg-[#2A6349] text-white text-center py-4 rounded-xl text-[15px] font-semibold active:opacity-80">
            View Report Card →
          </Link>
        </div>
      )}
    </div>
  )
}
