import { apiRequest } from '../../services/api'
import type { Asset } from './types'
import type { Device } from './device-types'

type AssetListResponse = Asset[]

type DeviceListResponse = Device[]

const buildAuthHeaders = (token: string | null) => ({ token })

export const assetsApi = {
  listAssets: (token: string | null, params?: { search?: string; category?: string; status?: string }) => {
    const query = new URLSearchParams()

    if (params?.search) {
      query.set('search', params.search)
    }

    if (params?.category) {
      query.set('category', params.category)
    }

    if (params?.status) {
      query.set('status', params.status)
    }

    return apiRequest<AssetListResponse>(`/assets${query.toString() ? `?${query.toString()}` : ''}`, buildAuthHeaders(token))
  },
  createAsset: (token: string | null, asset: Partial<Asset> & { code: string; name: string; category: string; manufacturer: string; model: string; serialNumber: string }) =>
    apiRequest<Asset>('/assets', {
      method: 'POST',
      body: JSON.stringify(asset),
      ...buildAuthHeaders(token),
    }),
  getAsset: (token: string | null, id: string) => apiRequest<Asset>(`/assets/${id}`, buildAuthHeaders(token)),
  listDevices: (token: string | null, assetId: string) => apiRequest<DeviceListResponse>(`/devices?assetId=${assetId}`, buildAuthHeaders(token)),
  createDevice: (token: string | null, device: Partial<Device> & { assetId: string; name: string; protocol: string; port: number; communicationType: string; pollingInterval: number }) =>
    apiRequest<Device>('/devices', {
      method: 'POST',
      body: JSON.stringify(device),
      ...buildAuthHeaders(token),
    }),
  simulateDeviceStatus: (token: string | null, deviceId: string) =>
    apiRequest<Device>(`/devices/${deviceId}/simulate-status`, {
      method: 'POST',
      ...buildAuthHeaders(token),
    }),
}
