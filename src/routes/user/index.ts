import express, { Router, Request, Response } from 'express';
import { validateAndExtractAuthToken } from '../../utils/middleware/authToken.middleware';
import { StatusCodes } from 'http-status-codes';
import authManager from '../../utils/services/auth.manager';
import { userEditSchema, UserEditSchema } from './types';
import { validateData } from '../../utils/middleware/validation.middleware';

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

router.post(
  '/edit',
  validateData(userEditSchema),
  validateAndExtractAuthToken(),
  async (req: Request, res: Response) => {
    const userData: UserEditSchema = req.body;
    const userId = req.userId;

    const { status, response } = await authManager.editUser(
      userData,
      userId ?? ''
    );

    res.status(status).send({ response });
  }
);

export default router;
