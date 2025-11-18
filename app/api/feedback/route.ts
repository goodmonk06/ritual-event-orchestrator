import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/errors'
import { eventEmitter } from '@/lib/events'
import { z } from 'zod'

const createFeedbackSchema = z.object({
  ritualInstanceId: z.string(),
  facilitatorId: z.string().optional(),
  memberId: z.string(),
  contentRating: z.number().min(1).max(5).optional(),
  facilitationRating: z.number().min(1).max(5).optional(),
  energyRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
  highlights: z.string().optional(),
  improvements: z.string().optional(),
  comments: z.string().optional(),
  wouldRecommend: z.boolean().optional(),
  wouldAttendAgain: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createFeedbackSchema.parse(body)

    const feedback = await prisma.ritualFeedback.create({
      data,
    })

    // Emit event
    await eventEmitter.emit('feedback.submitted', {
      feedbackId: feedback.id,
      instanceId: feedback.ritualInstanceId,
      memberId: feedback.memberId,
      facilitatorId: feedback.facilitatorId || undefined,
      ratings: {
        content: feedback.contentRating || undefined,
        facilitation: feedback.facilitationRating || undefined,
        energy: feedback.energyRating || undefined,
        value: feedback.valueRating || undefined,
      },
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
