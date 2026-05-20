-- ============================================================
-- TRACE — Sustainability Tracker for Indian SME Manufacturers
-- Run this in Supabase SQL Editor to create all tables
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLE: batches
-- ============================================================
create table if not exists batches (
  id              uuid primary key default gen_random_uuid(),
  batch_id        text not null,                        -- operational ID e.g. "GT-2407"
  product_type    text not null,                        -- garment / leather_goods / food / ceramic / paper / other
  units_produced  integer not null,
  start_date      date not null,
  primary_material text not null,
  status          text not null default 'active',       -- 'active' | 'completed'
  sustainability_score integer,                         -- null until completed
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- TABLE: resource_logs
-- Unified single-table for all resource types
-- ============================================================
create table if not exists resource_logs (
  id              uuid primary key default gen_random_uuid(),
  batch_uuid      uuid not null references batches(id) on delete cascade,
  resource_type   text not null,   -- 'water' | 'electricity' | 'fuel' | 'waste'
  amount          numeric not null,
  unit            text,            -- 'litres' | 'kWh' | 'litres_diesel' | 'kg_lpg' | 'kg'
  source          text,            -- water: 'municipal' | 'borewell' | 'tanker'
  subtype         text,            -- fuel type: 'diesel'|'lpg'|'coal' | waste: 'fabric_offcuts'|'chemical'|'food'|'mixed'
  disposal_method text,            -- waste: 'landfill' | 'recycler' | 'composted' | 'unknown'
  solar_units     numeric,         -- electricity solar contribution kWh
  cost_per_litre  numeric,         -- tanker water cost per litre
  note            text,
  entry_date      date not null,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- TABLE: batch_reports
-- Immutable snapshot — generated once when batch is completed
-- ============================================================
create table if not exists batch_reports (
  id                  uuid primary key default gen_random_uuid(),
  batch_uuid          uuid not null references batches(id) on delete cascade,
  score               integer not null,
  water_total         numeric not null default 0,
  water_per_unit      numeric not null default 0,
  electricity_total   numeric not null default 0,
  electricity_per_unit numeric not null default 0,
  fuel_total          numeric not null default 0,
  fuel_per_unit       numeric not null default 0,
  waste_total         numeric not null default 0,
  waste_per_unit      numeric not null default 0,
  deductions_json     jsonb not null default '{}',
  comparison_json     jsonb,       -- null if no previous batch of same type
  observation         text not null,
  generated_at        timestamptz not null default now()
);

-- ============================================================
-- Indexes for common queries
-- ============================================================
create index if not exists idx_batches_product_type on batches(product_type);
create index if not exists idx_batches_status on batches(status);
create index if not exists idx_batches_is_demo on batches(is_demo);
create index if not exists idx_resource_logs_batch_uuid on resource_logs(batch_uuid);
create index if not exists idx_resource_logs_resource_type on resource_logs(resource_type);
create index if not exists idx_batch_reports_batch_uuid on batch_reports(batch_uuid);

-- ============================================================
-- DISABLE RLS (no auth in this app)
-- ============================================================
alter table batches disable row level security;
alter table resource_logs disable row level security;
alter table batch_reports disable row level security;

-- ============================================================
-- Updated_at trigger for batches
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists batches_updated_at on batches;
create trigger batches_updated_at
  before update on batches
  for each row execute function update_updated_at();
