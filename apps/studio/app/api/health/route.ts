import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'nguyen-minh-ha-studio', now: new Date().toISOString() });
}
