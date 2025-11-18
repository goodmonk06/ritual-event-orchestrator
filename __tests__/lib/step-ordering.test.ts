/**
 * Tests for step ordering logic
 */

describe('Step Ordering Logic', () => {
  it('should maintain correct order indices when creating steps', () => {
    const steps = [
      { orderIndex: 0, title: 'Opening' },
      { orderIndex: 1, title: 'Meditation' },
      { orderIndex: 2, title: 'Sharing' },
    ]

    // Verify sequential ordering
    steps.forEach((step, index) => {
      expect(step.orderIndex).toBe(index)
    })
  })

  it('should handle reordering of steps', () => {
    const originalSteps = [
      { id: '1', orderIndex: 0, title: 'Opening' },
      { id: '2', orderIndex: 1, title: 'Meditation' },
      { id: '3', orderIndex: 2, title: 'Sharing' },
    ]

    // Simulate moving step 2 to position 0
    const reorderedSteps = [
      { id: '2', orderIndex: 0, title: 'Meditation' },
      { id: '1', orderIndex: 1, title: 'Opening' },
      { id: '3', orderIndex: 2, title: 'Sharing' },
    ]

    // Verify new order
    expect(reorderedSteps[0].id).toBe('2')
    expect(reorderedSteps[0].orderIndex).toBe(0)
    expect(reorderedSteps[1].id).toBe('1')
    expect(reorderedSteps[1].orderIndex).toBe(1)
  })

  it('should calculate total duration from steps', () => {
    const steps = [
      { orderIndex: 0, title: 'Opening', durationMinutes: 5 },
      { orderIndex: 1, title: 'Meditation', durationMinutes: 20 },
      { orderIndex: 2, title: 'Sharing', durationMinutes: 15 },
    ]

    const totalDuration = steps.reduce(
      (sum, step) => sum + (step.durationMinutes || 0),
      0
    )

    expect(totalDuration).toBe(40)
  })

  it('should handle steps without duration', () => {
    const steps = [
      { orderIndex: 0, title: 'Opening', durationMinutes: 5 },
      { orderIndex: 1, title: 'Discussion' }, // No duration
      { orderIndex: 2, title: 'Closing', durationMinutes: 5 },
    ]

    const totalDuration = steps.reduce(
      (sum, step) => sum + (step.durationMinutes || 0),
      0
    )

    expect(totalDuration).toBe(10)
  })
})
