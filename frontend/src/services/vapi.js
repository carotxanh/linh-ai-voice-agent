const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function apiFetch(path, options = {}) {
  const headers = options.body instanceof FormData
    ? options.headers || {}
    : {
      'Content-Type': 'application/json',
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

export function getVapiDashboard(limit = 50) {
  return apiFetch(`/api/vapi/dashboard?limit=${limit}`)
}

export function getVapiCalls(limit = 100) {
  return apiFetch(`/api/vapi/calls?limit=${limit}`)
}

export function getVapiCall(callId) {
  return apiFetch(`/api/vapi/calls/${callId}`)
}

export function getVapiFiles() {
  return apiFetch('/api/vapi/files')
}

export function uploadVapiFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  return apiFetch('/api/vapi/files', {
    method: 'POST',
    body: formData,
  })
}

export function getVapiAssistants(limit = 100) {
  return apiFetch(`/api/vapi/assistants?limit=${limit}`)
}

export function getVapiPhoneNumbers(limit = 100) {
  return apiFetch(`/api/vapi/phone-numbers?limit=${limit}`)
}

export function updateVapiAssistant(assistantId, payload) {
  return apiFetch(`/api/vapi/assistants/${assistantId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function updateVapiPhoneNumber(phoneNumberId, payload) {
  return apiFetch(`/api/vapi/phone-numbers/${phoneNumberId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
