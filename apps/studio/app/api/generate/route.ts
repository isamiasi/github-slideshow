import { NextResponse } from 'next/server';
import { handleGenerate } from '@/lib/route-helpers';

export async function POST(req: Request) {
  const body = await req.json();
  const result = await handleGenerate(body);
  return NextResponse.json(result.json, { status: result.status });
}
