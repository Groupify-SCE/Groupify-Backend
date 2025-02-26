import express, { Router, Request, Response } from 'express';
import { validateData } from '../../utils/middleware/validation.middleware';
import { userRegisterSchema } from './types';
import asyncHandler from '../../utils/errorHandling/asyncHandler';

const router: Router = express.Router();

router.post(
  '/register',
  validateData(userRegisterSchema),
  asyncHandler(async (req: Request, res: Response) => {
    res.status(201).send({ response: 'User registered successfully' });
  })
);

export default router;
