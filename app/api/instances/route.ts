import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createInstanceSchema = z.object({
  templateId: z.string(),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
})

// GET /api/instances - List all instances
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const templateId = searchParams.get('templateId')
    const upcoming = searchParams.get('upcoming') === 'true'

    const where: any = {}

    if (status) {
      where.status = status
    }
    if (templateId) {
      where.templateId = templateId
    }
    if (upcoming) {
      where.scheduledStart = { gte: new Date() }
      where.status = 'scheduled'
    }

    const instances = await prisma.ritualInstance.findMany({
      where,
      include: {
        template: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: { scheduledStart: 'desc' },
    })

    return NextResponse.json(instances)
  } catch (error) {
    console.error('Error fetching instances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch instances' },
      { status: 500 }
    )
  }
}

// POST /api/instances - Create a new instance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createInstanceSchema.parse(body)

    const instance = await prisma.ritualInstance.create({
      data: {
        templateId: data.templateId,
        scheduledStart: new Date(data.scheduledStart),
        scheduledEnd: new Date(data.scheduledEnd),
        status: 'scheduled',
      },
      include: {
        template: true,
      },
    })

    return NextResponse.json(instance, { status: 201 })
  } catch (error) {
    console.error('Error creating instance:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create instance' },
      { status: 500 }
    )
  }
}
