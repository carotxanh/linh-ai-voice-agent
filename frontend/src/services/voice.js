import { getAuthToken } from '../utils/auth'
import { apiUrl } from '../config/api'

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

  const response = await fetch(apiUrl(path), {
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
  return apiFetch(`/voice/dashboard?limit=${limit}`)
}

export function getAccountIntegration() {
  return apiFetch('/account/integration')
}

export function updateAccountIntegration(payload) {
  return apiFetch('/account/integration', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function getVoiceCalls(limit = 100) {
  return apiFetch(`/voice/calls?limit=${limit}`)
}

export function getVoiceCall(callId) {
  return apiFetch(`/voice/calls/${callId}`)
}

export function getVoiceFiles() {
  return apiFetch('/voice/files')
}

export function uploadVoiceFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  return apiFetch('/voice/files', {
    method: 'POST',
    body: formData,
  })
}

export function deleteVoiceFile(fileId, knowledgeBaseId) {
  const query = knowledgeBaseId ? `?knowledge_base_id=${encodeURIComponent(knowledgeBaseId)}` : ''
  return apiFetch(`/voice/files/${encodeURIComponent(fileId)}${query}`, {
    method: 'DELETE',
  })
}

export function getVoiceAssistants(limit = 100) {
  return apiFetch(`/voice/assistants?limit=${limit}`)
}

export function getVoicePhoneNumbers(limit = 100) {
  return apiFetch(`/voice/phone-numbers?limit=${limit}`)
}

export function updateVoiceAssistant(assistantId, payload) {
  return apiFetch(`/voice/assistants/${assistantId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function updateVoicePhoneNumber(phoneNumberId, payload) {
  return apiFetch(`/voice/phone-numbers/${phoneNumberId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function createRetellDemoCall(demoType) {
  return apiFetch('/retell/demo-call', {
    method: 'POST',
    body: JSON.stringify({ demoType }),
  })
}
