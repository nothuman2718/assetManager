import { apiRequest } from '../../services/api'
import type { Building, Department, Panel, Plant, PlantTree } from './types'

const buildAuthHeaders = (token: string | null) => ({ token })

export const hierarchyApi = {
  listPlants: (token: string | null) =>
    apiRequest<Plant[]>('/plants', buildAuthHeaders(token)),

  createPlant: (token: string | null, payload: { name: string; code: string }) =>
    apiRequest<Plant>('/plants', {
      method: 'POST',
      ...buildAuthHeaders(token),
      body: JSON.stringify(payload),
    }),

  listBuildings: (token: string | null, plantId?: string) =>
    apiRequest<Building[]>(
      plantId ? `/buildings?plantId=${plantId}` : '/buildings',
      buildAuthHeaders(token),
    ),

  createBuilding: (
    token: string | null,
    payload: { name: string; code: string; plantId: string },
  ) =>
    apiRequest<Building>('/buildings', {
      method: 'POST',
      ...buildAuthHeaders(token),
      body: JSON.stringify(payload),
    }),

  listDepartments: (token: string | null, buildingId?: string) =>
    apiRequest<Department[]>(
      buildingId ? `/departments?buildingId=${buildingId}` : '/departments',
      buildAuthHeaders(token),
    ),

  createDepartment: (
    token: string | null,
    payload: { name: string; code: string; buildingId: string },
  ) =>
    apiRequest<Department>('/departments', {
      method: 'POST',
      ...buildAuthHeaders(token),
      body: JSON.stringify(payload),
    }),

  listPanels: (token: string | null, departmentId?: string) =>
    apiRequest<Panel[]>(
      departmentId ? `/panels?departmentId=${departmentId}` : '/panels',
      buildAuthHeaders(token),
    ),

  createPanel: (
    token: string | null,
    payload: { name: string; code: string; departmentId: string },
  ) =>
    apiRequest<Panel>('/panels', {
      method: 'POST',
      ...buildAuthHeaders(token),
      body: JSON.stringify(payload),
    }),

  getTree: (token: string | null) =>
    apiRequest<PlantTree[]>('/hierarchy/plants/tree', buildAuthHeaders(token)),
}
