import axios from 'axios'
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) window.dispatchEvent(new Event('session-expired'))
  return Promise.reject(error)
})
export const errorMessage = error => error.response?.data?.error || 'We couldn’t save your changes. Please try again.'
export default api
