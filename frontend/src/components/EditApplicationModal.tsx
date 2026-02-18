import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Application, ApplicationStatus } from '@/types/application'
import { applicationService } from '@/api/applicationService'
import Modal from './Modal'
import toast from 'react-hot-toast'

interface EditApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (application: Application) => void
  application: Application
}

interface ApplicationFormData {
  companyName: string
  jobTitle: string
  location: string
  techStack: string
  applicationDate: string
  status: ApplicationStatus
  salaryRange: string
  source: string
  description: string
}

const EditApplicationModal = ({ isOpen, onClose, onSuccess, application }: EditApplicationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>()

  useEffect(() => {
    if (isOpen && application) {
      reset({
        companyName: application.companyName,
        jobTitle: application.jobTitle,
        location: application.location || '',
        techStack: application.techStack || '',
        applicationDate: application.applicationDate?.split('T')[0] || '',
        status: application.status,
        salaryRange: application.salaryRange || '',
        source: application.source || '',
        description: application.description || '',
      })
    }
  }, [isOpen, application, reset])

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setIsSubmitting(true)
      const applicationData: Partial<Application> = {
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        location: data.location || undefined,
        techStack: data.techStack || undefined,
        applicationDate: data.applicationDate,
        status: data.status,
        salaryRange: data.salaryRange || undefined,
        source: data.source || undefined,
        description: data.description || undefined,
      }

      const response = await applicationService.updateApplication(application.id, applicationData)
      toast.success('Application updated successfully')
      onSuccess(response.data)
      onClose()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update application'
      toast.error(errorMessage)
      console.error('Error updating application:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Application" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              {...register('companyName', { required: 'Company name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., Google"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="jobTitle"
              {...register('jobTitle', { required: 'Job title is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., Software Engineer"
            />
            {errors.jobTitle && (
              <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              {...register('location')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., San Francisco, CA or Remote"
            />
          </div>

          <div>
            <label htmlFor="applicationDate" className="block text-sm font-medium text-gray-700">
              Application Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="applicationDate"
              {...register('applicationDate', { required: 'Application date is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.applicationDate && (
              <p className="mt-1 text-sm text-red-600">{errors.applicationDate.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              {...register('status', { required: 'Status is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {Object.values(ApplicationStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-700">
              Salary Range
            </label>
            <input
              type="text"
              id="salaryRange"
              {...register('salaryRange')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., $120k - $150k"
            />
          </div>

          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700">
              Source
            </label>
            <input
              type="text"
              id="source"
              {...register('source')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., LinkedIn, Indeed, Referral"
            />
          </div>

          <div>
            <label htmlFor="techStack" className="block text-sm font-medium text-gray-700">
              Tech Stack
            </label>
            <input
              type="text"
              id="techStack"
              {...register('techStack')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., React, Node.js, PostgreSQL"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Notes / Description
          </label>
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Any additional notes about this application..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditApplicationModal
