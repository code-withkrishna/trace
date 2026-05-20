// ============================================================
// TRACE Scoring Engine — Type Definitions
// All scoring logic lives in lib/scoring/ — never in UI components
// ============================================================

export interface ResourceLogEntry {
  resource_type: 'water' | 'electricity' | 'fuel' | 'waste'
  amount: number
  unit?: string
  source?: string        // water: 'municipal' | 'borewell' | 'tanker'
  subtype?: string       // fuel type | waste type
  disposal_method?: string // 'landfill' | 'recycler' | 'composted' | 'unknown'
  solar_units?: number
}

export interface ScoreInput {
  units_produced: number
  logs: ResourceLogEntry[]
}

export interface DeductionBreakdown {
  water_deduction: number
  electricity_deduction: number
  fuel_deduction: number
  waste_deduction: number
  tanker_deduction: number
}

export interface ScoreResult {
  score: number                    // final clamped 0–100
  deductions: DeductionBreakdown
  water_total: number              // litres
  water_per_unit: number           // litres per unit
  electricity_total: number        // kWh
  electricity_per_unit: number     // kWh per unit
  fuel_total: number               // litres/kg
  fuel_per_unit: number
  waste_total: number              // kg
  waste_per_unit: number
}

export interface ComparisonResult {
  water_per_unit_change_pct: number       // positive = increased (worse)
  electricity_per_unit_change_pct: number
  fuel_per_unit_change_pct: number
  waste_per_unit_change_pct: number
  score_change: number                    // positive = improved
  previous_batch_id: string
  previous_score: number
}

export interface BatchReport {
  score: number
  water_total: number
  water_per_unit: number
  electricity_total: number
  electricity_per_unit: number
  fuel_total: number
  fuel_per_unit: number
  waste_total: number
  waste_per_unit: number
  deductions_json: DeductionBreakdown
  comparison_json: ComparisonResult | null
  observation: string
}
