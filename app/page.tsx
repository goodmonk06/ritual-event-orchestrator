export default function Home() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Ritual Event Orchestrator
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Orchestrate meaningful ritual events for your community - seminars, group calls,
          moon rituals, challenges, and festivals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              📋 Templates
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create and manage ritual templates with detailed step-by-step flows
            </p>
            <a
              href="/templates"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              View Templates
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              📅 Instances
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Schedule ritual instances and manage participants
            </p>
            <a
              href="/instances"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              View Instances
            </a>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
            Getting Started
          </h3>
          <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1">
            <li>Create a ritual template with customizable steps</li>
            <li>Schedule instances from your templates</li>
            <li>Manage participant registrations and attendance</li>
            <li>Record outcomes and trigger integrations</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
