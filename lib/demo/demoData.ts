// ============================================================
// TRACE — Demo Factory Data: Shakti Textiles, Tiruppur
// 25 batches | Jan–Jun 2024 | Scores gradually improving
//
// Score verification for each batch (formula applied manually):
//   water_ded = floor((water_per_unit - 50) / 10) capped at 20, if > 50
//   elec_ded  = floor((elec_per_unit  -  2) / 0.5) capped at 20, if > 2
//   fuel_ded  = 10 if any fuel, else 0
//   waste_ded = 15 landfill/unknown | 5 recycler | 0 composted/none
//   tanker_ded= 10 if any tanker water, else 0
// ============================================================

export const DEMO_FACTORY_NAME = 'Shakti Textiles'
export const DEMO_FACTORY_LOCATION = 'Tiruppur, Tamil Nadu'

interface DemoBatch {
  batch_id: string
  product_type: string
  units_produced: number
  start_date: string
  completed_date: string
  primary_material: string
  status: 'active' | 'completed'
  // pre-computed for seed (verified against formula)
  score: number | null
  // resource totals
  water_municipal: number
  water_tanker: number
  electricity_kwh: number
  solar_kwh: number
  fuel_type: string | null
  fuel_amount: number
  waste_kg: number
  waste_type: string
  waste_disposal: string
}

