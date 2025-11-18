import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.outcomeRecord.deleteMany()
  await prisma.participantRegistration.deleteMany()
  await prisma.ritualInstance.deleteMany()
  await prisma.ritualStep.deleteMany()
  await prisma.ritualTemplate.deleteMany()

  console.log('✓ Cleared existing data')

  // Create "New Moon Intention Circle" template
  const newMoonTemplate = await prisma.ritualTemplate.create({
    data: {
      communityId: 'community-1',
      key: 'new-moon-intention',
      name: 'New Moon Intention Circle',
      descriptionMarkdown: `A sacred gathering to set intentions with the new moon energy.

This ritual brings community members together to reflect on the past lunar cycle and plant seeds of intention for the cycle ahead.`,
      ritualType: 'live_call',
      defaultDurationMinutes: 90,
      defaultTagsJson: JSON.stringify(['moon-ritual', 'intention-setting', 'community']),
    },
  })

  // Create steps for New Moon template
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

  console.log('✓ Created "New Moon Intention Circle" template with steps')

  // Create "Inner Work Weekly Group" template
  const innerWorkTemplate = await prisma.ritualTemplate.create({
    data: {
      communityId: 'community-1',
      key: 'inner-work-weekly',
      name: 'Inner Work Weekly Group',
      descriptionMarkdown: `A consistent weekly practice for deep personal growth work.

This recurring ritual provides a container for members to explore shadow work, integrate insights, and support each other's transformation journey.`,
      ritualType: 'hybrid',
      defaultDurationMinutes: 60,
      defaultTagsJson: JSON.stringify(['inner-work', 'weekly', 'growth']),
    },
  })

  // Create steps for Inner Work template
  await prisma.ritualStep.createMany({
    data: [
      {
        templateId: innerWorkTemplate.id,
        orderIndex: 0,
        stepType: 'talk',
        title: 'Check-in Round',
        instructionsMarkdown: 'Brief check-in: How are you arriving? What's alive for you today?',
        durationMinutes: 10,
      },
      {
        templateId: innerWorkTemplate.id,
        orderIndex: 1,
        stepType: 'meditation',
        title: 'Centering Practice',
        instructionsMarkdown: 'Short meditation to arrive fully present and connect with your inner wisdom.',
        durationMinutes: 5,
      },
      {
        templateId: innerWorkTemplate.id,
        orderIndex: 2,
        stepType: 'talk',
        title: 'Weekly Theme Introduction',
        instructionsMarkdown: 'Introduce the theme/topic for this week. Provide context and prompts.',
        durationMinutes: 5,
      },
      {
        templateId: innerWorkTemplate.id,
        orderIndex: 3,
        stepType: 'breakout',
        title: 'Small Group Exploration',
        instructionsMarkdown: 'Break into groups of 3-4. Use prompts to explore the theme together.',
        durationMinutes: 25,
      },
      {
        templateId: innerWorkTemplate.id,
        orderIndex: 4,
        stepType: 'sharing',
        title: 'Insights & Integration',
        instructionsMarkdown: 'Whole group: Share key insights, aha moments, or questions that emerged.',
        durationMinutes: 10,
      },
      {
        templateId: innerWorkTemplate.id,
        orderIndex: 5,
        stepType: 'exercise',
        title: 'Weekly Practice Assignment',
        instructionsMarkdown: 'Offer a simple practice or reflection prompt for the week ahead.',
        durationMinutes: 5,
      },
    ],
  })

  console.log('✓ Created "Inner Work Weekly Group" template with steps')

  // Create future instances for New Moon template
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const instance1 = await prisma.ritualInstance.create({
    data: {
      templateId: newMoonTemplate.id,
      scheduledStart: nextWeek,
      scheduledEnd: new Date(nextWeek.getTime() + 90 * 60 * 1000), // 90 minutes
      status: 'scheduled',
    },
  })

  const instance2 = await prisma.ritualInstance.create({
    data: {
      templateId: innerWorkTemplate.id,
      scheduledStart: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      scheduledEnd: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 60 minutes
      status: 'scheduled',
    },
  })

  const instance3 = await prisma.ritualInstance.create({
    data: {
      templateId: newMoonTemplate.id,
      scheduledStart: nextMonth,
      scheduledEnd: new Date(nextMonth.getTime() + 90 * 60 * 1000),
      status: 'scheduled',
    },
  })

  console.log('✓ Created future ritual instances')

  // Create past completed instance with participants
  const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
  const completedInstance = await prisma.ritualInstance.create({
    data: {
      templateId: innerWorkTemplate.id,
      scheduledStart: pastDate,
      scheduledEnd: new Date(pastDate.getTime() + 60 * 60 * 1000),
      status: 'completed',
    },
  })

  // Add participants to completed instance
  await prisma.participantRegistration.createMany({
    data: [
      {
        ritualInstanceId: completedInstance.id,
        memberId: 'member-alice',
        status: 'attended',
        registeredAt: new Date(pastDate.getTime() - 2 * 24 * 60 * 60 * 1000),
        checkInAt: pastDate,
        checkOutAt: new Date(pastDate.getTime() + 60 * 60 * 1000),
      },
      {
        ritualInstanceId: completedInstance.id,
        memberId: 'member-bob',
        status: 'attended',
        registeredAt: new Date(pastDate.getTime() - 2 * 24 * 60 * 60 * 1000),
        checkInAt: pastDate,
        checkOutAt: new Date(pastDate.getTime() + 60 * 60 * 1000),
      },
      {
        ritualInstanceId: completedInstance.id,
        memberId: 'member-carol',
        status: 'no_show',
        registeredAt: new Date(pastDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  // Add participants to upcoming instances
  await prisma.participantRegistration.createMany({
    data: [
      {
        ritualInstanceId: instance1.id,
        memberId: 'member-alice',
        status: 'registered',
        registeredAt: now,
      },
      {
        ritualInstanceId: instance1.id,
        memberId: 'member-david',
        status: 'registered',
        registeredAt: now,
      },
      {
        ritualInstanceId: instance2.id,
        memberId: 'member-bob',
        status: 'registered',
        registeredAt: now,
      },
    ],
  })

  // Add outcome records for completed instance
  await prisma.outcomeRecord.createMany({
    data: [
      {
        ritualInstanceId: completedInstance.id,
        memberId: 'member-alice',
        notesMarkdown: 'Powerful session. Had a breakthrough around my relationship with vulnerability.',
        rating: 5,
        tagsJson: JSON.stringify(['breakthrough', 'vulnerability']),
      },
      {
        ritualInstanceId: completedInstance.id,
        memberId: 'member-bob',
        notesMarkdown: 'Good exploration of the shadow work theme. Feeling more integrated.',
        rating: 4,
        tagsJson: JSON.stringify(['shadow-work', 'integration']),
      },
    ],
  })

  console.log('✓ Created participants and outcome records')

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
