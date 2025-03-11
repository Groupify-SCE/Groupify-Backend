import express, { Router, Request, Response } from 'express';
import { validateAndExtractAuthToken } from '../../utils/middleware/authToken.middleware';
import { StatusCodes } from 'http-status-codes';
import authManager from '../../utils/services/auth.manager';


const router: Router = express.Router();

router.get(
  '/',
  validateAndExtractAuthToken(),
  async (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).send({ response: 'Unauthorized' });
      return;
    }

    const { status, response } = await authManager.getUserInfo(userId);

    res.status(status).send({ response });
  }
);

export default router;
