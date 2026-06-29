import { apiRequest } from '../../services/api'
import type { Asset } from '../assets/types'
import type { DashboardBucket, DashboardMaintenance, DashboardSummary } from './types'

const buildAuthHeaders = (token: string | null) => ({ token })

export const dashboardApi = {
  summary: (token: string | null) =>
    apiRequest<DashboardSummary>('/dashboard/summary', buildAuthHeaders(token)),
  assetsByCategory: (token: string | null) =>
    apiRequest<DashboardBucket[]>('/dashboard/assets-by-category', buildAuthHeaders(token)),
  deviceStatus: (token: string | null) =>
    apiRequest<DashboardBucket[]>('/dashboard/device-status', buildAuthHeaders(token)),
  maintenance: (token: string | null) =>
    apiRequest<DashboardMaintenance>('/dashboard/maintenance', buildAuthHeaders(token)),
  recentAssets: (token: string | null) =>
    apiRequest<Asset[]>('/dashboard/recent-assets?limit=5', buildAuthHeaders(token)),
}
