import express, { Router, Request, Response } from 'express';
import { validateAndExtractAuthToken } from '../../../utils/middleware/authToken.middleware';
import projectsManager from '../../../utils/services/projects.manager';
import { validateData } from '../../../utils/middleware/validation.middleware';
import {
  projectAddCriterionData,
  projectAddCriterionSchema,
  projectGetAllCriteriaSchema,
} from './types';

const router: Router = express.Router();

router.post(
  '/add',
  validateAndExtractAuthToken(),
  validateData(projectAddCriterionSchema),
  async (req: Request, res: Response) => {
    const userId = req.userId;
    const data: projectAddCriterionData = req.body;

    const { status, response } = await projectsManager.addCriterion(
      userId ?? '',
      data
    );
    res.status(status).send({ response });
  }
);

router.get(
  '/get-all/:projectId',
  validateAndExtractAuthToken(),
  validateData(projectGetAllCriteriaSchema, 'params'),
  async (req: Request, res: Response) => {
    const userId = req.userId;
    const projectId = req.params.projectId;

    const { status, response } = await projectsManager.getAllCriteria(
      userId ?? '',
      projectId
    );
    res.status(status).send({ response });
  }
);

export default router;
