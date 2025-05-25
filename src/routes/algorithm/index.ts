import express, { Router, Request, Response } from 'express';
import { validateData } from '../../utils/middleware/validation.middleware';
import { algorithmInputSchema } from './types';
import { validateAndExtractAuthToken } from '../../utils/middleware/authToken.middleware';
import projectService from '../../utils/services/projects.manager';

const router: Router = express.Router();

router.put(
  '/:projectId',
  validateData(algorithmInputSchema, 'params'),
  validateAndExtractAuthToken(),
  async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const userId = req.userId!;
    const { status, response } = await projectService.runAlgorithm(
      userId,
      projectId
    );
    res.status(status).send({ response });
  }
);

router.get(
  '/:projectId',
  validateData(algorithmInputSchema, 'params'),
  validateAndExtractAuthToken(),
  async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const userId = req.userId!;
    const { status, response } = await projectService.getAlgorithmResults(
      userId,
      projectId
    );
    res.status(status).send({ response });
  }
);

export default router;
