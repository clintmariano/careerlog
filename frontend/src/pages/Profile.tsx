import { useMsal } from '@azure/msal-react'
import { User, LogOut, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { dashboardService } from '@/api/applicationService'

interface UserProfile {
  name?: string
  email?: string
}

const Profile = () => {
  const { instance, accounts } = useMsal()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalActivities: 0,
    totalAttachments: 0,
  })

  useEffect(() => {
    if (accounts.length > 0) {
      setProfile({
        name: accounts[0].name || accounts[0].username,
        email: accounts[0].username,
      })
    }
  }, [accounts])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await dashboardService.getOverview()
      setStats({
        totalApplications: response.data.totalApplications,
        totalActivities: response.data.recentActivities.length,
        totalAttachments: 0, // This would come from attachment service
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = async () => {
    await instance.logoutRedirect()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900">
                {profile?.name || 'User'}
              </h2>
              <p className="text-sm text-gray-600">
                {profile?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{stats.totalApplications}</div>
              <div className="text-sm font-medium text-blue-700">Total Applications</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{stats.totalActivities}</div>
              <div className="text-sm font-medium text-green-700">Total Activities</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{stats.totalAttachments}</div>
              <div className="text-sm font-medium text-purple-700">Total Attachments</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Account Settings</p>
                  <p className="text-sm text-gray-600">Manage your account preferences and privacy settings</p>
                </div>
              </div>
              <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2">
                Configure
              </button>
            </div>
            <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <LogOut className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sign Out</p>
                  <p className="text-sm text-gray-600">Sign out of your account</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Application Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Application Version</p>
                <p className="text-sm text-gray-600">1.0.0</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Authentication Provider</p>
                <p className="text-sm text-gray-600">Microsoft Azure AD</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">User ID</p>
                <p className="text-sm text-gray-600">{profile?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
