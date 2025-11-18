#!/usr/bin/env tsx

/**
 * CLI tool for ritual-event-orchestrator
 * Provides utilities for seeding, maintenance, and testing
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const commands = {
  async stats() {
    console.log('📊 Database Statistics\n')

    const [
      communities,
      facilitators,
      tags,
      templates,
      series,
      instances,
      participants,
      feedback,
    ] = await Promise.all([
      prisma.community.count(),
      prisma.facilitator.count(),
      prisma.tag.count(),
      prisma.ritualTemplate.count(),
      prisma.ritualSeries.count(),
      prisma.ritualInstance.count(),
      prisma.participantRegistration.count(),
      prisma.ritualFeedback.count(),
    ])

    console.log(`Communities:    ${communities}`)
    console.log(`Facilitators:   ${facilitators}`)
    console.log(`Tags:           ${tags}`)
    console.log(`Templates:      ${templates}`)
    console.log(`Series:         ${series}`)
    console.log(`Instances:      ${instances}`)
    console.log(`Participants:   ${participants}`)
    console.log(`Feedback:       ${feedback}`)
  },

  async 'list-templates'() {
    const templates = await prisma.ritualTemplate.findMany({
      include: {
        _count: {
          select: { instances: true, steps: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log('\n📋 Ritual Templates:\n')
    templates.forEach(t => {
      console.log(`${t.name} (${t.key})`)
      console.log(`  Type: ${t.ritualType}`)
      console.log(`  Steps: ${t._count.steps}`)
      console.log(`  Instances: ${t._count.instances}`)
      console.log(`  ID: ${t.id}\n`)
    })
  },

  async 'list-instances'() {
    const instances = await prisma.ritualInstance.findMany({
      include: {
        template: true,
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { scheduledStart: 'desc' },
      take: 20,
    })

    console.log('\n📅 Recent Ritual Instances:\n')
    instances.forEach(i => {
      const date = i.scheduledStart.toISOString().split('T')[0]
      console.log(`${i.template.name}`)
      console.log(`  Status: ${i.status}`)
      console.log(`  Scheduled: ${date}`)
      console.log(`  Participants: ${i._count.participants}`)
      console.log(`  ID: ${i.id}\n`)
    })
  },

  async 'cleanup-old'() {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const deleted = await prisma.ritualInstance.deleteMany({
      where: {
        scheduledStart: {
          lt: oneYearAgo,
        },
        status: {
          in: ['cancelled', 'completed'],
        },
      },
    })

    console.log(`🧹 Cleaned up ${deleted.count} old instances (>1 year)`)
  },

  help() {
    console.log(`
🌙 Ritual Event Orchestrator CLI

Available commands:

  stats              Show database statistics
  list-templates     List all ritual templates
  list-instances     List recent instances
  cleanup-old        Remove old completed/cancelled instances
  help               Show this help message

Usage:
  npm run cli <command>
  npm run cli stats
`)
  },
}

const command = process.argv[2] as keyof typeof commands

if (!command || !commands[command]) {
  commands.help()
  process.exit(1)
}

commands[command]()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
