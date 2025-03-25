import express, { Router, Request, Response } from 'express';
import { validateAndExtractAuthToken } from '../../../utils/middleware/authToken.middleware';
import projectsManager from '../../../utils/services/projects.manager';
import { validateData } from '../../../utils/middleware/validation.middleware';
import {
  projectAddParticipantSchema,
  projectAddParticipantData,
} from './types';

const router: Router = express.Router();

router.post(
  '/add',
  validateAndExtractAuthToken(),
  validateData(projectAddParticipantSchema),
  async (req: Request, res: Response) => {
    const userId = req.userId;
    const data: projectAddParticipantData = req.body;

    const { status, response } = await projectsManager.addParticipant(
      userId ?? '',
      data
    );
    res.status(status).send({ response });
  }
);

export default router;
