import axios from 'axios'
import { apiConfig } from '@/auth/config'
import { msalInstance } from '@/auth/msalInstance'

const axiosInstance = axios.create({
  baseURL: apiConfig.uri,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  async (config) => {
    const accounts = msalInstance.getAllAccounts()
    if (accounts.length > 0) {
      const response = await msalInstance.acquireTokenSilent({
        scopes: apiConfig.scopes,
        account: accounts[0],
      })
      config.headers.Authorization = `Bearer ${response.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        try {
          await msalInstance.acquireTokenSilent({
            scopes: apiConfig.scopes,
            account: accounts[0],
          })
        } catch (err) {
          msalInstance.logoutRedirect()
        }
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
