import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { roomCode } = params;
    const url = new URL(request.url);
    const secretCode = url.searchParams.get('secretCode');

    if (!secretCode) {
      return NextResponse.json({ error: 'Secret code is required' }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { roomCode },
      include: {
        teams: {
          include: { players: true }
        },
        auctionRounds: {
          where: { status: 'active' }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const team = room.teams.find(t => t.secretCode === secretCode);
    if (!team) {
      return NextResponse.json({ error: 'Invalid secret code' }, { status: 401 });
    }

    // Fetch live auction info
    const activeRound = room.auctionRounds[0];
    let currentPlayer = null;
    let highestBid = null;

    if (activeRound) {
      currentPlayer = await prisma.player.findFirst({
        where: { 
          roomId: room.id,
          status: 'in_auction',
          id: { in: activeRound.playerOrder }
        }
      });

      if (currentPlayer) {
        highestBid = await prisma.bidLog.findFirst({
          where: { playerId: currentPlayer.id },
          orderBy: { amount: 'desc' }
        });
        
        if (highestBid) {
          const biddingTeam = room.teams.find(t => t.id === highestBid.teamId);
          highestBid.teamName = biddingTeam ? biddingTeam.name : 'Unknown';
        }
      }
    }

    // Calculate total spent
    const totalSpent = team.players.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
    const availablePool = team.poolLimit - totalSpent;

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        poolLimit: team.poolLimit,
        totalSpent,
        availablePool,
        roster: team.players
      },
      liveAuction: {
        currentPlayer,
        highestBid,
      },
      room: {
        status: room.status,
        minTeamSize: room.minTeamSize,
        maxTeamSize: room.maxTeamSize
      }
    });
  } catch (error) {
    console.error('Team dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch team dashboard' }, { status: 500 });
  }
}
