import { NextResponse } from 'next/server';
import { getBrandById, updateBrand, deleteBrand, getChecks, getPrompts } from '@/lib/storage';
import { computeBrandStats } from '@/lib/stats';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const brand = await getBrandById(params.id);
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const checks = await getChecks(params.id);
    const prompts = await getPrompts(params.id);
    const stats = computeBrandStats(params.id, checks);

    return NextResponse.json({ brand, prompts, stats, checks });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching brand details';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await updateBrand(params.id, body);
    return NextResponse.json({ success: true, brand: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating brand';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteBrand(params.id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting brand';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
