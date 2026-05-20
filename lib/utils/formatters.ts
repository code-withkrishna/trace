// ============================================================
// TRACE — Utility Formatters
// ============================================================

/** Round to 1 decimal place for display */
export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** Round to 2 decimal places */
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** Format litres with units */
export function formatLitres(n: number): string {
  if (n >= 1000) return `${round1(n / 1000)} kL`
  return `${round1(n)} L`
}

/** Format kWh */
export function formatKwh(n: number): string {
  return `${round1(n)} kWh`
}

/** Format kg */
export function formatKg(n: number): string {
  if (n >= 1000) return `${round1(n / 1000)} tonnes`
  return `${round1(n)} kg`
}

/** Format a date string to readable format */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Format today's date for reports */
export function formatReportDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/** Format percentage change with sign */
export function formatPctChange(pct: number): string {
  const abs = Math.abs(Math.round(pct))
  if (pct > 0) return `↑ ${abs}%`
  if (pct < 0) return `↓ ${abs}%`
  return '—'
}

/** Score colour class based on value */
export function scoreColorClass(score: number): string {
  if (score >= 80) return 'text-emerald-700'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

/** Score label */
export function scoreLabel(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Moderate'
  return 'Needs Improvement'
}

/** Product type display label */
export function productTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    garment:       'Garment',
    leather_goods: 'Leather Goods',
    food:          'Food Processing',
    ceramic:       'Ceramic',
    paper:         'Paper',
    other:         'Other',
  }
  return labels[type] ?? type
}
