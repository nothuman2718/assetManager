import { Building2, DatabaseZap, Layers3, Network, Plus, Trees, Warehouse } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { hierarchyApi } from './api'
import type { Plant, PlantTree } from './types'

const initialPlantForm = { name: '', code: '' }
const initialBuildingForm = { name: '', code: '', plantId: '' }
const initialDepartmentForm = { name: '', code: '', buildingId: '' }
const initialPanelForm = { name: '', code: '', departmentId: '' }

export const HierarchyPage = () => {
  const { token, user } = useAuth()
  const [plants, setPlants] = useState<Plant[]>([])
  const [tree, setTree] = useState<PlantTree[]>([])
  const [selectedPlantId, setSelectedPlantId] = useState<string>('')
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [plantForm, setPlantForm] = useState(initialPlantForm)
  const [buildingForm, setBuildingForm] = useState(initialBuildingForm)
  const [departmentForm, setDepartmentForm] = useState(initialDepartmentForm)
  const [panelForm, setPanelForm] = useState(initialPanelForm)

  const canManageHierarchy = user?.role !== 'Operator'

  const loadData = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const [plantResponse, treeResponse] = await Promise.all([
        hierarchyApi.listPlants(token),
        hierarchyApi.getTree(token),
      ])

      setPlants(plantResponse)
      setTree(treeResponse)

      if (!selectedPlantId && plantResponse[0]) {
        setSelectedPlantId(plantResponse[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hierarchy')
    } finally {
      setLoading(false)
    }
  }, [selectedPlantId, token])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleCreateSampleHierarchy = async () => {
    if (!token) {
      return
    }

    const suffix = Date.now().toString().slice(-5)

    try {
      setError(null)
      const plant = await hierarchyApi.createPlant(token, {
        name: 'Sample Manufacturing Plant',
        code: `PLT-${suffix}`,
      })
      const building = await hierarchyApi.createBuilding(token, {
        name: 'Main Utility Building',
        code: `BLD-${suffix}`,
        plantId: plant.id,
      })
      const department = await hierarchyApi.createDepartment(token, {
        name: 'Electrical Distribution',
        code: `DEP-${suffix}`,
        buildingId: building.id,
      })
      const panel = await hierarchyApi.createPanel(token, {
        name: 'Main LT Panel',
        code: `PNL-${suffix}`,
        departmentId: department.id,
      })

      setSelectedPlantId(plant.id)
      setSelectedBuildingId(building.id)
      setSelectedDepartmentId(department.id)
      setPlantForm(initialPlantForm)
      setBuildingForm(initialBuildingForm)
      setDepartmentForm(initialDepartmentForm)
      setPanelForm(initialPanelForm)
      await loadData()
      setSelectedPlantId(plant.id)
      setSelectedBuildingId(building.id)
      setSelectedDepartmentId(panel.departmentId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sample hierarchy')
    }
  }

  const handleCreatePlant = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    try {
      await hierarchyApi.createPlant(token, plantForm)
      setPlantForm(initialPlantForm)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plant')
    }
  }

  const handleCreateBuilding = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    try {
      await hierarchyApi.createBuilding(token, {
        ...buildingForm,
        plantId: selectedPlantId,
      })
      setBuildingForm(initialBuildingForm)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create building')
    }
  }

  const handleCreateDepartment = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    try {
      await hierarchyApi.createDepartment(token, {
        ...departmentForm,
        buildingId: selectedBuildingId,
      })
      setDepartmentForm(initialDepartmentForm)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create department')
    }
  }

  const handleCreatePanel = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    try {
      await hierarchyApi.createPanel(token, {
        ...panelForm,
        departmentId: selectedDepartmentId,
      })
      setPanelForm(initialPanelForm)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create panel')
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Phase 3 hierarchy
            </p>
            <h1 className="text-3xl font-bold text-slate-950">Plant hierarchy</h1>
          </div>
          <div className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
            {canManageHierarchy ? 'Create and manage' : 'View only access'}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <p className="max-w-3xl text-slate-600">
            Manage plants, buildings, departments, and panels from a tree-focused workspace with the same app styling and permissions as the rest of the product.
          </p>
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={() => void handleCreateSampleHierarchy()}
            disabled={!canManageHierarchy}
          >
            <DatabaseZap className="h-4 w-4" />
            Add sample hierarchy
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Trees className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-900">Hierarchy tree</h2>
          </div>
          {loading ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Loading hierarchy...
            </div>
          ) : (
            <div className="space-y-3">
              {tree.map((plant) => (
                <div key={plant.id} className="rounded-lg border border-slate-200 p-3">
                  <button
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-slate-50"
                    type="button"
                    onClick={() => setSelectedPlantId(plant.id)}
                  >
                    <span className="flex items-center gap-2 font-semibold text-slate-900">
                      <Warehouse className="h-4 w-4 text-teal-700" />
                      {plant.name} <span className="text-sm font-normal text-slate-500">({plant.code})</span>
                    </span>
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      {plant.buildings.length} buildings
                    </span>
                  </button>
                  <div className="ml-4 mt-3 space-y-2 border-l border-slate-200 pl-4">
                    {plant.buildings.map((building) => (
                      <div key={building.id} className="rounded-md border border-slate-100 bg-slate-50 p-2">
                        <button
                          className="flex w-full items-center justify-between text-left"
                          type="button"
                          onClick={() => setSelectedBuildingId(building.id)}
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <Building2 className="h-4 w-4 text-slate-600" />
                            {building.name} <span className="text-xs font-normal text-slate-500">({building.code})</span>
                          </span>
                          <span className="text-xs uppercase text-slate-500">
                            {building.departments.length} departments
                          </span>
                        </button>
                        <div className="ml-4 mt-2 space-y-2 border-l border-slate-200 pl-4">
                          {building.departments.map((department) => (
                            <div key={department.id} className="rounded-md border border-slate-100 bg-white p-2">
                              <button
                                className="flex w-full items-center justify-between text-left"
                                type="button"
                                onClick={() => setSelectedDepartmentId(department.id)}
                              >
                                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                  <Layers3 className="h-4 w-4 text-slate-600" />
                                  {department.name} <span className="text-xs font-normal text-slate-500">({department.code})</span>
                                </span>
                                <span className="text-xs uppercase text-slate-500">
                                  {department.panels.length} panels
                                </span>
                              </button>
                              <div className="ml-4 mt-2 space-y-2 border-l border-slate-200 pl-4">
                                {department.panels.map((panel) => (
                                  <div key={panel.id} className="flex items-center gap-2 text-sm text-slate-600">
                                    <Network className="h-4 w-4 text-slate-500" />
                                    {panel.name} <span className="text-xs text-slate-400">({panel.code})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {!canManageHierarchy ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Operators can inspect the hierarchy here, but create and edit actions are disabled.
            </div>
          ) : null}

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-teal-700" />
              <h2 className="text-xl font-semibold text-slate-900">Create plant</h2>
            </div>
            <form className="grid gap-3" onSubmit={handleCreatePlant}>
              <input
                className="min-h-11 rounded-md border border-slate-300 px-3"
                placeholder="Plant name"
                value={plantForm.name}
                onChange={(event) => setPlantForm((current) => ({ ...current, name: event.target.value }))}
                disabled={!canManageHierarchy}
              />
              <input
                className="min-h-11 rounded-md border border-slate-300 px-3"
                placeholder="Plant code"
                value={plantForm.code}
                onChange={(event) => setPlantForm((current) => ({ ...current, code: event.target.value }))}
                disabled={!canManageHierarchy}
              />
              <button className="min-h-11 rounded-md bg-teal-700 px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={!canManageHierarchy}>
                Save plant
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-teal-700" />
              <h2 className="text-xl font-semibold text-slate-900">Create building</h2>
            </div>
            <form className="grid gap-3" onSubmit={handleCreateBuilding}>
              <input
                className="min-h-11 rounded-md border border-slate-300 px-3"
                placeholder="Building name"
                value={buildingForm.name}
                onChange={(event) => setBuildingForm((current) => ({ ...current, name: event.target.value }))}
                disabled={!canManageHierarchy}
              />
              <input
                className="min-h-11 rounded-md border border-slate-300 px-3"
                placeholder="Building code"
                value={buildingForm.code}
                onChange={(event) => setBuildingForm((current) => ({ ...current, code: event.target.value }))}
                disabled={!canManageHierarchy}
              />
              <select
                className="min-h-11 rounded-md border border-slate-300 px-3"
                value={selectedPlantId}
                onChange={(event) => setSelectedPlantId(event.target.value)}
                disabled={!canManageHierarchy}
              >
                <option value="">Select plant</option>
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                  </option>
                ))}
              </select>
              <button className="min-h-11 rounded-md bg-teal-700 px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={!canManageHierarchy}>
                Save building
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Layers3 className="h-5 w-5 text-teal-700" />
              <h2 className="text-xl font-semibold text-slate-900">Create department</h2>
            </div>
            <form className="grid gap-3" onSubmit={handleCreateDepartment}>
              <input
                className="min-h-11 rounded-md border border-slate-300 px-3"
                placeholder="Department name"
                value={departmentForm.name}
                onChange={(event) => setDepartmentForm((current) => ({ ...current, name: event.target.value }))}
                disabled={!canManageHierarchy}
              />
              <input
                className="min-h-11 rounded-md border border-slate-300 px-3"
                placeholder="Department code"
                value={departmentForm.code}
                onChange={(event) => setDepartmentForm((current) => ({ ...current, code: event.target.value }))}
                disabled={!canManageHierarchy}
              />
              <select
                className="min-h-11 rounded-md border border-slate-300 px-3"
                value={selectedBuildingId}
                onChange={(event) => setSelectedBuildingId(event.target.value)}
                disabled={!canManageHierarchy}
              >
                <option value="">Select building</option>
                {tree
                  .flatMap((plant) => plant.buildings)
                  .map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
              </select>
              <button className="min-h-11 rounded-md bg-teal-700 px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={!canManageHierarchy}>
                Save department
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Network className="h-5 w-5 text-teal-700" />
              <h2 className="text-xl font-semibold text-slate-900">Create panel</h2>
            </div>
            <form className="grid gap-3" onSubmit={handleCreatePanel}>
              <input
                className="min-h-11 rounded-md border border-slate-300 px-3"
                placeholder="Panel name"
                value={panelForm.name}
                onChange={(event) => setPanelForm((current) => ({ ...current, name: event.target.value }))}
                disabled={!canManageHierarchy}
              />
              <input
                className="min-h-11 rounded-md border border-slate-300 px-3"
                placeholder="Panel code"
                value={panelForm.code}
                onChange={(event) => setPanelForm((current) => ({ ...current, code: event.target.value }))}
                disabled={!canManageHierarchy}
              />
              <select
                className="min-h-11 rounded-md border border-slate-300 px-3"
                value={selectedDepartmentId}
                onChange={(event) => setSelectedDepartmentId(event.target.value)}
                disabled={!canManageHierarchy}
              >
                <option value="">Select department</option>
                {tree
                  .flatMap((plant) => plant.buildings)
                  .flatMap((building) => building.departments)
                  .map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
              </select>
              <button className="min-h-11 rounded-md bg-teal-700 px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={!canManageHierarchy}>
                Save panel
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
