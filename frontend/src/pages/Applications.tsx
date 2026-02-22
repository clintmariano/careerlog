import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { applicationService } from '@/api/applicationService'
import { Application, ApplicationStatus } from '@/types/application'
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import AddApplicationModal from '@/components/AddApplicationModal'

const Applications = () => {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm])

  useEffect(() => {
    fetchApplications()
  }, [currentPage, searchTerm])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await applicationService.getApplications(
        currentPage,
        pageSize,
        'applicationDate',
        'desc',
        searchTerm
      )
      setApplications(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
      setTotalElements(response.data.totalElements || 0)
    } catch (error) {
      toast.error('Failed to fetch applications')
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteApplication = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return

    try {
      await applicationService.deleteApplication(id)
      setApplications(applications.filter(app => app.id !== id))
      toast.success('Application deleted successfully')
    } catch (error) {
      toast.error('Failed to delete application')
      console.error('Error deleting application:', error)
    }
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPLIED:
        return 'bg-blue-100 text-blue-800'
      case ApplicationStatus.PHONE_SCREEN:
        return 'bg-yellow-100 text-yellow-800'
      case ApplicationStatus.TECHNICAL_INTERVIEW:
        return 'bg-purple-100 text-purple-800'
      case ApplicationStatus.BEHAVIORAL_INTERVIEW:
        return 'bg-green-100 text-green-800'
      case ApplicationStatus.FINAL_ROUND:
        return 'bg-indigo-100 text-indigo-800'
      case ApplicationStatus.OFFER:
        return 'bg-emerald-100 text-emerald-800'
      case ApplicationStatus.REJECTED:
        return 'bg-red-100 text-red-800'
      case ApplicationStatus.WITHDRAWN:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Job Applications</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-hidden">
          {loading ? (
            <div className="animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 border-b border-gray-200"></div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No applications found</p>
              <p className="text-sm text-gray-400 mt-2">Add your first job application to get started</p>
            </div>
          ) : (
            <table className="w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="w-[34%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="w-[18%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="w-[6%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-[12%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    &nbsp;&nbsp;&nbsp;&nbsp;Date
                  </th>
                  <th className="w-[10%] pl-2 pr-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate" title={application.companyName}>{application.companyName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate" title={application.jobTitle}>{application.jobTitle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate" title={application.location || 'Remote'}>{application.location || 'Remote'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {new Date(application.applicationDate).toLocaleDateString()}
                    </td>
                    <td className="pl-2 pr-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/applications/${application.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/applications/${application.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteApplication(application.id!)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} applications
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchApplications}
      />
    </div>
  )
}

export default Applications
