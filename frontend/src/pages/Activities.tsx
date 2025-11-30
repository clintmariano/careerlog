import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, MapPin } from 'lucide-react'
import { activityService } from '@/api/applicationService'
import { Activity, ActivityType } from '@/types/application'

const Activities = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await activityService.getActivitiesByUser(50)
      setActivities(response.data)
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.PHONE_SCREEN:
        return <Clock className="h-5 w-5 text-blue-500" />
      case ActivityType.TECHNICAL_INTERVIEW:
        return <Calendar className="h-5 w-5 text-purple-500" />
      case ActivityType.BEHAVIORAL_INTERVIEW:
        return <Calendar className="h-5 w-5 text-green-500" />
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Activities</h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first activity.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type.replace('_', ' ')}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(activity.dateTime).toLocaleDateString()} at{' '}
                          {new Date(activity.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    {activity.application && (
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.application.companyName} - {activity.application.jobTitle}
                      </p>
                    )}
                    {activity.notes && (
                      <p className="text-sm text-gray-500 mt-2">{activity.notes}</p>
                    )}
                    {activity.location && (
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {activity.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Activities
