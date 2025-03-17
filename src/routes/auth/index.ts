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
      res.cookie('Authorization', 'Bearer ' + response, {
        httpOnly: true,
        secure: process.env.PRODUCTION === 'production',
        sameSite: process.env.PRODUCTION === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        path: '/',
      });

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

    const { status, response } =
      await authManager.requestResetPassword(resetPasswordData);

    res.status(status).send({ response });
  }
);

router.post(
  '/reset-password',
  validateData(resetPasswordSchema),
  async (req: Request, res: Response) => {
    const resetPasswordData: ResetPasswordSchema = req.body;

    const { status, response } =
      await authManager.resetPassword(resetPasswordData);

    res.status(status).send({ response });
  }
);

router.post(
  '/logout',
  validateAndExtractAuthToken(),
  (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).send({ response: 'Unauthorized' });
      return;
    }

    res.clearCookie('Authorization', {
      httpOnly: true,
      secure: process.env.PRODUCTION === 'production',
      sameSite: process.env.PRODUCTION === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.status(StatusCodes.OK).send({ response: 'Logged out successfully' });
  }
);

export default router;
