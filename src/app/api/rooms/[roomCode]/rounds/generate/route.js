import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { roomCode } = params;

    const room = await prisma.room.findUnique({
      where: { roomCode },
      include: {
        players: true,
        auctionRounds: true
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.auctionRounds.length > 0) {
      return NextResponse.json({ error: 'Rounds have already been generated' }, { status: 400 });
    }

    // Group players by category
    const categories = [...new Set(room.players.map(p => p.category))];
    
    const rounds = [];
    
    for (const cat of categories) {
      const playersInCat = room.players.filter(p => p.category === cat);
      // Shuffle players randomly
      const shuffled = playersInCat.sort(() => 0.5 - Math.random());
      const playerOrder = shuffled.map(p => p.id);

      rounds.push({
        roomId: room.id,
        category: cat,
        status: 'pending',
        playerOrder,
      });
    }

    const createdRounds = await prisma.auctionRound.createMany({
      data: rounds
    });

    // Update room status
    await prisma.room.update({
      where: { id: room.id },
      data: { status: 'live' }
    });

    return NextResponse.json({ success: true, count: createdRounds.count }, { status: 201 });
  } catch (error) {
    console.error('Generate rounds error:', error);
    return NextResponse.json({ error: 'Failed to generate rounds' }, { status: 500 });
  }
}
