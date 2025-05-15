import express, { Router, Request, Response } from 'express';
import { validateAndExtractAuthToken } from '../../../utils/middleware/authToken.middleware';
import projectsManager from '../../../utils/services/projects.manager';
import { validateData } from '../../../utils/middleware/validation.middleware';
import {
  projectAddParticipantSchema,
  projectAddParticipantData,
  projectGetAllParticipantSchema,
  projectGetParticipantIdSchema,
  projectUpdateParticipantCriteriaSchema,
  projectUpdateParticipantCriteriaData,
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

router.get(
  '/get-all/:projectId',
  validateAndExtractAuthToken(),
  validateData(projectGetAllParticipantSchema, 'params'),
  async (req: Request, res: Response) => {
    const userId = req.userId;
    const projectId = req.params.projectId;

    const { status, response } = await projectsManager.getAllParticipants(
      userId ?? '',
      projectId
    );
    res.status(status).send({ response });
  }
);

router.get(
  '/criteria/get/:participantId',
  validateAndExtractAuthToken(),
  validateData(projectGetParticipantIdSchema, 'params'),
  async (req: Request, res: Response) => {
    const userId = req.userId;
    const participantId = req.params.participantId;

    const { status, response } = await projectsManager.getParticipantCriteria(
      userId ?? '',
      participantId
    );
    res.status(status).send({ response });
  }
);

router.put(
  '/criteria/update/:participantId',
  validateAndExtractAuthToken(),
  validateData(projectUpdateParticipantCriteriaSchema),
  async (req: Request, res: Response) => {
    const userId = req.userId;
    const participantId = req.params.participantId;
    const data: projectUpdateParticipantCriteriaData = req.body;

    const { status, response } = await projectsManager.updateParticipantCriteria(
      userId ?? '',
      participantId,
      data.criteria
    );

    res.status(status).send({ response });
  }
);

export default router;
