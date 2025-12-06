import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Activity, ActivityType, Application } from '@/types/application'
import { activityService, applicationService } from '@/api/applicationService'
import Modal from './Modal'
import toast from 'react-hot-toast'

interface AddActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preSelectedApplicationId?: number
}

interface ActivityFormData {
  applicationId: string
  type: ActivityType
  dateTime: string
  notes: string
  location: string
  participants: string
  durationMinutes: string
}

const AddActivityModal = ({
  isOpen,
  onClose,
  onSuccess,
  preSelectedApplicationId,
}: AddActivityModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ActivityFormData>({
    defaultValues: {
      type: ActivityType.APPLICATION_SUBMITTED,
      dateTime: new Date().toISOString().slice(0, 16),
    },
  })

  useEffect(() => {
    if (isOpen) {
      fetchApplications()
      if (preSelectedApplicationId) {
        setValue('applicationId', preSelectedApplicationId.toString())
      }
    }
  }, [isOpen, preSelectedApplicationId, setValue])

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true)
      const response = await applicationService.getApplications(0, 100, 'applicationDate', 'desc')
      setApplications(response.data.content || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setLoadingApplications(false)
    }
  }

  const onSubmit = async (data: ActivityFormData) => {
    try {
      setIsSubmitting(true)

      const activityData: Partial<Activity> = {
        application: { id: parseInt(data.applicationId), companyName: '', jobTitle: '' },
        type: data.type,
        dateTime: new Date(data.dateTime).toISOString(),
        notes: data.notes || undefined,
        location: data.location || undefined,
        participants: data.participants || undefined,
        durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes) : undefined,
      }

      await activityService.createActivity(activityData)
      toast.success('Activity added successfully')
      reset()
      onSuccess()
      onClose()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add activity'
      toast.error(errorMessage)
      console.error('Error creating activity:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const formatActivityType = (type: string) => {
    return type.replace(/_/g, ' ')
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Activity" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="applicationId" className="block text-sm font-medium text-gray-700">
              Application <span className="text-red-500">*</span>
            </label>
            <select
              id="applicationId"
              {...register('applicationId', { required: 'Please select an application' })}
              disabled={loadingApplications || !!preSelectedApplicationId}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
            >
              <option value="">
                {loadingApplications ? 'Loading applications...' : 'Select an application'}
              </option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.companyName} - {app.jobTitle}
                </option>
              ))}
            </select>
            {errors.applicationId && (
              <p className="mt-1 text-sm text-red-600">{errors.applicationId.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Activity Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              {...register('type', { required: 'Activity type is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {Object.values(ActivityType).map((type) => (
                <option key={type} value={type}>
                  {formatActivityType(type)}
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>

          <div>
            <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700">
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="dateTime"
              {...register('dateTime', { required: 'Date and time is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.dateTime && (
              <p className="mt-1 text-sm text-red-600">{errors.dateTime.message}</p>
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
              placeholder="e.g., Zoom, Office, Phone"
            />
          </div>

          <div>
            <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700">
              Duration (minutes)
            </label>
            <input
              type="number"
              id="durationMinutes"
              min="0"
              {...register('durationMinutes')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., 60"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="participants" className="block text-sm font-medium text-gray-700">
              Participants
            </label>
            <input
              type="text"
              id="participants"
              {...register('participants')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., John Smith (Engineering Manager), Jane Doe (HR)"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            {...register('notes')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Any notes about this activity..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loadingApplications}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Activity'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddActivityModal
