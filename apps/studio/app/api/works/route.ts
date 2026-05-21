import { NextResponse } from 'next/server';
import { handleCreateWork, handleListWorksPaginated } from '@/lib/route-helpers';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') ?? '20');
  const offset = Number(searchParams.get('offset') ?? '0');
  const emotion = searchParams.get('emotion') ?? '';
  const query = searchParams.get('query') ?? '';
  const result = await handleListWorksPaginated({ limit, offset, emotion, query });
  return NextResponse.json(result.json, { status: result.status });
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await handleCreateWork(body);
  return NextResponse.json(result.json, { status: result.status });
}
