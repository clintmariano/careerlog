import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react'
import { loginRequest } from './config'
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <>
      <AuthenticatedTemplate>
        {children}
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <LoginPage />
      </UnauthenticatedTemplate>
    </>
  )
}

const LoginPage = () => {
  const { instance } = useMsal()

  const handleLogin = async () => {
    await instance.loginPopup(loginRequest)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CareerLog
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Job Search Journal - Track your career journey
          </p>
        </div>
        <div>
          <button
            onClick={handleLogin}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in with Microsoft
          </button>
        </div>
      </div>
    </div>
  )
}

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { accounts } = useMsal()

  if (accounts.length === 0) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}