import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleRitualCompletion } from '@/lib/integrations'

// GET /api/instances/[id] - Get a single instance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instance = await prisma.ritualInstance.findUnique({
      where: { id: params.id },
      include: {
        template: {
          include: {
            steps: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        participants: {
          orderBy: { registeredAt: 'asc' },
        },
        outcomes: true,
      },
    })

    if (!instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(instance)
  } catch (error) {
    console.error('Error fetching instance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch instance' },
      { status: 500 }
    )
  }
}

// PATCH /api/instances/[id] - Update instance (e.g., change status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    const instance = await prisma.ritualInstance.update({
      where: { id: params.id },
      data: {
        status,
      },
      include: {
        template: true,
        participants: {
          where: {
            status: 'attended',
          },
        },
      },
    })

    // If status is changed to 'completed', trigger integrations
    if (status === 'completed') {
      const attendedParticipantIds = instance.participants.map(p => p.memberId)

      await handleRitualCompletion({
        ritualInstanceId: instance.id,
        ritualTemplateKey: instance.template.key,
        ritualName: instance.template.name,
        attendedParticipantIds,
      })
    }

    return NextResponse.json(instance)
  } catch (error) {
    console.error('Error updating instance:', error)
    return NextResponse.json(
      { error: 'Failed to update instance' },
      { status: 500 }
    )
  }
}

// DELETE /api/instances/[id] - Delete an instance
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.ritualInstance.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting instance:', error)
    return NextResponse.json(
      { error: 'Failed to delete instance' },
      { status: 500 }
    )
  }
}
