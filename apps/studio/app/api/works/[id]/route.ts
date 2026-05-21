import { NextResponse } from 'next/server';
import { handleDeleteWorkById, handleGetWorkById, handleUpdateWorkById } from '@/lib/route-helpers';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await handleGetWorkById(id);
  return NextResponse.json(result.json, { status: result.status });
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();
  const result = await handleUpdateWorkById(id, body);
  return NextResponse.json(result.json, { status: result.status });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await handleDeleteWorkById(id);
  return NextResponse.json(result.json, { status: result.status });
}
