import express, { Router, Request, Response } from 'express';
import { validateData } from '../../utils/middleware/validation.middleware';
import { UserLoginSchema, userLoginSchema, UserRegisterSchema, userRegisterSchema, userStatusSchema } from './types';
import authManager from '../../utils/services/auth.manager';
import { StatusCodes } from 'http-status-codes';

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

router.post('/login',
  validateData(userLoginSchema),
  async (req: Request, res: Response) => {
  const loginData: UserLoginSchema = req.body;

  const { status, response } = await authManager.loginUser(loginData);

  if (status === StatusCodes.OK) {
    res.cookie('Authorization', 'Bearer ' + response, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    res.status(status).send({ response: 'Logged in successfully' });
    return;
  }

  res.status(status).send({ response });
});

router.get('/status',
  validateData(userStatusSchema, 'cookies'),
  async (req: Request, res: Response) => {
  const token = req.cookies.Authorization;

  const { status, response } = await authManager.getUserStatus(token);

  res.status(status).send({ response });
});

export default router;
