import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateParticipantSchema = z.object({
  status: z.enum(['registered', 'attended', 'no_show']).optional(),
  checkIn: z.boolean().optional(),
  checkOut: z.boolean().optional(),
})

// PATCH /api/instances/[id]/participants/[participantId] - Update participant status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; participantId: string } }
) {
  try {
    const body = await request.json()
    const { status, checkIn, checkOut } = updateParticipantSchema.parse(body)

    const updateData: any = {}

    if (status) {
      updateData.status = status
    }
    if (checkIn) {
      updateData.checkInAt = new Date()
      updateData.status = 'attended'
    }
    if (checkOut) {
      updateData.checkOutAt = new Date()
    }

    const participant = await prisma.participantRegistration.update({
      where: { id: params.participantId },
      data: updateData,
    })

    return NextResponse.json(participant)
  } catch (error) {
    console.error('Error updating participant:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    )
  }
}

// DELETE /api/instances/[id]/participants/[participantId] - Remove participant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; participantId: string } }
) {
  try {
    await prisma.participantRegistration.delete({
      where: { id: params.participantId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing participant:', error)
    return NextResponse.json(
      { error: 'Failed to remove participant' },
      { status: 500 }
    )
  }
}
