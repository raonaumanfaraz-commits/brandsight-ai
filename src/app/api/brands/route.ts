import { NextResponse } from 'next/server';
import { getBrands, createBrand, getProfile } from '@/lib/storage';
import { getAuthUser } from '@/lib/authServer';

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    const brands = await getBrands(user?.id);
    const profile = await getProfile(user?.id);
    return NextResponse.json({
      brands,
      profile,
      user: user ? { id: user.id, email: user.email } : null,
      isGuest: !user,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching brands';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Please log in or create a free account to track your brand.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, website_url, industry, known_competitors, check_frequency } = body;

    if (!name || !website_url) {
      return NextResponse.json({ error: 'Brand name and website URL are required' }, { status: 400 });
    }

    const brand = await createBrand(
      {
        name: name.trim(),
        website_url: website_url.trim(),
        industry: industry || 'Technology',
        known_competitors: Array.isArray(known_competitors)
          ? known_competitors.filter((c: string) => c.trim().length > 0)
          : [],
        check_frequency: check_frequency || 'weekly',
      },
      user.id
    );

    return NextResponse.json({ success: true, brand });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating brand';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
