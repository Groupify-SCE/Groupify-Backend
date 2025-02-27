import express, { Router, Request, Response } from 'express';
import { validateData } from '../../utils/middleware/validation.middleware';
import {
  ResetPasswordRequestSchema,
  resetPasswordRequestSchema,
  ResetPasswordSchema,
  resetPasswordSchema,
  UserLoginSchema,
  userLoginSchema,
  UserRegisterSchema,
  userRegisterSchema,
} from './types';
import authManager from '../../utils/services/auth.manager';
import { StatusCodes } from 'http-status-codes';
import { validateAndExtractAuthToken } from '../../utils/middleware/authToken.middleware';

const router: Router = express.Router();

router.post(
  '/register',
  validateData(userRegisterSchema),
  async (req: Request, res: Response) => {
    const registerData: UserRegisterSchema = req.body;

    const { status, response } = await authManager.registerUser(registerData);

    res.status(status).send({ response });
  }
);

router.post(
  '/login',
  validateData(userLoginSchema),
  async (req: Request, res: Response) => {
    const loginData: UserLoginSchema = req.body;

    const { status, response } = await authManager.loginUser(loginData);

    if (status === StatusCodes.OK) {
      res.setHeader('Authorization', 'Bearer ' + response);

      res.status(status).send({ response: 'Logged in successfully' });
      return;
    }

    res.status(status).send({ response });
  }
);

router.get(
  '/status',
  validateAndExtractAuthToken(),
  async (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).send({ response: 'Unauthorized' });
      return;
    }

    const { status, response } = await authManager.getUserStatus(userId);

    res.status(status).send({ response });
  }
);

router.post(
  '/request-reset-password',
  validateData(resetPasswordRequestSchema),
  async (req: Request, res: Response) => {
    const resetPasswordData: ResetPasswordRequestSchema = req.body;
  }
);

router.post(
  '/reset-password',
  validateData(resetPasswordSchema),
  async (req: Request, res: Response) => {
    const resetPasswordData: ResetPasswordSchema = req.body;
  }
);

export default router;
