export type MaintenanceStatus = 'scheduled' | 'completed' | 'overdue' | 'cancelled'

export type MaintenanceRecord = {
  id: string
  assetId: string
  lastInspectionDate?: string | null
  lastServiceDate?: string | null
  warrantyUntil?: string | null
  technician: string
  nextMaintenanceDate: string
  status: MaintenanceStatus
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export type MaintenanceFormPayload = {
  assetId: string
  lastInspectionDate?: string
  lastServiceDate?: string
  warrantyUntil?: string
  technician: string
  nextMaintenanceDate: string
  status?: MaintenanceStatus
  notes?: string
}
