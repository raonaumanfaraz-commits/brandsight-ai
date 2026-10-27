import { NextResponse } from 'next/server';
import { getBrandById, updateBrand, deleteBrand, getChecks, getPrompts } from '@/lib/storage';
import { computeBrandStats } from '@/lib/stats';
import { getAuthUser } from '@/lib/authServer';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    const brand = await getBrandById(params.id, user?.id);
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found or access denied' }, { status: 404 });
    }

    const checks = await getChecks(params.id, user?.id);
    const prompts = await getPrompts(params.id, user?.id);
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
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updateBrand(params.id, body, user.id);
    return NextResponse.json({ success: true, brand: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating brand';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    await deleteBrand(params.id, user.id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting brand';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
