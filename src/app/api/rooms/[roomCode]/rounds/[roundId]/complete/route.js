import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { roomCode, roundId } = params;

    const round = await prisma.auctionRound.findUnique({
      where: { id: roundId },
      include: { room: true }
    });

    if (!round || round.room.roomCode !== roomCode) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    await prisma.auctionRound.update({
      where: { id: roundId },
      data: { status: 'completed' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Complete round error:', error);
    return NextResponse.json({ error: 'Failed to complete round' }, { status: 500 });
  }
}
