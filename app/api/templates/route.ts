import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createTemplateSchema = z.object({
  communityId: z.string(),
  key: z.string(),
  name: z.string(),
  descriptionMarkdown: z.string().optional(),
  ritualType: z.enum(['live_call', 'asynchronous_challenge', 'hybrid']),
  defaultDurationMinutes: z.number().optional(),
  defaultTagsJson: z.string().optional(),
})

// GET /api/templates - List all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const communityId = searchParams.get('communityId')

    const templates = await prisma.ritualTemplate.findMany({
      where: communityId ? { communityId } : undefined,
      include: {
        steps: {
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { instances: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createTemplateSchema.parse(body)

    const template = await prisma.ritualTemplate.create({
      data,
      include: {
        steps: true,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
