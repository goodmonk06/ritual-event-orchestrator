'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface Participant {
  id: string
  memberId: string
  status: string
  registeredAt: string
  checkInAt?: string
  checkOutAt?: string
}

interface RitualInstance {
  id: string
  scheduledStart: string
  scheduledEnd: string
  status: string
  template: {
    id: string
    name: string
    key: string
    ritualType: string
    steps: Array<{
      id: string
      orderIndex: number
      stepType: string
      title: string
      durationMinutes?: number
    }>
  }
  participants: Participant[]
}

export default function InstanceDetailPage() {
  const params = useParams()
  const [instance, setInstance] = useState<RitualInstance | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMemberId, setNewMemberId] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchInstance()
    }
  }, [params.id])

  const fetchInstance = async () => {
    try {
      const res = await fetch(`/api/instances/${params.id}`)
      const data = await res.json()
      setInstance(data)
    } catch (error) {
      console.error('Failed to fetch instance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/instances/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        fetchInstance()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberId) return

    try {
      const res = await fetch(`/api/instances/${params.id}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: newMemberId }),
      })

      if (res.ok) {
        setNewMemberId('')
        fetchInstance()
      }
    } catch (error) {
      console.error('Failed to add participant:', error)
    }
  }

  const handleCheckIn = async (participantId: string) => {
    try {
      const res = await fetch(
        `/api/instances/${params.id}/participants/${participantId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkIn: true }),
        }
      )

      if (res.ok) {
        fetchInstance()
      }
    } catch (error) {
      console.error('Failed to check in participant:', error)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'in_progress':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!instance) {
    return <div className="p-4">Instance not found</div>
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-4">
        <Link
          href="/instances"
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to Instances
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="sm:flex sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {instance.template.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(instance.scheduledStart), 'PPP')} at{' '}
              {format(new Date(instance.scheduledStart), 'p')}
            </p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                  instance.status
                )}`}
              >
                {instance.status}
              </span>
            </div>
          </div>
        </div>

        {/* Facilitator Control Panel */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Facilitator Controls
          </h2>
          <div className="flex gap-2">
            {instance.status === 'scheduled' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Start Ritual
              </button>
            )}
            {instance.status === 'in_progress' && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Complete Ritual
              </button>
            )}
            {(instance.status === 'scheduled' || instance.status === 'in_progress') && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ritual Steps */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Ritual Flow
        </h2>
        <div className="space-y-3">
          {instance.template.steps.map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium">
                {step.orderIndex + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {step.title}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({step.stepType})
                  </span>
                </div>
                {step.durationMinutes && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {step.durationMinutes} minutes
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Participants ({instance.participants.length})
          </h2>
        </div>

        {/* Add Participant Form */}
        <form onSubmit={handleAddParticipant} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMemberId}
              onChange={(e) => setNewMemberId(e.target.value)}
              placeholder="Member ID"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Participant
            </button>
          </div>
        </form>

        {/* Participants List */}
        <div className="space-y-2">
          {instance.participants.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No participants yet
            </p>
          ) : (
            instance.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {participant.memberId}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Registered: {format(new Date(participant.registeredAt), 'PPp')}
                    {participant.checkInAt && (
                      <> • Checked in: {format(new Date(participant.checkInAt), 'p')}</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      participant.status === 'attended'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : participant.status === 'no_show'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}
                  >
                    {participant.status}
                  </span>
                  {participant.status === 'registered' &&
                    instance.status !== 'completed' && (
                      <button
                        onClick={() => handleCheckIn(participant.id)}
                        className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Check In
                      </button>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
