import { Router } from 'express';

import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { BuildingModel } from './building.model.js';
import { DepartmentModel } from './department.model.js';
import { PanelModel } from './panel.model.js';
import { PlantModel } from './plant.model.js';

export const hierarchyTreeRouter = Router();

hierarchyTreeRouter.use(requireAuth);

const buildPlantTree = async () => {
  const plants = await PlantModel.find({ status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();

  return Promise.all(
    plants.map(async (plant) => {
      const buildings = await BuildingModel.find({ plantId: plant._id, status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();

      const buildingsWithDepartments = await Promise.all(
        buildings.map(async (building) => {
          const departments = await DepartmentModel.find({ buildingId: building._id, status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();

          const departmentsWithPanels = await Promise.all(
            departments.map(async (department) => {
              const panels = await PanelModel.find({ departmentId: department._id, status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();
              return { ...department.toJSON(), panels };
            }),
          );

          return { ...building.toJSON(), departments: departmentsWithPanels };
        }),
      );

      return { ...plant.toJSON(), buildings: buildingsWithDepartments };
    }),
  );
};

hierarchyTreeRouter.get(
  '/tree',
  asyncHandler(async (_request, response) => {
    const plantTree = await buildPlantTree();
    response.status(200).json({ data: plantTree });
  }),
);

hierarchyTreeRouter.get(
  '/plants/tree',
  asyncHandler(async (_request, response) => {
    const plantTree = await buildPlantTree();
    response.status(200).json({ data: plantTree });
  }),
);

hierarchyTreeRouter.get(
  '/buildings/tree',
  asyncHandler(async (_request, response) => {
    const buildings = await BuildingModel.find({ status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();

    const tree = await Promise.all(
      buildings.map(async (building) => {
        const departments = await DepartmentModel.find({ buildingId: building._id, status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();
        const departmentsWithPanels = await Promise.all(
          departments.map(async (department) => {
            const panels = await PanelModel.find({ departmentId: department._id, status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();
            return { ...department.toJSON(), panels };
          }),
        );

        return { ...building.toJSON(), departments: departmentsWithPanels };
      }),
    );

    response.status(200).json({ data: tree });
  }),
);

hierarchyTreeRouter.get(
  '/departments/tree',
  asyncHandler(async (_request, response) => {
    const departments = await DepartmentModel.find({ status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();

    const tree = await Promise.all(
      departments.map(async (department) => {
        const panels = await PanelModel.find({ departmentId: department._id, status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();
        return { ...department.toJSON(), panels };
      }),
    );

    response.status(200).json({ data: tree });
  }),
);
