import { apiRequest, downloadCsv } from '../../services/api'
import type { MaintenanceFormPayload, MaintenanceRecord } from './types'

const buildAuthHeaders = (token: string | null) => ({ token })

const compactPayload = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== '')) as Partial<T>

const buildQuery = (params?: Record<string, string>) => {
  const query = new URLSearchParams()

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      query.set(key, value)
    }
  })

  return query.toString()
}

export const maintenanceApi = {
  list: (token: string | null, params?: Record<string, string>) => {
    const query = buildQuery(params)
    return apiRequest<MaintenanceRecord[]>(`/maintenance${query ? `?${query}` : ''}`, buildAuthHeaders(token))
  },
  upcoming: (token: string | null, days = 30) =>
    apiRequest<MaintenanceRecord[]>(`/maintenance/upcoming?days=${days}`, buildAuthHeaders(token)),
  overdue: (token: string | null) =>
    apiRequest<MaintenanceRecord[]>('/maintenance/overdue', buildAuthHeaders(token)),
  create: (token: string | null, payload: MaintenanceFormPayload) =>
    apiRequest<MaintenanceRecord>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(compactPayload(payload)),
      ...buildAuthHeaders(token),
    }),
  update: (token: string | null, id: string, payload: Partial<MaintenanceFormPayload>) =>
    apiRequest<MaintenanceRecord>(`/maintenance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(compactPayload(payload)),
      ...buildAuthHeaders(token),
    }),
  exportCsv: (token: string | null, params?: Record<string, string>) => {
    const query = buildQuery(params)
    return downloadCsv(token, `/exports/maintenance.csv${query ? `?${query}` : ''}`, 'maintenance.csv')
  },
}
