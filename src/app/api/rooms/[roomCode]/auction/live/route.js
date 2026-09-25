import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { roomCode } = params;

    const room = await prisma.room.findUnique({
      where: { roomCode },
      include: {
        teams: true,
        auctionRounds: {
          where: { status: 'active' }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const activeRound = room.auctionRounds[0];
    if (!activeRound) {
      return NextResponse.json({ currentPlayer: null, highestBid: null, teams: room.teams });
    }

    // Find the player currently in_auction
    const currentPlayer = await prisma.player.findFirst({
      where: { 
        roomId: room.id,
        status: 'in_auction',
        id: { in: activeRound.playerOrder }
      }
    });

    let highestBid = null;
    if (currentPlayer) {
      // Fetch latest bid
      const latestBid = await prisma.bidLog.findFirst({
        where: { playerId: currentPlayer.id },
        orderBy: { amount: 'desc' } // Assuming highest amount is latest for simplicity, or timestamp desc
      });
      highestBid = latestBid;
    }

    return NextResponse.json({
      currentPlayer,
      highestBid,
      teams: room.teams
    });
  } catch (error) {
    console.error('Live auction get error:', error);
    return NextResponse.json({ error: 'Failed to fetch live auction' }, { status: 500 });
  }
}
