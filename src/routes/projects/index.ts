import express, { Router, Request, Response } from 'express';
import { validateAndExtractAuthToken } from '../../utils/middleware/authToken.middleware';
import projectsManager from '../../utils/services/projects.manager';

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

export default router;
