import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { roomCode } = params;
    const { playerId } = await request.json();

    const room = await prisma.room.findUnique({
      where: { roomCode },
      include: { auctionRounds: { where: { status: 'active' } } }
    });

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    // Update the player to skipped/unsold (we use 'skipped' to indicate they were seen but not bought, 
    // so they don't show up again in this round, but are available for post-auction pool)
    await prisma.player.update({
      where: { id: playerId },
      data: { status: 'skipped' }
    });

    // Move next player to in_auction
    const activeRound = room.auctionRounds[0];
    if (activeRound) {
      const players = await prisma.player.findMany({
        where: { id: { in: activeRound.playerOrder } }
      });
      const orderedPlayers = activeRound.playerOrder.map(pid => players.find(p => p.id === pid)).filter(Boolean);
      const nextPlayer = orderedPlayers.find(p => p.status === 'unsold');

      if (nextPlayer) {
        await prisma.player.update({
          where: { id: nextPlayer.id },
          data: { status: 'in_auction' }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unsold error:', error);
    return NextResponse.json({ error: 'Failed to mark unsold' }, { status: 500 });
  }
}
