import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateTemplateSchema = z.object({
  name: z.string().optional(),
  descriptionMarkdown: z.string().optional(),
  ritualType: z.enum(['live_call', 'asynchronous_challenge', 'hybrid']).optional(),
  defaultDurationMinutes: z.number().optional(),
  defaultTagsJson: z.string().optional(),
})

// GET /api/templates/[id] - Get a single template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.ritualTemplate.findUnique({
      where: { id: params.id },
      include: {
        steps: {
          orderBy: { orderIndex: 'asc' },
        },
        instances: {
          orderBy: { scheduledStart: 'desc' },
          take: 10,
        },
      },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

// PATCH /api/templates/[id] - Update a template
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = updateTemplateSchema.parse(body)

    const template = await prisma.ritualTemplate.update({
      where: { id: params.id },
      data,
      include: {
        steps: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error updating template:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.ritualTemplate.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
