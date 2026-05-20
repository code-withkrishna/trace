'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  return (
    <div className="px-4 pt-10 pb-8">

      {/* Onboarding overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowOnboarding(false)}>
          <div className="bg-white w-full rounded-t-2xl px-5 pt-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#E2E1DC] rounded-full mx-auto mb-6" />
            <p className="text-[17px] font-bold text-[#1C1C1A] mb-5">How Trace works</p>
            <div className="space-y-5">
              {[
                { step: '1', title: 'Create a production batch', body: 'Enter your batch ID, product type, and total units. Takes under 2 minutes.' },
                { step: '2', title: 'Log resource usage', body: 'Add water, electricity, fuel, and waste entries as the batch runs. Multiple entries per resource are supported.' },
                { step: '3', title: 'Mark batch complete', body: 'Trace calculates a sustainability score from 0–100 and generates a full Report Card with deduction breakdown.' },
                { step: '4', title: 'Print or share the Report Card', body: 'Export as a PDF that prints cleanly on A4. Share with buyers or keep for your records.' },
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#E8F2ED] flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-bold text-[#2A6349]">{item.step}</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#1C1C1A]">{item.title}</p>
                    <p className="text-[13px] text-[#6B6B67] leading-relaxed mt-0.5">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-7 flex gap-3">
              <Link href="/demo" className="flex-1 text-center bg-[#2A6349] text-white py-3.5 rounded-xl text-[14px] font-semibold active:opacity-80">
                Explore Demo Factory
              </Link>
              <Link href="/batches/new" className="flex-1 text-center border border-[#E2E1DC] bg-white text-[#1C1C1A] py-3.5 rounded-xl text-[14px] font-medium active:opacity-70">
                Start a Batch
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Wordmark */}
      <div className="mb-9">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#2A6349] flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="text-[22px] font-bold tracking-tight text-[#1C1C1A]">Trace</span>
        </div>
        <p className="text-[12px] text-[#6B6B67] ml-10">Batch Sustainability Tracker</p>
      </div>

      {/* Hero */}
      <div className="mb-9">
        <h1 className="text-[26px] font-bold text-[#1C1C1A] leading-tight mb-3">
          One honest number<br />per production batch.
        </h1>
        <p className="text-[15px] text-[#6B6B67] leading-relaxed">
          Track water, electricity, fuel, and waste per batch.
          Generate a sustainability score your buyers can trust — with the full math shown.
        </p>
      </div>

      {/* Primary CTAs */}
      <div className="space-y-3 mb-9">
        <Link href="/demo"
          className="block w-full bg-[#2A6349] text-white text-center py-4 rounded-xl text-[15px] font-semibold active:opacity-80">
          Explore Demo Factory →
        </Link>
        <Link href="/batches/new"
          className="block w-full bg-white border border-[#E2E1DC] text-[#1C1C1A] text-center py-4 rounded-xl text-[15px] font-medium active:opacity-80">
          Start New Production Batch
        </Link>
        <button onClick={() => setShowOnboarding(true)}
          className="block w-full text-center py-2 text-[13px] text-[#6B6B67] active:opacity-70">
          How does it work? →
        </button>
      </div>

      {/* Feature list */}
      <div className="border border-[#E2E1DC] rounded-xl bg-white overflow-hidden divide-y divide-[#E2E1DC] mb-9">
        {[
          { icon: '💧', label: 'Water usage per batch',     sub: 'Municipal, borewell, or tanker — logged separately' },
          { icon: '⚡', label: 'Electricity consumption',   sub: 'Grid and solar tracked independently' },
          { icon: '🔥', label: 'Fuel & thermal energy',     sub: 'Diesel, LPG, or coal with amounts' },
          { icon: '♻️', label: 'Waste and disposal method', sub: 'Landfill, recycler, or composted — affects score' },
          { icon: '📄', label: 'Printable A4 Report Card',  sub: 'Score, math, and comparison — ready to send to buyers' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-4 px-4 py-3.5">
            <span className="text-[20px] flex-shrink-0">{item.icon}</span>
            <div>
              <p className="text-[13px] font-semibold text-[#1C1C1A]">{item.label}</p>
              <p className="text-[12px] text-[#6B6B67] mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Scoring preview */}
      <div className="bg-[#E8F2ED] border border-[#C5DFD3] rounded-xl p-4 mb-8">
        <p className="text-[11px] font-semibold text-[#2A6349] uppercase tracking-widest mb-2">The Honest Score</p>
        <p className="text-[13px] text-[#1C1C1A] leading-relaxed">
          Start at 100. Deductions for excess water, electricity, any fuel use, poor waste disposal,
          and tanker water. Final score: 0–100. Every deduction is shown on the report.
          No AI. No estimates. Just the math.
        </p>
      </div>

      {/* Trust footer */}
      <div className="text-center space-y-1">
        <p className="text-[11px] text-[#6B6B67]">No login required · Works on basic Android · Free to use</p>
        <p className="text-[11px] text-[#6B6B67]">Built for Indian SME manufacturers · 50–500 employees</p>
      </div>
    </div>
  )
}
