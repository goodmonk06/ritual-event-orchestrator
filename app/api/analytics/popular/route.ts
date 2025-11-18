import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/lib/services'
import { handleApiError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const communityId = searchParams.get('communityId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!communityId) {
      return NextResponse.json(
        { error: 'communityId is required' },
        { status: 400 }
      )
    }

    const popularRituals = await analyticsService.getPopularRituals(communityId, limit)

    return NextResponse.json(popularRituals)
  } catch (error) {
    return handleApiError(error)
  }
}
