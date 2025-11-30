import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { applicationService } from '@/api/applicationService'
import { Application } from '@/types/application'

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchApplication(parseInt(id))
    }
  }, [id])

  const fetchApplication = async (appId: number) => {
    try {
      setLoading(true)
      const response = await applicationService.getApplication(appId)
      setApplication(response.data)
    } catch (error) {
      toast.error('Failed to fetch application details')
      console.error('Error fetching application:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteApplication = async () => {
    if (!application?.id || !confirm('Are you sure you want to delete this application?')) return

    try {
      await applicationService.deleteApplication(application.id)
      toast.success('Application deleted successfully')
    } catch (error) {
      toast.error('Failed to delete application')
      console.error('Error deleting application:', error)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Application not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/applications"
            className="inline-flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Application Details</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={deleteApplication}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                <dd className="text-sm text-gray-900">{application.companyName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Job Title</dt>
                <dd className="text-sm text-gray-900">{application.jobTitle}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="text-sm text-gray-900">{application.location || 'Not specified'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Application Details</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900">{application.status.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Applied Date</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(application.applicationDate).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Source</dt>
                <dd className="text-sm text-gray-900">{application.source || 'Not specified'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {application.techStack && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tech Stack</h3>
            <p className="text-sm text-gray-900">{application.techStack}</p>
          </div>
        )}

        {application.description && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
            <p className="text-sm text-gray-900">{application.description}</p>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activities</h3>
        <p className="text-gray-500">Activities will be displayed here</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
        <p className="text-gray-500">Attachments will be displayed here</p>
      </div>
    </div>
  )
}

export default ApplicationDetail
