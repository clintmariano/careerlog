export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'your-client-id',
    authority: import.meta.env.VITE_AZURE_AUTHORITY || 'https://login.microsoftonline.com/common',
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || 'http://localhost:5173',
    postLogoutRedirectUri: '/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
}

const apiScope = import.meta.env.VITE_API_SCOPE || 'api://your-api-client-id/access_as_user'

export const loginRequest = { scopes: [apiScope, 'User.Read'] }

export const apiConfig = {
  uri: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  scopes: [apiScope],
}

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
}
