import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createStepSchema = z.object({
  orderIndex: z.number(),
  stepType: z.enum(['talk', 'meditation', 'breakout', 'sharing', 'exercise']),
  title: z.string(),
  instructionsMarkdown: z.string().optional(),
  durationMinutes: z.number().optional(),
  metadataJson: z.string().optional(),
})

const updateStepsSchema = z.array(
  z.object({
    id: z.string().optional(),
    orderIndex: z.number(),
    stepType: z.enum(['talk', 'meditation', 'breakout', 'sharing', 'exercise']),
    title: z.string(),
    instructionsMarkdown: z.string().optional(),
    durationMinutes: z.number().optional(),
    metadataJson: z.string().optional(),
  })
)

// GET /api/templates/[id]/steps - Get all steps for a template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const steps = await prisma.ritualStep.findMany({
      where: { templateId: params.id },
      orderBy: { orderIndex: 'asc' },
    })

    return NextResponse.json(steps)
  } catch (error) {
    console.error('Error fetching steps:', error)
    return NextResponse.json(
      { error: 'Failed to fetch steps' },
      { status: 500 }
    )
  }
}

// POST /api/templates/[id]/steps - Create a new step
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = createStepSchema.parse(body)

    const step = await prisma.ritualStep.create({
      data: {
        ...data,
        templateId: params.id,
      },
    })

    return NextResponse.json(step, { status: 201 })
  } catch (error) {
    console.error('Error creating step:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create step' },
      { status: 500 }
    )
  }
}

// PUT /api/templates/[id]/steps - Batch update all steps (for reordering)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const stepsData = updateStepsSchema.parse(body)

    // Delete all existing steps and create new ones
    await prisma.$transaction(async (tx) => {
      await tx.ritualStep.deleteMany({
        where: { templateId: params.id },
      })

      for (const stepData of stepsData) {
        await tx.ritualStep.create({
          data: {
            ...stepData,
            templateId: params.id,
          },
        })
      }
    })

    const updatedSteps = await prisma.ritualStep.findMany({
      where: { templateId: params.id },
      orderBy: { orderIndex: 'asc' },
    })

    return NextResponse.json(updatedSteps)
  } catch (error) {
    console.error('Error updating steps:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update steps' },
      { status: 500 }
    )
  }
}