// All scores manually verified against the exact formula
export const DEMO_BATCHES: DemoBatch[] = [
  // ── JAN 2024 ─ Early period: heavy usage, low scores ──────
  {
    // water/unit=85L tanker, elec/unit=3.2kWh, fuel diesel, landfill
    // water_ded=floor(35/10)=3, elec_ded=floor(1.2/0.5)=2, fuel=10, waste=15, tanker=10 → 60
    batch_id: 'GT-2401', product_type: 'garment', units_produced: 1000,
    start_date: '2024-01-05', completed_date: '2024-01-12',
    primary_material: 'Cotton', status: 'completed', score: 60,
    water_municipal: 60000, water_tanker: 25000,
    electricity_kwh: 3200, solar_kwh: 0,
    fuel_type: 'diesel', fuel_amount: 120,
    waste_kg: 480, waste_type: 'fabric_offcuts', waste_disposal: 'landfill',
  },
  {
    // water/unit=90L tanker, elec/unit=3.4, fuel, landfill
    // water_ded=floor(40/10)=4, elec_ded=floor(1.4/0.5)=2, fuel=10, waste=15, tanker=10 → 59
    batch_id: 'GT-2402', product_type: 'garment', units_produced: 1500,
    start_date: '2024-01-15', completed_date: '2024-01-24',
    primary_material: 'Polyester Blend', status: 'completed', score: 59,
    water_municipal: 80000, water_tanker: 55000,
    electricity_kwh: 5100, solar_kwh: 0,
    fuel_type: 'diesel', fuel_amount: 180,
    waste_kg: 720, waste_type: 'fabric_offcuts', waste_disposal: 'landfill',
  },
  {
    // water/unit=87.5L tanker, elec/unit=3.3, fuel, landfill
    // water_ded=floor(37.5/10)=3, elec_ded=floor(1.3/0.5)=2, fuel=10, waste=15, tanker=10 → 60
    batch_id: 'GT-2403', product_type: 'garment', units_produced: 800,
    start_date: '2024-01-26', completed_date: '2024-02-02',
    primary_material: 'Cotton', status: 'completed', score: 60,
    water_municipal: 40000, water_tanker: 30000,
    electricity_kwh: 2640, solar_kwh: 0,
    fuel_type: 'diesel', fuel_amount: 90,
    waste_kg: 380, waste_type: 'mixed', waste_disposal: 'landfill',
  },

  // ── FEB 2024 ─ Still high usage, mixed disposal ────────────
  {
    // water/unit=80L tanker, elec/unit=3.0, fuel, landfill
    // water_ded=floor(30/10)=3, elec_ded=floor(1.0/0.5)=2, fuel=10, waste=15, tanker=10 → 60
    batch_id: 'GT-2404', product_type: 'garment', units_produced: 2000,
    start_date: '2024-02-05', completed_date: '2024-02-14',
    primary_material: 'Cotton', status: 'completed', score: 60,
    water_municipal: 100000, water_tanker: 60000,
    electricity_kwh: 6000, solar_kwh: 0,
    fuel_type: 'diesel', fuel_amount: 240,
    waste_kg: 960, waste_type: 'fabric_offcuts', waste_disposal: 'landfill',
  },
  {
    // water/unit=90L tanker, elec/unit=3.2, fuel, unknown
    // water_ded=4, elec_ded=2, fuel=10, waste=15, tanker=10 → 59
    batch_id: 'GT-2405', product_type: 'garment', units_produced: 1200,
    start_date: '2024-02-16', completed_date: '2024-02-25',
    primary_material: 'Cotton Lycra', status: 'completed', score: 59,
    water_municipal: 60000, water_tanker: 48000,
    electricity_kwh: 3840, solar_kwh: 0,
    fuel_type: 'diesel', fuel_amount: 140,
    waste_kg: 570, waste_type: 'chemical', waste_disposal: 'unknown',
  },

  // ── MAR 2024 ─ Switching to recycler, still tanker water ──
  {
    // water/unit=80L tanker, elec/unit=3.0, fuel, recycler
    // water_ded=3, elec_ded=2, fuel=10, waste=5, tanker=10 → 70
    batch_id: 'GT-2406', product_type: 'garment', units_produced: 1000,
    start_date: '2024-03-01', completed_date: '2024-03-09',
    primary_material: 'Cotton', status: 'completed', score: 70,
    water_municipal: 55000, water_tanker: 25000,
    electricity_kwh: 3000, solar_kwh: 0,
    fuel_type: 'diesel', fuel_amount: 110,
    waste_kg: 460, waste_type: 'fabric_offcuts', waste_disposal: 'recycler',
  },
  {
    // water/unit=78.3L tanker, elec/unit=3.0, fuel, recycler
    // water_ded=floor(28.3/10)=2, elec_ded=2, fuel=10, waste=5, tanker=10 → 71
    batch_id: 'GT-2407', product_type: 'garment', units_produced: 1500,
    start_date: '2024-03-11', completed_date: '2024-03-19',
    primary_material: 'Polyester Blend', status: 'completed', score: 71,
    water_municipal: 80000, water_tanker: 37500,
    electricity_kwh: 4500, solar_kwh: 0,
    fuel_type: 'diesel', fuel_amount: 165,
    waste_kg: 700, waste_type: 'fabric_offcuts', waste_disposal: 'recycler',
  },
  {
    // water/unit=72.2L tanker, elec/unit=3.0, fuel, recycler
    // water_ded=floor(22.2/10)=2, elec_ded=2, fuel=10, waste=5, tanker=10 → 71
    batch_id: 'GT-2408', product_type: 'garment', units_produced: 1800,
    start_date: '2024-03-21', completed_date: '2024-03-29',
    primary_material: 'Cotton', status: 'completed', score: 71,
    water_municipal: 90000, water_tanker: 40000,
    electricity_kwh: 5400, solar_kwh: 0,
    fuel_type: 'diesel', fuel_amount: 200,
    waste_kg: 850, waste_type: 'fabric_offcuts', waste_disposal: 'recycler',
  },

  // ── APR 2024 ─ Reducing tanker, better electricity ─────────
  {
    // water/unit=70L tanker, elec/unit=3.0, fuel, recycler
    // water_ded=floor(20/10)=2, elec_ded=2, fuel=10, waste=5, tanker=10 → 71
    batch_id: 'GT-2409', product_type: 'garment', units_produced: 1000,
    start_date: '2024-04-02', completed_date: '2024-04-10',
    primary_material: 'Cotton', status: 'completed', score: 71,
    water_municipal: 50000, water_tanker: 20000,
    electricity_kwh: 3000, solar_kwh: 0,
    fuel_type: 'diesel', fuel_amount: 110,
    waste_kg: 460, waste_type: 'fabric_offcuts', waste_disposal: 'recycler',
  },
  {
    // water/unit=70L NO tanker, elec/unit=2.8, fuel, recycler
    // water_ded=2, elec_ded=floor(0.8/0.5)=1, fuel=10, waste=5, tanker=0 → 82
    batch_id: 'GT-2410', product_type: 'garment', units_produced: 2000,
    start_date: '2024-04-12', completed_date: '2024-04-22',
    primary_material: 'Cotton', status: 'completed', score: 82,
    water_municipal: 140000, water_tanker: 0,
    electricity_kwh: 5600, solar_kwh: 200,
    fuel_type: 'diesel', fuel_amount: 220,
    waste_kg: 950, waste_type: 'fabric_offcuts', waste_disposal: 'recycler',
  },
  {
    // water/unit=65L NO tanker, elec/unit=2.8, fuel, recycler
    // water_ded=floor(15/10)=1, elec_ded=1, fuel=10, waste=5, tanker=0 → 83
    batch_id: 'GT-2411', product_type: 'garment', units_produced: 1500,
    start_date: '2024-04-24', completed_date: '2024-05-02',
    primary_material: 'Cotton Lycra', status: 'completed', score: 83,
    water_municipal: 97500, water_tanker: 0,
    electricity_kwh: 4200, solar_kwh: 300,
    fuel_type: 'diesel', fuel_amount: 165,
    waste_kg: 700, waste_type: 'fabric_offcuts', waste_disposal: 'recycler',
  },

  // ── MAY 2024 ─ No fuel on some batches, composting starts ─
  {
    // water/unit=60L NO tanker, elec/unit=2.8, fuel, recycler
    // water_ded=floor(10/10)=1, elec_ded=1, fuel=10, waste=5, tanker=0 → 83
    batch_id: 'GT-2412', product_type: 'garment', units_produced: 1200,
    start_date: '2024-05-04', completed_date: '2024-05-13',
    primary_material: 'Cotton', status: 'completed', score: 83,
    water_municipal: 72000, water_tanker: 0,
    electricity_kwh: 3360, solar_kwh: 400,
    fuel_type: 'diesel', fuel_amount: 130,
    waste_kg: 560, waste_type: 'fabric_offcuts', waste_disposal: 'recycler',
  },
  {
    // water/unit=60L NO tanker, elec/unit=2.8, NO fuel, recycler
    // water_ded=1, elec_ded=1, fuel=0, waste=5, tanker=0 → 93
    batch_id: 'GT-2413', product_type: 'garment', units_produced: 1000,
    start_date: '2024-05-15', completed_date: '2024-05-23',
    primary_material: 'Organic Cotton', status: 'completed', score: 93,
    water_municipal: 60000, water_tanker: 0,
    electricity_kwh: 2800, solar_kwh: 500,
    fuel_type: null, fuel_amount: 0,
    waste_kg: 450, waste_type: 'fabric_offcuts', waste_disposal: 'recycler',
  },
  {
    // water/unit=55L NO tanker, elec/unit=3.0, fuel diesel, recycler
    // water_ded=floor(5/10)=0, elec_ded=floor(1.0/0.5)=2, fuel=10, waste=5, tanker=0 → 83
    batch_id: 'GT-2414', product_type: 'garment', units_produced: 1500,
    start_date: '2024-05-25', completed_date: '2024-06-03',
    primary_material: 'Polyester', status: 'completed', score: 83,
    water_municipal: 82500, water_tanker: 0,
    electricity_kwh: 4500, solar_kwh: 400,
    fuel_type: 'diesel', fuel_amount: 165,
    waste_kg: 700, waste_type: 'mixed', waste_disposal: 'recycler',
  },

  // ── JUN 2024 ─ Composting, solar, near-zero fuel ──────────
  {
    // water/unit=50L NO tanker, elec/unit=2.8, NO fuel, composted
    // water_ded=0, elec_ded=1, fuel=0, waste=0, tanker=0 → 99
    batch_id: 'GT-2415', product_type: 'garment', units_produced: 2000,
    start_date: '2024-06-01', completed_date: '2024-06-09',
    primary_material: 'Cotton', status: 'completed', score: 99,
    water_municipal: 100000, water_tanker: 0,
    electricity_kwh: 5600, solar_kwh: 1000,
    fuel_type: null, fuel_amount: 0,
    waste_kg: 950, waste_type: 'fabric_offcuts', waste_disposal: 'composted',
  },
  {
    // water/unit=50L NO tanker, elec/unit=2.2, NO fuel, composted
    // water_ded=0, elec_ded=floor(0.2/0.5)=0, fuel=0, waste=0, tanker=0 → 100
    batch_id: 'GT-2416', product_type: 'garment', units_produced: 1200,
    start_date: '2024-06-10', completed_date: '2024-06-18',
    primary_material: 'Organic Cotton', status: 'completed', score: 100,
    water_municipal: 60000, water_tanker: 0,
    electricity_kwh: 2640, solar_kwh: 800,
    fuel_type: null, fuel_amount: 0,
    waste_kg: 560, waste_type: 'fabric_offcuts', waste_disposal: 'composted',
  },
  {
    // water/unit=48L NO tanker, elec/unit=2.0, NO fuel, composted
    // water_ded=0, elec_ded=0, fuel=0, waste=0, tanker=0 → 100
    batch_id: 'GT-2417', product_type: 'garment', units_produced: 1500,
    start_date: '2024-06-19', completed_date: '2024-06-27',
    primary_material: 'Cotton', status: 'completed', score: 100,
    water_municipal: 72000, water_tanker: 0,
    electricity_kwh: 3000, solar_kwh: 1000,
    fuel_type: null, fuel_amount: 0,
    waste_kg: 700, waste_type: 'fabric_offcuts', waste_disposal: 'composted',
  },

  // ── Additional completed batches ──────────────────────────
  {
    // water/unit=75L tanker, elec/unit=3.5, fuel, landfill
    // water_ded=floor(25/10)=2, elec_ded=floor(1.5/0.5)=3, fuel=10, waste=15, tanker=10 → 60
    batch_id: 'GT-2418', product_type: 'leather_goods', units_produced: 500,
    start_date: '2024-02-10', completed_date: '2024-02-20',
    primary_material: 'Leather Hide', status: 'completed', score: 60,
    water_municipal: 20000, water_tanker: 17500,
    electricity_kwh: 1750, solar_kwh: 0,
    fuel_type: 'diesel', fuel_amount: 60,
    waste_kg: 200, waste_type: 'chemical', waste_disposal: 'landfill',
  },
  {
    // water/unit=60L tanker, elec/unit=2.8, fuel, recycler
    // water_ded=1, elec_ded=1, fuel=10, waste=5, tanker=10 → 73
    batch_id: 'GT-2419', product_type: 'leather_goods', units_produced: 600,
    start_date: '2024-04-05', completed_date: '2024-04-15',
    primary_material: 'Leather Hide', status: 'completed', score: 73,
    water_municipal: 25000, water_tanker: 11000,
    electricity_kwh: 1680, solar_kwh: 100,
    fuel_type: 'diesel', fuel_amount: 65,
    waste_kg: 230, waste_type: 'chemical', waste_disposal: 'recycler',
  },
  {
    // water/unit=48L NO tanker, elec/unit=2.5, NO fuel, recycler
    // water_ded=0, elec_ded=floor(0.5/0.5)=1, fuel=0, waste=5, tanker=0 → 94
    batch_id: 'GT-2420', product_type: 'leather_goods', units_produced: 700,
    start_date: '2024-06-05', completed_date: '2024-06-15',
    primary_material: 'Veg-Tan Leather', status: 'completed', score: 94,
    water_municipal: 33600, water_tanker: 0,
    electricity_kwh: 1750, solar_kwh: 300,
    fuel_type: null, fuel_amount: 0,
    waste_kg: 250, waste_type: 'chemical', waste_disposal: 'recycler',
  },

  // ── ACTIVE batches (in progress, no score yet) ────────────
  {
    batch_id: 'GT-2421', product_type: 'garment', units_produced: 1800,
    start_date: '2024-06-28', completed_date: '',
    primary_material: 'Cotton', status: 'active', score: null,
    water_municipal: 54000, water_tanker: 0,
    electricity_kwh: 2700, solar_kwh: 600,
    fuel_type: null, fuel_amount: 0,
    waste_kg: 400, waste_type: 'fabric_offcuts', waste_disposal: 'composted',
  },
  {
    batch_id: 'GT-2422', product_type: 'garment', units_produced: 1000,
    start_date: '2024-07-01', completed_date: '',
    primary_material: 'Polyester Blend', status: 'active', score: null,
    water_municipal: 30000, water_tanker: 0,
    electricity_kwh: 1400, solar_kwh: 400,
    fuel_type: null, fuel_amount: 0,
    waste_kg: 200, waste_type: 'fabric_offcuts', waste_disposal: 'composted',
  },
  {
    batch_id: 'GT-2423', product_type: 'leather_goods', units_produced: 400,
    start_date: '2024-07-03', completed_date: '',
    primary_material: 'Synthetic Leather', status: 'active', score: null,
    water_municipal: 12000, water_tanker: 0,
    electricity_kwh: 600, solar_kwh: 200,
    fuel_type: null, fuel_amount: 0,
    waste_kg: 80, waste_type: 'mixed', waste_disposal: 'recycler',
  },
]
