/**
 * Tests for participant management logic
 */

type ParticipantStatus = 'registered' | 'attended' | 'no_show'

interface Participant {
  id: string
  memberId: string
  status: ParticipantStatus
  registeredAt: Date
  checkInAt?: Date
  checkOutAt?: Date
}

describe('Participant Management', () => {
  it('should register a participant with default status', () => {
    const participant: Participant = {
      id: 'p1',
      memberId: 'm1',
      status: 'registered',
      registeredAt: new Date(),
    }

    expect(participant.status).toBe('registered')
    expect(participant.checkInAt).toBeUndefined()
  })

  it('should mark participant as attended on check-in', () => {
    const participant: Participant = {
      id: 'p1',
      memberId: 'm1',
      status: 'registered',
      registeredAt: new Date(),
    }

    // Simulate check-in
    participant.status = 'attended'
    participant.checkInAt = new Date()

    expect(participant.status).toBe('attended')
    expect(participant.checkInAt).toBeDefined()
  })

  it('should handle check-out after check-in', () => {
    const checkInTime = new Date()
    const participant: Participant = {
      id: 'p1',
      memberId: 'm1',
      status: 'attended',
      registeredAt: new Date(),
      checkInAt: checkInTime,
    }

    // Simulate check-out
    const checkOutTime = new Date(checkInTime.getTime() + 3600000) // 1 hour later
    participant.checkOutAt = checkOutTime

    expect(participant.checkOutAt).toBeDefined()
    expect(participant.checkOutAt!.getTime()).toBeGreaterThan(
      participant.checkInAt!.getTime()
    )
  })

  it('should calculate attended participants count', () => {
    const participants: Participant[] = [
      {
        id: 'p1',
        memberId: 'm1',
        status: 'attended',
        registeredAt: new Date(),
        checkInAt: new Date(),
      },
      {
        id: 'p2',
        memberId: 'm2',
        status: 'registered',
        registeredAt: new Date(),
      },
      {
        id: 'p3',
        memberId: 'm3',
        status: 'attended',
        registeredAt: new Date(),
        checkInAt: new Date(),
      },
      {
        id: 'p4',
        memberId: 'm4',
        status: 'no_show',
        registeredAt: new Date(),
      },
    ]

    const attendedCount = participants.filter(
      (p) => p.status === 'attended'
    ).length

    expect(attendedCount).toBe(2)
  })

  it('should prevent duplicate participant registration', () => {
    const participants: Participant[] = [
      {
        id: 'p1',
        memberId: 'm1',
        status: 'registered',
        registeredAt: new Date(),
      },
    ]

    const newMemberId = 'm1'
    const isDuplicate = participants.some((p) => p.memberId === newMemberId)

    expect(isDuplicate).toBe(true)
  })

  it('should allow same member in different instances', () => {
    const instance1Participants: Participant[] = [
      {
        id: 'p1',
        memberId: 'm1',
        status: 'attended',
        registeredAt: new Date(),
        checkInAt: new Date(),
      },
    ]

    const instance2Participants: Participant[] = []

    // Same member can register for different instance
    const newMemberId = 'm1'
    const isDuplicateInInstance2 = instance2Participants.some(
      (p) => p.memberId === newMemberId
    )

    expect(isDuplicateInInstance2).toBe(false)
  })
})
