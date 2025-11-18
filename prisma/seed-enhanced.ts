import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding enhanced database with comprehensive data...')

  // Clear existing data in correct order
  console.log('Clearing existing data...')
  await prisma.ritualFeedback.deleteMany()
  await prisma.outcomeRecord.deleteMany()
  await prisma.participantRegistration.deleteMany()
  await prisma.instanceTag.deleteMany()
  await prisma.templateTag.deleteMany()
  await prisma.ritualInstance.deleteMany()
  await prisma.ritualStep.deleteMany()
  await prisma.ritualSeries.deleteMany()
  await prisma.ritualTemplate.deleteMany()
  await prisma.facilitator.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.community.deleteMany()

  console.log('✓ Cleared existing data')

  // Create Communities
  const mainCommunity = await prisma.community.create({
    data: {
      name: 'Awakening Collective',
      slug: 'awakening-collective',
      descriptionMarkdown: `A vibrant community dedicated to conscious living, spiritual growth, and collective transformation.

We gather regularly for rituals, ceremonies, and practices that deepen our connection to ourselves, each other, and the greater web of life.`,
      isActive: true,
    },
  })

  const secondCommunity = await prisma.community.create({
    data: {
      name: 'Inner Work Lab',
      slug: 'inner-work-lab',
      descriptionMarkdown: `An experimental space for deep personal transformation through shadow work, integration practices, and authentic relating.`,
      isActive: true,
    },
  })

  console.log('✓ Created communities')

  // Create Tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Moon Ritual', slug: 'moon-ritual', category: 'ritual_type', color: '#818CF8' } }),
    prisma.tag.create({ data: { name: 'Meditation', slug: 'meditation', category: 'ritual_type', color: '#A78BFA' } }),
    prisma.tag.create({ data: { name: 'Breathwork', slug: 'breathwork', category: 'ritual_type', color: '#EC4899' } }),
    prisma.tag.create({ data: { name: 'Shadow Work', slug: 'shadow-work', category: 'theme', color: '#8B5CF6' } }),
    prisma.tag.create({ data: { name: 'Intention Setting', slug: 'intention-setting', category: 'theme', color: '#06B6D4' } }),
    prisma.tag.create({ data: { name: 'Community', slug: 'community', category: 'theme', color: '#10B981' } }),
    prisma.tag.create({ data: { name: 'Beginner Friendly', slug: 'beginner-friendly', category: 'skill_level', color: '#22C55E' } }),
    prisma.tag.create({ data: { name: 'Advanced Practice', slug: 'advanced-practice', category: 'skill_level', color: '#F59E0B' } }),
    prisma.tag.create({ data: { name: '60-90 min', slug: '60-90-min', category: 'duration', color: '#6366F1' } }),
    prisma.tag.create({ data: { name: 'Online', slug: 'online', category: 'format', color: '#3B82F6' } }),
  ])

  console.log('✓ Created tags')

  // Create Facilitators
  const facilitators = await Promise.all([
    prisma.facilitator.create({
      data: {
        communityId: mainCommunity.id,
        memberId: 'member-sarah',
        name: 'Sarah Chen',
        bio: `Sacred space holder and meditation teacher with 15+ years of practice. Specializes in moon rituals, breathwork, and feminine embodiment practices.`,
        specialties: JSON.stringify(['meditation', 'breathwork', 'moon-rituals', 'feminine-embodiment']),
        rating: 4.9,
        totalRitualsLed: 127,
        isActive: true,
      },
    }),
    prisma.facilitator.create({
      data: {
        communityId: mainCommunity.id,
        memberId: 'member-marcus',
        name: 'Marcus Thompson',
        bio: `Shadow work facilitator and depth psychology practitioner. Creates brave spaces for authentic exploration of the unconscious.`,
        specialties: JSON.stringify(['shadow-work', 'depth-psychology', 'men-work', 'integration']),
        rating: 4.7,
        totalRitualsLed: 89,
        isActive: true,
      },
    }),
    prisma.facilitator.create({
      data: {
        communityId: secondCommunity.id,
        memberId: 'member-river',
        name: 'River Patel',
        bio: `Somatic practitioner and certified breathwork instructor. Weaves ancient wisdom with modern neuroscience.`,
        specialties: JSON.stringify(['breathwork', 'somatic-practice', 'trauma-healing']),
        rating: 4.8,
        totalRitualsLed: 65,
        isActive: true,
      },
    }),
  ])

  console.log('✓ Created facilitators')

  // Create Template 1: New Moon Intention Circle
  const newMoonTemplate = await prisma.ritualTemplate.create({
    data: {
      communityId: mainCommunity.id,
      key: 'new-moon-intention',
      name: 'New Moon Intention Circle',
      descriptionMarkdown: `A sacred gathering to set intentions with the new moon energy.

This ritual brings community members together to reflect on the past lunar cycle and plant seeds of intention for the cycle ahead. Through guided meditation, journaling, and circle sharing, we harness the potent new moon energy for manifestation and new beginnings.`,
      ritualType: 'live_call',
      defaultDurationMinutes: 90,
      capacity: 20,
      isPublished: true,
    },
  })

  await prisma.ritualStep.createMany({
    data: [
      {
        templateId: newMoonTemplate.id,
        orderIndex: 0,
        stepType: 'talk',
        title: 'Opening & Welcome',
        instructionsMarkdown: 'Welcome participants and create sacred space. Share guidelines for the circle.',
        durationMinutes: 10,
      },
      {
        templateId: newMoonTemplate.id,
        orderIndex: 1,
        stepType: 'meditation',
        title: 'Grounding Meditation',
        instructionsMarkdown: 'Guide participants through a grounding meditation to connect with the present moment and new moon energy.',
        durationMinutes: 15,
      },
      {
        templateId: newMoonTemplate.id,
        orderIndex: 2,
        stepType: 'exercise',
        title: 'Reflection on Past Cycle',
        instructionsMarkdown: 'Silent journaling: What did you learn in the past lunar cycle? What are you releasing?',
        durationMinutes: 10,
      },
      {
        templateId: newMoonTemplate.id,
        orderIndex: 3,
        stepType: 'sharing',
        title: 'Circle Sharing - Releases',
        instructionsMarkdown: 'Each person shares one thing they are releasing (optional). Hold space without advice-giving.',
        durationMinutes: 20,
      },
      {
        templateId: newMoonTemplate.id,
        orderIndex: 4,
        stepType: 'exercise',
        title: 'Intention Setting',
        instructionsMarkdown: 'Silent practice: Write 1-3 intentions for the coming lunar cycle. Make them specific and heart-centered.',
        durationMinutes: 10,
      },
      {
        templateId: newMoonTemplate.id,
        orderIndex: 5,
        stepType: 'sharing',
        title: 'Circle Sharing - Intentions',
        instructionsMarkdown: 'Each person shares their primary intention. The circle witnesses and affirms each intention.',
        durationMinutes: 20,
      },
      {
        templateId: newMoonTemplate.id,
        orderIndex: 6,
        stepType: 'talk',
        title: 'Closing & Integration',
        instructionsMarkdown: 'Close the circle with gratitude. Share resources for integration during the lunar cycle.',
        durationMinutes: 5,
      },
    ],
  })

  await prisma.templateTag.createMany({
    data: [
      { templateId: newMoonTemplate.id, tagId: tags[0].id }, // Moon Ritual
      { templateId: newMoonTemplate.id, tagId: tags[4].id }, // Intention Setting
      { templateId: newMoonTemplate.id, tagId: tags[5].id }, // Community
      { templateId: newMoonTemplate.id, tagId: tags[6].id }, // Beginner Friendly
      { templateId: newMoonTemplate.id, tagId: tags[8].id }, // 60-90 min
    ],
  })

  console.log('✓ Created New Moon template')

  // Create Template 2: Inner Work Weekly
  const innerWorkTemplate = await prisma.ritualTemplate.create({
    data: {
      communityId: secondCommunity.id,
      key: 'inner-work-weekly',
      name: 'Inner Work Weekly Group',
      descriptionMarkdown: `A consistent weekly practice for deep personal growth work.

This recurring ritual provides a container for members to explore shadow work, integrate insights, and support each other's transformation journey. Each week features a different theme related to personal development.`,
      ritualType: 'hybrid',
      defaultDurationMinutes: 60,
      capacity: 15,
      isPublished: true,
    },
  })

  await prisma.ritualStep.createMany({
    data: [
      { templateId: innerWorkTemplate.id, orderIndex: 0, stepType: 'talk', title: 'Check-in Round', instructionsMarkdown: 'Brief check-in: How are you arriving?', durationMinutes: 10 },
      { templateId: innerWorkTemplate.id, orderIndex: 1, stepType: 'meditation', title: 'Centering Practice', instructionsMarkdown: 'Short meditation to arrive fully present.', durationMinutes: 5 },
      { templateId: innerWorkTemplate.id, orderIndex: 2, stepType: 'talk', title: 'Weekly Theme Introduction', instructionsMarkdown: 'Introduce the theme/topic for this week.', durationMinutes: 5 },
      { templateId: innerWorkTemplate.id, orderIndex: 3, stepType: 'breakout', title: 'Small Group Exploration', instructionsMarkdown: 'Break into groups of 3-4 to explore the theme.', durationMinutes: 25 },
      { templateId: innerWorkTemplate.id, orderIndex: 4, stepType: 'sharing', title: 'Insights & Integration', instructionsMarkdown: 'Share key insights or aha moments.', durationMinutes: 10 },
      { templateId: innerWorkTemplate.id, orderIndex: 5, stepType: 'exercise', title: 'Weekly Practice Assignment', instructionsMarkdown: 'Offer a practice or reflection for the week.', durationMinutes: 5 },
    ],
  })

  await prisma.templateTag.createMany({
    data: [
      { templateId: innerWorkTemplate.id, tagId: tags[3].id }, // Shadow Work
      { templateId: innerWorkTemplate.id, tagId: tags[6].id }, // Beginner Friendly
    ],
  })

  console.log('✓ Created Inner Work template')

  // Create more templates
  const breathworkTemplate = await prisma.ritualTemplate.create({
    data: {
      communityId: mainCommunity.id,
      key: 'transformational-breathwork',
      name: 'Transformational Breathwork Journey',
      descriptionMarkdown: `An immersive breathwork experience for emotional release and expanded consciousness.`,
      ritualType: 'live_call',
      defaultDurationMinutes: 120,
      capacity: 30,
      isPublished: true,
    },
  })

  await prisma.ritualStep.createMany({
    data: [
      { templateId: breathworkTemplate.id, orderIndex: 0, stepType: 'talk', title: 'Safety & Preparation', durationMinutes: 15 },
      { templateId: breathworkTemplate.id, orderIndex: 1, stepType: 'meditation', title: 'Grounding & Intention', durationMinutes: 10 },
      { templateId: breathworkTemplate.id, orderIndex: 2, stepType: 'exercise', title: 'Breathwork Journey', durationMinutes: 60 },
      { templateId: breathworkTemplate.id, orderIndex: 3, stepType: 'meditation', title: 'Integration & Rest', durationMinutes: 20 },
      { templateId: breathworkTemplate.id, orderIndex: 4, stepType: 'sharing', title: 'Sharing Circle', durationMinutes: 15 },
    ],
  })

  await prisma.templateTag.createMany({
    data: [
      { templateId: breathworkTemplate.id, tagId: tags[2].id }, // Breathwork
      { templateId: breathworkTemplate.id, tagId: tags[7].id }, // Advanced Practice
    ],
  })

  console.log('✓ Created additional templates')

  // Create Series
  const lunarSeries = await prisma.ritualSeries.create({
    data: {
      communityId: mainCommunity.id,
      templateId: newMoonTemplate.id,
      name: 'Lunar Cycle Mastery Program',
      descriptionMarkdown: '13-month journey through the lunar cycles',
      seriesType: 'program',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      isActive: true,
    },
  })

  console.log('✓ Created series')

  // Create Instances
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Completed instance with participants and feedback
  const completedInstance = await prisma.ritualInstance.create({
    data: {
      templateId: newMoonTemplate.id,
      seriesId: lunarSeries.id,
      facilitatorId: facilitators[0].id,
      scheduledStart: twoWeeksAgo,
      scheduledEnd: new Date(twoWeeksAgo.getTime() + 90 * 60 * 1000),
      actualStart: twoWeeksAgo,
      actualEnd: new Date(twoWeeksAgo.getTime() + 95 * 60 * 1000),
      status: 'completed',
      meetingUrl: 'https://zoom.us/j/completed-session',
      capacity: 20,
    },
  })

  const completedParticipants = await Promise.all([
    prisma.participantRegistration.create({ data: { ritualInstanceId: completedInstance.id, memberId: 'alice', status: 'attended', checkInAt: twoWeeksAgo, checkOutAt: new Date(twoWeeksAgo.getTime() + 95 * 60 * 1000) } }),
    prisma.participantRegistration.create({ data: { ritualInstanceId: completedInstance.id, memberId: 'bob', status: 'attended', checkInAt: twoWeeksAgo, checkOutAt: new Date(twoWeeksAgo.getTime() + 90 * 60 * 1000) } }),
    prisma.participantRegistration.create({ data: { ritualInstanceId: completedInstance.id, memberId: 'carol', status: 'attended', checkInAt: twoWeeksAgo } }),
    prisma.participantRegistration.create({ data: { ritualInstanceId: completedInstance.id, memberId: 'david', status: 'no_show' } }),
  ])

  // Add feedback
  await prisma.ritualFeedback.createMany({
    data: [
      {
        ritualInstanceId: completedInstance.id,
        facilitatorId: facilitators[0].id,
        memberId: 'alice',
        contentRating: 5,
        facilitationRating: 5,
        energyRating: 5,
        valueRating: 5,
        highlights: 'Sarah created such a beautiful, safe space. The intention-setting practice was powerful.',
        wouldRecommend: true,
        wouldAttendAgain: true,
      },
      {
        ritualInstanceId: completedInstance.id,
        facilitatorId: facilitators[0].id,
        memberId: 'bob',
        contentRating: 4,
        facilitationRating: 5,
        energyRating: 4,
        valueRating: 5,
        highlights: 'Loved the community sharing portion.',
        improvements: 'Could use more time for journaling.',
        wouldRecommend: true,
        wouldAttendAgain: true,
      },
    ],
  })

  // Upcoming instances
  const upcomingInstance1 = await prisma.ritualInstance.create({
    data: {
      templateId: newMoonTemplate.id,
      seriesId: lunarSeries.id,
      facilitatorId: facilitators[0].id,
      scheduledStart: nextWeek,
      scheduledEnd: new Date(nextWeek.getTime() + 90 * 60 * 1000),
      status: 'scheduled',
      meetingUrl: 'https://zoom.us/j/upcoming-session-1',
    },
  })

  await Promise.all([
    prisma.participantRegistration.create({ data: { ritualInstanceId: upcomingInstance1.id, memberId: 'alice', status: 'registered' } }),
    prisma.participantRegistration.create({ data: { ritualInstanceId: upcomingInstance1.id, memberId: 'eve', status: 'registered' } }),
    prisma.participantRegistration.create({ data: { ritualInstanceId: upcomingInstance1.id, memberId: 'frank', status: 'registered' } }),
  ])

  const upcomingInstance2 = await prisma.ritualInstance.create({
    data: {
      templateId: breathworkTemplate.id,
      facilitatorId: facilitators[2].id,
      scheduledStart: nextMonth,
      scheduledEnd: new Date(nextMonth.getTime() + 120 * 60 * 1000),
      status: 'scheduled',
      meetingUrl: 'https://zoom.us/j/breathwork-journey',
    },
  })

  console.log('✓ Created instances with participants and feedback')

  // Summary
  const stats = {
    communities: await prisma.community.count(),
    facilitators: await prisma.facilitator.count(),
    tags: await prisma.tag.count(),
    templates: await prisma.ritualTemplate.count(),
    series: await prisma.ritualSeries.count(),
    instances: await prisma.ritualInstance.count(),
    participants: await prisma.participantRegistration.count(),
    feedback: await prisma.ritualFeedback.count(),
  }

  console.log('\n🎉 Enhanced seeding completed successfully!')
  console.log('📊 Database statistics:')
  console.log(`  - Communities: ${stats.communities}`)
  console.log(`  - Facilitators: ${stats.facilitators}`)
  console.log(`  - Tags: ${stats.tags}`)
  console.log(`  - Templates: ${stats.templates}`)
  console.log(`  - Series: ${stats.series}`)
  console.log(`  - Instances: ${stats.instances}`)
  console.log(`  - Participants: ${stats.participants}`)
  console.log(`  - Feedback: ${stats.feedback}`)
  console.log('\n✨ Ready to explore!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
