import { apiUrl } from '../config/api'

export async function submitContactLead(payload) {
  const response = await fetch(apiUrl('/contact-leads'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.detail || `API request failed with status ${response.status}`)
  }

  return response.json()
}
