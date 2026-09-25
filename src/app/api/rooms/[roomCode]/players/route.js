import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { roomCode } = params;
    const body = await request.json();
    const { players } = body; // Array of player objects

    if (!players || !Array.isArray(players) || players.length === 0) {
      return NextResponse.json({ error: 'Valid players array is required' }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { roomCode }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Format for bulk insert
    const playersData = players.map(p => ({
      roomId: room.id,
      playerId: p.playerId || String(Math.floor(Math.random() * 10000)),
      name: p.name,
      category: p.category || 'Uncategorized',
      basePrice: parseInt(p.basePrice) || 0,
      photo: p.photo || null,
    }));

    const result = await prisma.player.createMany({
      data: playersData,
      skipDuplicates: true, // Assuming no duplicates constraint if playerId was unique per room, but right now we don't have it.
    });

    return NextResponse.json({ success: true, count: result.count }, { status: 201 });
  } catch (error) {
    console.error('Add players error:', error);
    return NextResponse.json({ error: 'Failed to add players' }, { status: 500 });
  }
}
