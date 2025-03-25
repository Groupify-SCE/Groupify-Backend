import express, { Router, Request, Response } from 'express';
import { validateAndExtractAuthToken } from '../../../utils/middleware/authToken.middleware';
import projectsManager from '../../../utils/services/projects.manager';
import { validateData } from '../../../utils/middleware/validation.middleware';
import { projectAddParticipantSchema } from './types';

const router: Router = express.Router();

router.post(
  '/add',
  validateAndExtractAuthToken(),
  validateData(projectAddParticipantSchema),
  async (req: Request, res: Response) => {
    const userId = req.userId;
  }
);

export default router;
