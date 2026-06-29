export type DeviceStatus = 'online' | 'offline' | 'maintenance' | 'disabled'

export type Device = {
  id: string
  assetId: string
  name: string
  ipAddress?: string | null
  protocol: string
  port: number
  modbusAddress?: number | null
  communicationType: string
  pollingInterval: number
  status: DeviceStatus
  createdAt: string
  updatedAt: string
}
