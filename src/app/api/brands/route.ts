import { NextResponse } from 'next/server';
import { getBrands, createBrand, getProfile } from '@/lib/storage';

export async function GET() {
  try {
    const brands = await getBrands();
    const profile = await getProfile();
    return NextResponse.json({ brands, profile });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching brands';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, website_url, industry, known_competitors, check_frequency } = body;

    if (!name || !website_url) {
      return NextResponse.json({ error: 'Brand name and website URL are required' }, { status: 400 });
    }

    const brand = await createBrand({
      name: name.trim(),
      website_url: website_url.trim(),
      industry: industry || 'Technology',
      known_competitors: Array.isArray(known_competitors)
        ? known_competitors.filter((c: string) => c.trim().length > 0)
        : [],
      check_frequency: check_frequency || 'weekly',
    });

    return NextResponse.json({ success: true, brand });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating brand';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
