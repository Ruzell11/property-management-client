import type { PropertyAgent, PropertyAgentForm } from '@/types/agent'
import { apiRequest } from './client'

export async function listAgents() {
  return apiRequest<PropertyAgent[]>('/api/property-agents')
}

export async function getAgent(id: string) {
  return apiRequest<PropertyAgent>(`/api/property-agents/${id}`)
}

export async function createAgent(body: PropertyAgentForm) {
  return apiRequest<PropertyAgent>('/api/property-agents', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function updateAgent(id: string, body: PropertyAgentForm) {
  return apiRequest<PropertyAgent>(`/api/property-agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function deleteAgent(id: string) {
  return apiRequest<unknown>(`/api/property-agents/${id}`, {
    method: 'DELETE',
  })
}
