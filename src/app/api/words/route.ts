import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/session';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get('deckId');

    if (!deckId) {
      return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 });
    }

    // Verify ownership of the deck
    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck || deck.userId !== session.userId) {
      return NextResponse.json({ error: 'Deck not found or forbidden' }, { status: 403 });
    }

    const words = await prisma.word.findMany({
      where: { deckId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(words);
  } catch (error) {
    console.error('Error fetching words:', error);
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { english, turkish, deckId } = body;

    if (!english || !turkish || !deckId) {
      return NextResponse.json(
        { error: 'English, Turkish, and Deck ID are required' },
        { status: 400 }
      );
    }

    if (english.length > 255 || turkish.length > 255) {
      return NextResponse.json(
        { error: 'Words cannot exceed 255 characters' },
        { status: 400 }
      );
    }

    // Verify ownership of the deck
    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck || deck.userId !== session.userId) {
      return NextResponse.json({ error: 'Deck not found or forbidden' }, { status: 403 });
    }

    const newWord = await prisma.word.create({
      data: {
        english: english.trim(),
        turkish: turkish.trim(),
        deckId: deckId,
      },
    });

    return NextResponse.json(newWord, { status: 201 });
  } catch (error) {
    console.error('Error creating word:', error);
    return NextResponse.json({ error: 'Failed to create word' }, { status: 500 });
  }
}
