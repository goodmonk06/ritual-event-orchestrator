/**
 * Tests for instance status transitions
 */

type InstanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

describe('Instance Status Transitions', () => {
  const validTransitions: Record<InstanceStatus, InstanceStatus[]> = {
    scheduled: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  }

  const isValidTransition = (
    from: InstanceStatus,
    to: InstanceStatus
  ): boolean => {
    return validTransitions[from].includes(to)
  }

  it('should allow scheduled -> in_progress transition', () => {
    expect(isValidTransition('scheduled', 'in_progress')).toBe(true)
  })

  it('should allow scheduled -> cancelled transition', () => {
    expect(isValidTransition('scheduled', 'cancelled')).toBe(true)
  })

  it('should allow in_progress -> completed transition', () => {
    expect(isValidTransition('in_progress', 'completed')).toBe(true)
  })

  it('should allow in_progress -> cancelled transition', () => {
    expect(isValidTransition('in_progress', 'cancelled')).toBe(true)
  })

  it('should not allow completed -> any transition', () => {
    expect(isValidTransition('completed', 'scheduled')).toBe(false)
    expect(isValidTransition('completed', 'in_progress')).toBe(false)
    expect(isValidTransition('completed', 'cancelled')).toBe(false)
  })

  it('should not allow cancelled -> any transition', () => {
    expect(isValidTransition('cancelled', 'scheduled')).toBe(false)
    expect(isValidTransition('cancelled', 'in_progress')).toBe(false)
    expect(isValidTransition('cancelled', 'completed')).toBe(false)
  })

  it('should not allow scheduled -> completed without going through in_progress', () => {
    expect(isValidTransition('scheduled', 'completed')).toBe(false)
  })

  it('should handle complete ritual flow', () => {
    let status: InstanceStatus = 'scheduled'

    // Start ritual
    expect(isValidTransition(status, 'in_progress')).toBe(true)
    status = 'in_progress'

    // Complete ritual
    expect(isValidTransition(status, 'completed')).toBe(true)
    status = 'completed'

    // Cannot change after completion
    expect(isValidTransition(status, 'scheduled')).toBe(false)
  })
})
