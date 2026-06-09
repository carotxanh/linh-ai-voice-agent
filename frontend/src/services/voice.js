import { getAuthToken } from '../utils/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function apiFetch(path, options = {}) {
  const token = getAuthToken()
  const headers = options.body instanceof FormData
    ? {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    }
    : {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.detail || `API request failed with status ${response.status}`)
  }

  return response.json()
}

export function getVoiceDashboard(limit = 50) {
  return apiFetch(`/api/voice/dashboard?limit=${limit}`)
}

export function getAccountIntegration() {
  return apiFetch('/api/account/integration')
}

export function updateAccountIntegration(payload) {
  return apiFetch('/api/account/integration', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function getVoiceCalls(limit = 100) {
  return apiFetch(`/api/voice/calls?limit=${limit}`)
}

export function getVoiceCall(callId) {
  return apiFetch(`/api/voice/calls/${callId}`)
}

export function getVoiceFiles() {
  return apiFetch('/api/voice/files')
}

export function uploadVoiceFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  return apiFetch('/api/voice/files', {
    method: 'POST',
    body: formData,
  })
}

export function getVoiceAssistants(limit = 100) {
  return apiFetch(`/api/voice/assistants?limit=${limit}`)
}

export function getVoicePhoneNumbers(limit = 100) {
  return apiFetch(`/api/voice/phone-numbers?limit=${limit}`)
}

export function updateVoiceAssistant(assistantId, payload) {
  return apiFetch(`/api/voice/assistants/${assistantId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function updateVoicePhoneNumber(phoneNumberId, payload) {
  return apiFetch(`/api/voice/phone-numbers/${phoneNumberId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
