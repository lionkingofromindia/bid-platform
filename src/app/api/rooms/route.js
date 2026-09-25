import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, minTeamSize, maxTeamSize, deadlineDate } = body;

    if (!name) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    // Generate a unique 6-character room code
    const roomCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const room = await prisma.room.create({
      data: {
        name,
        roomCode,
        minTeamSize: minTeamSize ? parseInt(minTeamSize) : 11,
        maxTeamSize: maxTeamSize ? parseInt(maxTeamSize) : 15,
        deadlineDate: deadlineDate ? new Date(deadlineDate) : null,
      }
    });

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
