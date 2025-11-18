import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const registerParticipantSchema = z.object({
  memberId: z.string(),
})

// GET /api/instances/[id]/participants - Get all participants for an instance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const participants = await prisma.participantRegistration.findMany({
      where: { ritualInstanceId: params.id },
      orderBy: { registeredAt: 'asc' },
    })

    return NextResponse.json(participants)
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    )
  }
}

// POST /api/instances/[id]/participants - Register a participant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { memberId } = registerParticipantSchema.parse(body)

    const participant = await prisma.participantRegistration.create({
      data: {
        ritualInstanceId: params.id,
        memberId,
        status: 'registered',
      },
    })

    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    console.error('Error registering participant:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    // Handle unique constraint violation
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Participant already registered' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to register participant' },
      { status: 500 }
    )
  }
}
