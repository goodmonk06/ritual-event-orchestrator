import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const createTagSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  category: z.enum(['general', 'ritual_type', 'theme', 'skill_level', 'duration', 'format']).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const tags = await prisma.tag.findMany({
      where: category ? { category: category as any } : undefined,
      include: {
        _count: {
          select: {
            templates: true,
            instances: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(tags)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createTagSchema.parse(body)

    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-')

    const tag = await prisma.tag.create({
      data: {
        ...data,
        slug,
      },
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
