import { apiUrl } from '../config/api'

const TOKEN_KEY = 'linhvoice_access_token'
const USER_KEY = 'linhvoice_user'

async function authFetch(path, payload) {
  const response = await fetch(apiUrl(path), {
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
    const data = await authFetch('/auth/login', { email, password })
    persistSession(data)
    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const register = async ({ email, password, fullName }) => {
  try {
    const data = await authFetch('/auth/register', {
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
