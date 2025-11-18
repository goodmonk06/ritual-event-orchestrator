import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const createFacilitatorSchema = z.object({
  communityId: z.string(),
  memberId: z.string(),
  name: z.string(),
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const communityId = searchParams.get('communityId')

    const facilitators = await prisma.facilitator.findMany({
      where: communityId ? { communityId } : undefined,
      include: {
        _count: {
          select: {
            instances: true,
            feedbackReceived: true,
          },
        },
      },
      orderBy: { rating: 'desc' },
    })

    return NextResponse.json(facilitators)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createFacilitatorSchema.parse(body)

    const facilitator = await prisma.facilitator.create({
      data: {
        ...data,
        specialties: data.specialties ? JSON.stringify(data.specialties) : undefined,
      },
    })

    return NextResponse.json(facilitator, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
