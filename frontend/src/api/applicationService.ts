import axios from './axios'
import {
  Activity,
  ActivityType,
  Application,
  ApplicationStatus,
  DashboardOverview,
  PaginatedResponse,
} from '../types/application'

export const applicationService = {
  getApplications: (page = 0, size = 10, sortBy = 'applicationDate', sortDir = 'desc', search = '') => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
    return axios.get<PaginatedResponse<Application>>(
      `/applications?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}${searchParam}`
    )
  },

  getApplication: (id: number) => axios.get<Application>(`/applications/${id}`),

  createApplication: (application: Partial<Application>) =>
    axios.post<Application>('/applications', application),

  updateApplication: (id: number, application: Partial<Application>) =>
    axios.put<Application>(`/applications/${id}`, application),

  deleteApplication: (id: number) => axios.delete(`/applications/${id}`),

  getApplicationsByStatus: (status: ApplicationStatus) =>
    axios.get<Application[]>(`/applications/status/${status}`),
}

export const activityService = {
  getActivitiesByUser: (limit = 20) =>
    axios.get<Activity[]>(`/activities/user?limit=${limit}`),

  getActivitiesByApplication: (applicationId: number) =>
    axios.get<Activity[]>(`/activities/application/${applicationId}`),

  createActivity: (activity: Partial<Activity>) =>
    axios.post<Activity>('/activities', activity),

  updateActivity: (id: number, activity: Partial<Activity>) =>
    axios.put<Activity>(`/activities/${id}`, activity),

  deleteActivity: (id: number) => axios.delete(`/activities/${id}`),
}

export const dashboardService = {
  getOverview: () => axios.get<DashboardOverview>('/dashboard/overview'),

  getApplicationsPerWeek: (weeks = 12) =>
    axios.get<Record<string, number>>(`/dashboard/applications-per-week?weeks=${weeks}`),

  getRecentActivities: (limit = 10) =>
    axios.get(`/dashboard/recent-activities?limit=${limit}`),

  getStatusSummary: () => axios.get('/dashboard/analytics/status-summary'),
}

export { ActivityType, ApplicationStatus }
