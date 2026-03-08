import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await verifySession();

    if (!session || !session.userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { id: true, username: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
