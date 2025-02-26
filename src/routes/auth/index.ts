import express, { Router, Request, Response } from 'express';
import { validateData } from '../../utils/middleware/validation.middleware';
import { UserRegisterSchema, userRegisterSchema } from './types';
import authManager from '../../utils/services/auth.manager';

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

export default router;
