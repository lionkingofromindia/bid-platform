import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { roomCode } = params;
    const { playerId, teamId, price } = await request.json();

    const room = await prisma.room.findUnique({
      where: { roomCode },
      include: { auctionRounds: { where: { status: 'active' } } }
    });

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    // Update the player
    await prisma.player.update({
      where: { id: playerId },
      data: {
        status: 'sold',
        soldToTeamId: teamId,
        soldPrice: price
      }
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
    console.error('Sell error:', error);
    return NextResponse.json({ error: 'Failed to sell player' }, { status: 500 });
  }
}
