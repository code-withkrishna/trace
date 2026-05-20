export default function AboutPage() {
  return (
    <div className="px-4 pt-6 pb-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#2A6349] flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="text-2xl font-bold text-[#1C1C1A]">Trace</span>
        </div>
        <p className="text-[13px] text-[#6B6B67] ml-10">Batch Sustainability Tracker</p>
      </div>

      <div className="space-y-5">
        <div className="bg-white border border-[#E2E1DC] rounded-xl p-4">
          <h2 className="text-[14px] font-semibold text-[#1C1C1A] mb-2">What is Trace?</h2>
          <p className="text-[13px] text-[#6B6B67] leading-relaxed">
            Trace is a resource consumption tracker for Indian SME manufacturers. It turns
            scattered operational data into one honest, auditable sustainability number
            per production batch — so when a buyer asks “how much water per unit?”,
            you can answer in 30 seconds with a number you can defend.
          </p>
        </div>

        <div className="bg-white border border-[#E2E1DC] rounded-xl p-4">
          <h2 className="text-[14px] font-semibold text-[#1C1C1A] mb-3">Scoring Formula</h2>
          <p className="text-[12px] text-[#6B6B67] mb-3">Start at 100. Deduct for:</p>
          <div className="space-y-2">
            {[
              ['💧 Water', '1 point per 10 L above 50 L/unit (max 20)'],
              ['⚡ Electricity', '1 point per 0.5 kWh above 2 kWh/unit (max 20)'],
              ['🔥 Fuel', '10 points if any fuel used'],
              ['♻️ Waste', '15 (landfill/unknown) · 5 (recycler) · 0 (composted)'],
              ['🚛 Tanker water', '10 points if any tanker water used'],
            ].map(([label, desc]) => (
              <div key={label as string} className="flex gap-3">
                <span className="text-[13px] text-[#1C1C1A] w-32 flex-shrink-0 font-medium">{label}</span>
                <span className="text-[12px] text-[#6B6B67]">{desc}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#E2E1DC]">
            <p className="text-[12px] text-[#6B6B67]">
              Final score clamped to 0–100. Exact deduction breakdown shown on every report.
              No AI. No estimates. Just the math.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E1DC] rounded-xl p-4">
          <h2 className="text-[14px] font-semibold text-[#1C1C1A] mb-3">How to use</h2>
          <div className="space-y-3">
            {[
              ['1', 'Create a batch with ID, product type, and units.'],
              ['2', 'Log water, electricity, fuel, and waste entries as the batch runs.'],
              ['3', 'Mark batch complete to generate the Report Card.'],
              ['4', 'Print or save the Report Card as a PDF.'],
            ].map(([num, text]) => (
              <div key={num as string} className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-[#E8F2ED] text-[#2A6349] text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                  {num}
                </span>
                <span className="text-[13px] text-[#6B6B67] leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E2E1DC] rounded-xl p-4">
          <h2 className="text-[14px] font-semibold text-[#1C1C1A] mb-2">Built for factory floors</h2>
          <ul className="space-y-1.5">
            {[
              'No login required',
              'Works on basic Android phones',
              'Minimal typing — dropdowns where possible',
              'PDF prints correctly on A4',
              'Scores verified against a fixed, transparent formula',
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-[13px] text-[#6B6B67]">
                <span className="text-[#2A6349] font-bold mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center py-2">
          <p className="text-[11px] text-[#6B6B67]">
            Trace · Operational Sustainability Tracking for SMEs
          </p>
        </div>
      </div>
    </div>
  )
}
