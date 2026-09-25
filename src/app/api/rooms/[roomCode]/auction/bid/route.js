import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { roomCode } = params;
    const { teamId, playerId, amount, secretCode } = await request.json();

    const room = await prisma.room.findUnique({
      where: { roomCode }
    });

    if (!room || room.status !== 'live') {
      return NextResponse.json({ error: 'Auction is not live' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { players: true }
    });

    if (!team || team.secretCode !== secretCode) {
      return NextResponse.json({ error: 'Unauthorized team access' }, { status: 401 });
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId }
    });

    if (!player || player.status !== 'in_auction') {
      return NextResponse.json({ error: 'Player is not in auction' }, { status: 400 });
    }

    // Get current highest bid
    const latestBid = await prisma.bidLog.findFirst({
      where: { playerId },
      orderBy: { amount: 'desc' }
    });

    const currentHighest = latestBid ? latestBid.amount : 0;
    
    if (amount <= currentHighest || amount < player.basePrice) {
      return NextResponse.json({ error: 'Bid amount is too low' }, { status: 400 });
    }

    // Budget check
    const totalSpent = team.players.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
    const availablePool = team.poolLimit - totalSpent;
    
    // Very basic check - can refine later with min squad sizes
    if (amount > availablePool) {
      return NextResponse.json({ error: 'Insufficient budget' }, { status: 400 });
    }

    // Create the bid
    await prisma.bidLog.create({
      data: {
        roomId: room.id,
        playerId,
        teamId,
        amount
      }
    });

    return NextResponse.json({ success: true, amount });
  } catch (error) {
    console.error('Bid error:', error);
    return NextResponse.json({ error: 'Failed to place bid' }, { status: 500 });
  }
}
