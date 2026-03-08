import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/session';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 });
    }

    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deck = await prisma.deck.findUnique({ where: { id } });
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }
    if (deck.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Attempt to delete it. Cascade will drop associated words automatically based on prisma schema.
    await prisma.deck.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Deck deleted successfully' });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json({ error: 'Failed to delete deck' }, { status: 500 });
  }
}
