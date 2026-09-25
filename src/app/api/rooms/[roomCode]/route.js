import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { roomCode } = params;
    
    if (!roomCode) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { roomCode },
      include: {
        teams: true,
        players: true,
        auctionRounds: true
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Fetch room error:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}
