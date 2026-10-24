import { NextResponse } from 'next/server';
import { getPrompts, createPrompt, deletePrompt } from '@/lib/storage';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get('brandId') || undefined;
    const prompts = await getPrompts(brandId);
    return NextResponse.json({ prompts });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching prompts';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brand_id, query_text, category } = body;

    if (!brand_id || !query_text) {
      return NextResponse.json({ error: 'brand_id and query_text are required' }, { status: 400 });
    }

    const prompt = await createPrompt({
      brand_id,
      query_text: query_text.trim(),
      category: category || 'General',
      is_active: true,
    });

    return NextResponse.json({ success: true, prompt });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error adding prompt';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    await deletePrompt(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting prompt';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
