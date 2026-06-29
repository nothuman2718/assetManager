export type AssetStatus = 'active' | 'inactive' | 'maintenance' | 'deleted'

export type Asset = {
  id: string
  name: string
  code: string
  category: string
  manufacturer: string
  model: string
  serialNumber: string
  plantId?: string | null
  buildingId?: string | null
  departmentId?: string | null
  panelId?: string | null
  status: AssetStatus
  createdAt: string
  updatedAt: string
}
