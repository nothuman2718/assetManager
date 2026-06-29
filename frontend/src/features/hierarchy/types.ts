export type HierarchyNodeStatus = 'active' | 'inactive' | 'deleted'

export type Plant = {
  id: string
  name: string
  code: string
  status: HierarchyNodeStatus
  createdAt: string
  updatedAt: string
}

export type Building = {
  id: string
  name: string
  code: string
  plantId: string
  status: HierarchyNodeStatus
  createdAt: string
  updatedAt: string
}

export type Department = {
  id: string
  name: string
  code: string
  buildingId: string
  status: HierarchyNodeStatus
  createdAt: string
  updatedAt: string
}

export type Panel = {
  id: string
  name: string
  code: string
  departmentId: string
  status: HierarchyNodeStatus
  createdAt: string
  updatedAt: string
}

export type PlantTree = Plant & {
  buildings: Array<BuildingTree>
}

export type BuildingTree = Building & {
  departments: Array<DepartmentTree>
}

export type DepartmentTree = Department & {
  panels: Array<Panel>
}
