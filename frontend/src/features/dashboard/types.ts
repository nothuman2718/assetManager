import type { Asset } from '../assets/types'

export type DashboardSummary = {
  totalPlants: number
  totalBuildings: number
  totalAssets: number
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  maintenanceDue: number
  upcomingMaintenance: number
  overdueMaintenance: number
}

export type DashboardBucket = {
  label: string
  count: number
}

export type DashboardMaintenance = {
  upcoming: number
  overdue: number
  byStatus: DashboardBucket[]
}

export type DashboardData = {
  summary: DashboardSummary
  assetsByCategory: DashboardBucket[]
  deviceStatus: DashboardBucket[]
  maintenance: DashboardMaintenance
  recentAssets: Asset[]
}
