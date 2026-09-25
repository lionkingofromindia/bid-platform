import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { secretCode } = body;

    if (!secretCode) {
      return NextResponse.json({ error: 'Secret code is required' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { secretCode },
      include: {
        room: true
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Invalid team code' }, { status: 404 });
    }

    return NextResponse.json({ 
      teamId: team.id,
      roomId: team.roomId,
      roomCode: team.room.roomCode,
      name: team.name
    });
  } catch (error) {
    console.error('Verify team error:', error);
    return NextResponse.json({ error: 'Failed to verify team' }, { status: 500 });
  }
}
