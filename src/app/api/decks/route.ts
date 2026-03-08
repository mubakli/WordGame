import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/session';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decks = await prisma.deck.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { words: true }
        }
      }
    });
    return NextResponse.json(decks);
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json({ error: 'Failed to fetch decks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Deck name is required' },
        { status: 400 }
      );
    }

    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newDeck = await prisma.deck.create({
      data: {
        name: name.trim(),
        userId: session.userId,
      },
      include: {
        _count: {
          select: { words: true }
        }
      }
    });

    return NextResponse.json(newDeck, { status: 201 });
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 });
  }
}
