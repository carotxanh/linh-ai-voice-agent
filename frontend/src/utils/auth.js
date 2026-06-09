const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const TOKEN_KEY = 'linhvoice_access_token'
const USER_KEY = 'linhvoice_user'

async function authFetch(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.detail || 'Không thể xác thực tài khoản')
  }

  return body
}

function persistSession(data) {
  const user = {
    ...data.user,
    name: data.user.full_name,
  }
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const login = async (email, password) => {
  try {
    const data = await authFetch('/api/auth/login', { email, password })
    persistSession(data)
    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const register = async ({ email, password, fullName }) => {
  try {
    const data = await authFetch('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    })
    persistSession(data)
    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY)

export const getCurrentUser = () => {
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export const isAuthenticated = () => Boolean(getAuthToken() && getCurrentUser())
