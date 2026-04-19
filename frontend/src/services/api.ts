import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
})

api.interceptors.request.use(async (config) => {
  const methods = ['post', 'put', 'patch', 'delete']
  if (config.method && methods.includes(config.method)) {
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Avoid infinite loop if already on auth pages
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
