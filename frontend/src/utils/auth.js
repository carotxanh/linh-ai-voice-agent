// Mock authentication system
const MOCK_USER = {
  email: 'nhaxevanminh@example.com',
  password: '123456',
  name: 'Nhà Xe Vạn Minh',
  role: 'admin',
}

export const login = (email, password) => {
  if (email === MOCK_USER.email && password === MOCK_USER.password) {
    const user = {
      email: MOCK_USER.email,
      name: MOCK_USER.name,
      role: MOCK_USER.role,
    }
    localStorage.setItem('user', JSON.stringify(user))
    return { success: true, user }
  }
  return { success: false, error: 'Email hoặc mật khẩu không đúng' }
}

export const logout = () => {
  localStorage.removeItem('user')
}

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const isAuthenticated = () => {
  return getCurrentUser() !== null
}
