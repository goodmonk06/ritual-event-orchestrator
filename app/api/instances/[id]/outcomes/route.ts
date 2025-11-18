import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createOutcomeSchema = z.object({
  memberId: z.string(),
  notesMarkdown: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  tagsJson: z.string().optional(),
})

// GET /api/instances/[id]/outcomes - Get all outcomes for an instance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const outcomes = await prisma.outcomeRecord.findMany({
      where: { ritualInstanceId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(outcomes)
  } catch (error) {
    console.error('Error fetching outcomes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outcomes' },
      { status: 500 }
    )
  }
}

// POST /api/instances/[id]/outcomes - Create an outcome record
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = createOutcomeSchema.parse(body)

    const outcome = await prisma.outcomeRecord.create({
      data: {
        ritualInstanceId: params.id,
        ...data,
      },
    })

    return NextResponse.json(outcome, { status: 201 })
  } catch (error) {
    console.error('Error creating outcome:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create outcome' },
      { status: 500 }
    )
  }
}
