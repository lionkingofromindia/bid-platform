import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request, { params }) {
  try {
    const { roomCode } = params;
    const body = await request.json();
    const { name, poolLimit, captainName } = body;

    if (!name || !poolLimit) {
      return NextResponse.json({ error: 'Team name and pool limit are required' }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { roomCode }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Generate a unique 8-character team secret code
    const secretCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const team = await prisma.team.create({
      data: {
        roomId: room.id,
        name,
        poolLimit: parseInt(poolLimit),
        captainName: captainName || null,
        secretCode,
      }
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
