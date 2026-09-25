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

    // Set round to active
    await prisma.auctionRound.update({
      where: { id: roundId },
      data: { status: 'active' }
    });

    // Find the first player in playerOrder that is unsold
    // We will set their status to 'in_auction'
    const players = await prisma.player.findMany({
      where: { id: { in: round.playerOrder } }
    });

    // Map players to their order
    const orderedPlayers = round.playerOrder.map(pid => players.find(p => p.id === pid)).filter(Boolean);
    const nextPlayer = orderedPlayers.find(p => p.status === 'unsold');

    if (nextPlayer) {
      await prisma.player.update({
        where: { id: nextPlayer.id },
        data: { status: 'in_auction' }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Start round error:', error);
    return NextResponse.json({ error: 'Failed to start round' }, { status: 500 });
  }
}
