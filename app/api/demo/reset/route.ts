import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase/client'
import { seedDemoData } from '@/lib/demo/seeder'

export async function POST() {
  try {
    const client = getServiceClient()
    await seedDemoData(client)
    return NextResponse.json({ ok: true, message: 'Demo data seeded successfully.' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Demo Reset]', message)
    return NextResponse.json(
      { error: `Failed to seed demo data: ${message}` },
      { status: 500 }
    )
  }
}
