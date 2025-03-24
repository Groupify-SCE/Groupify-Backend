import express, { Router, Request, Response } from 'express';
import { validateAndExtractAuthToken } from '../../utils/middleware/authToken.middleware';
import projectsManager from '../../utils/services/projects.manager';
import { validateData } from '../../utils/middleware/validation.middleware';
import { projectDeleteSchema } from './types';

const router: Router = express.Router();

router.post(
  '/create',
  validateAndExtractAuthToken(),
  async (req: Request, res: Response) => {
    const userId = req.userId;

    const { status, response } = await projectsManager.createProject(
      userId ?? ''
    );
    res.status(status).send({ response });
  }
);

router.get(
  '/get-all',
  validateAndExtractAuthToken(),
  async (req: Request, res: Response) => {
    const userId = req.userId;

    const { status, response } = await projectsManager.getAllProjects(
      userId ?? ''
    );
    res.status(status).send({ response });
  }
);

router.delete(
  '/delete/:projectId',
  validateAndExtractAuthToken(),
  validateData(projectDeleteSchema, 'params'),
  async (req: Request, res: Response) => {
    const userId = req.userId;
    const projectId = req.params.projectId;

    const { status, response } = await projectsManager.deleteProject(
      userId ?? '',
      projectId
    );
    res.status(status).send({ response });
  }
);

export default router;
