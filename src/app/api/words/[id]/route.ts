import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/session';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // In Next.js 15, route params map is a Promise
) {
  try {
    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Word ID is required' }, { status: 400 });
    }

    // Verify ownership of the word's deck
    const word = await prisma.word.findUnique({ 
      where: { id },
      include: { deck: true } 
    });

    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    if (word.deck.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.word.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Word deleted successfully' });
  } catch (error) {
    console.error('Error deleting word:', error);
    return NextResponse.json({ error: 'Failed to delete word' }, { status: 500 });
  }
}
