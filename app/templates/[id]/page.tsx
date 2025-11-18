'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface RitualStep {
  id: string
  orderIndex: number
  stepType: string
  title: string
  instructionsMarkdown?: string
  durationMinutes?: number
}

interface RitualTemplate {
  id: string
  name: string
  key: string
  ritualType: string
  descriptionMarkdown?: string
  defaultDurationMinutes?: number
  steps: RitualStep[]
}

export default function TemplateDetailPage() {
  const params = useParams()
  const [template, setTemplate] = useState<RitualTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddStep, setShowAddStep] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchTemplate()
    }
  }, [params.id])

  const fetchTemplate = async () => {
    try {
      const res = await fetch(`/api/templates/${params.id}`)
      const data = await res.json()
      setTemplate(data)
    } catch (error) {
      console.error('Failed to fetch template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStep = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      orderIndex: template?.steps.length || 0,
      stepType: formData.get('stepType'),
      title: formData.get('title'),
      instructionsMarkdown: formData.get('instructionsMarkdown'),
      durationMinutes: parseInt(formData.get('durationMinutes') as string) || undefined,
    }

    try {
      const res = await fetch(`/api/templates/${params.id}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setShowAddStep(false)
        fetchTemplate()
      }
    } catch (error) {
      console.error('Failed to add step:', error)
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!template) {
    return <div className="p-4">Template not found</div>
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-4">
        <Link
          href="/templates"
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to Templates
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {template.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Key: {template.key} | Type: {template.ritualType}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href={`/instances/new?templateId=${template.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Schedule Instance
            </Link>
          </div>
        </div>

        {template.descriptionMarkdown && (
          <div className="mt-4">
            <p className="text-gray-700 dark:text-gray-300">
              {template.descriptionMarkdown}
            </p>
          </div>
        )}

        {template.defaultDurationMinutes && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Default duration: {template.defaultDurationMinutes} minutes
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Ritual Steps ({template.steps.length})
          </h2>
          <button
            onClick={() => setShowAddStep(!showAddStep)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Step
          </button>
        </div>

        {showAddStep && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              New Step
            </h3>
            <form onSubmit={handleAddStep} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Step Type
                </label>
                <select
                  name="stepType"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                >
                  <option value="talk">Talk</option>
                  <option value="meditation">Meditation</option>
                  <option value="breakout">Breakout</option>
                  <option value="sharing">Sharing</option>
                  <option value="exercise">Exercise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Instructions (Markdown)
                </label>
                <textarea
                  name="instructionsMarkdown"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="durationMinutes"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  Add Step
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStep(false)}
                  className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {template.steps.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No steps yet. Add your first step to define the ritual flow.
            </p>
          ) : (
            template.steps.map((step) => (
              <div
                key={step.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {step.orderIndex + 1}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {step.stepType}
                      </span>
                      {step.durationMinutes && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {step.durationMinutes} min
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    {step.instructionsMarkdown && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {step.instructionsMarkdown}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
