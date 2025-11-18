import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/lib/services'
import { handleApiError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const communityId = searchParams.get('communityId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!communityId) {
      return NextResponse.json(
        { error: 'communityId is required' },
        { status: 400 }
      )
    }

    const analytics = await analyticsService.getCommunityAnalytics(communityId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })

    return NextResponse.json(analytics)
  } catch (error) {
    return handleApiError(error)
  }
}
