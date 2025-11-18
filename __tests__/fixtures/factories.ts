/**
 * Test data factories for creating realistic test fixtures
 */

import type {
  Community,
  Facilitator,
  Tag,
  RitualTemplate,
  RitualStep,
  RitualSeries,
  RitualInstance,
  ParticipantRegistration,
  OutcomeRecord,
  RitualFeedback,
  RitualType,
  StepType,
  InstanceStatus,
  ParticipantStatus,
  TagCategory,
  SeriesType,
} from '@prisma/client'

let idCounter = 1

function generateId(prefix: string = 'test'): string {
  return `${prefix}_${idCounter++}_${Date.now()}`
}

export const CommunityFactory = {
  build(overrides?: Partial<Community>): Omit<Community, 'createdAt' | 'updatedAt'> {
    return {
      id: generateId('community'),
      name: 'Test Community',
      slug: `test-community-${Date.now()}`,
      descriptionMarkdown: 'A test community for ritual events',
      settings: null,
      isActive: true,
      ...overrides,
    }
  },
}

export const FacilitatorFactory = {
  build(overrides?: Partial<Facilitator>): Omit<Facilitator, 'createdAt' | 'updatedAt'> {
    return {
      id: generateId('facilitator'),
      communityId: 'community_1',
      memberId: `member_${Date.now()}`,
      name: 'Test Facilitator',
      bio: 'An experienced ritual facilitator',
      specialties: JSON.stringify(['meditation', 'breathwork']),
      rating: 4.5,
      totalRitualsLed: 10,
      isActive: true,
      ...overrides,
    }
  },
}

export const TagFactory = {
  build(overrides?: Partial<Tag>): Omit<Tag, 'createdAt'> {
    const name = overrides?.name || 'Test Tag'
    return {
      id: generateId('tag'),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      category: 'general' as TagCategory,
      description: null,
      color: '#3B82F6',
      ...overrides,
    }
  },
}

export const RitualTemplateFactory = {
  build(overrides?: Partial<RitualTemplate>): Omit<RitualTemplate, 'createdAt' | 'updatedAt'> {
    return {
      id: generateId('template'),
      communityId: 'community_1',
      key: `ritual-${Date.now()}`,
      name: 'Test Ritual Template',
      descriptionMarkdown: 'A test ritual template',
      ritualType: 'live_call' as RitualType,
      defaultDurationMinutes: 60,
      imageUrl: null,
      capacity: null,
      isPublished: true,
      ...overrides,
    }
  },
}

export const RitualStepFactory = {
  build(overrides?: Partial<RitualStep>): Omit<RitualStep, 'createdAt' | 'updatedAt'> {
    return {
      id: generateId('step'),
      templateId: 'template_1',
      orderIndex: 0,
      stepType: 'talk' as StepType,
      title: 'Test Step',
      instructionsMarkdown: 'Test instructions',
      durationMinutes: 10,
      metadataJson: null,
      ...overrides,
    }
  },
}

export const RitualSeriesFactory = {
  build(overrides?: Partial<RitualSeries>): Omit<RitualSeries, 'createdAt' | 'updatedAt'> {
    return {
      id: generateId('series'),
      communityId: 'community_1',
      templateId: null,
      name: 'Test Series',
      descriptionMarkdown: 'A test series',
      seriesType: 'program' as SeriesType,
      recurrenceRule: null,
      startDate: null,
      endDate: null,
      isActive: true,
      metadata: null,
      ...overrides,
    }
  },
}

export const RitualInstanceFactory = {
  build(overrides?: Partial<RitualInstance>): Omit<RitualInstance, 'createdAt' | 'updatedAt'> {
    const now = new Date()
    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000) // tomorrow
    const end = new Date(start.getTime() + 60 * 60 * 1000) // +1 hour

    return {
      id: generateId('instance'),
      templateId: 'template_1',
      seriesId: null,
      facilitatorId: null,
      scheduledStart: start,
      scheduledEnd: end,
      actualStart: null,
      actualEnd: null,
      status: 'scheduled' as InstanceStatus,
      location: null,
      meetingUrl: null,
      capacity: null,
      notesMarkdown: null,
      metadata: null,
      ...overrides,
    }
  },
}

export const ParticipantRegistrationFactory = {
  build(overrides?: Partial<ParticipantRegistration>): Omit<ParticipantRegistration, 'registeredAt'> {
    return {
      id: generateId('participant'),
      ritualInstanceId: 'instance_1',
      memberId: `member_${Date.now()}`,
      status: 'registered' as ParticipantStatus,
      checkInAt: null,
      checkOutAt: null,
      ...overrides,
    }
  },
}

export const OutcomeRecordFactory = {
  build(overrides?: Partial<OutcomeRecord>): Omit<OutcomeRecord, 'createdAt' | 'updatedAt'> {
    return {
      id: generateId('outcome'),
      ritualInstanceId: 'instance_1',
      memberId: `member_${Date.now()}`,
      notesMarkdown: 'Great experience',
      rating: 5,
      tagsJson: null,
      isPublic: false,
      ...overrides,
    }
  },
}

export const RitualFeedbackFactory = {
  build(overrides?: Partial<RitualFeedback>): Omit<RitualFeedback, 'createdAt'> {
    return {
      id: generateId('feedback'),
      ritualInstanceId: 'instance_1',
      facilitatorId: null,
      memberId: `member_${Date.now()}`,
      contentRating: 5,
      facilitationRating: 5,
      energyRating: 4,
      valueRating: 5,
      highlights: 'Excellent facilitation',
      improvements: null,
      comments: null,
      wouldRecommend: true,
      wouldAttendAgain: true,
      ...overrides,
    }
  },
}

/**
 * Create a complete ritual instance with participants and outcomes
 */
export function createCompleteRitualFixture() {
  const community = CommunityFactory.build()
  const facilitator = FacilitatorFactory.build({ communityId: community.id })
  const template = RitualTemplateFactory.build({ communityId: community.id })
  const steps = [
    RitualStepFactory.build({ templateId: template.id, orderIndex: 0, title: 'Opening' }),
    RitualStepFactory.build({ templateId: template.id, orderIndex: 1, title: 'Main Practice', stepType: 'meditation' }),
    RitualStepFactory.build({ templateId: template.id, orderIndex: 2, title: 'Sharing Circle', stepType: 'sharing' }),
    RitualStepFactory.build({ templateId: template.id, orderIndex: 3, title: 'Closing' }),
  ]
  const instance = RitualInstanceFactory.build({
    templateId: template.id,
    facilitatorId: facilitator.id,
  })
  const participants = [
    ParticipantRegistrationFactory.build({ ritualInstanceId: instance.id, memberId: 'alice', status: 'attended' }),
    ParticipantRegistrationFactory.build({ ritualInstanceId: instance.id, memberId: 'bob', status: 'attended' }),
    ParticipantRegistrationFactory.build({ ritualInstanceId: instance.id, memberId: 'carol', status: 'registered' }),
  ]

  return {
    community,
    facilitator,
    template,
    steps,
    instance,
    participants,
  }
}
