import express, { Router, Request, Response } from 'express';
import { validateData } from '../../utils/middleware/validation.middleware';
import { algorithmInputSchema } from './types';
import { validateAndExtractAuthToken } from '../../utils/middleware/authToken.middleware';

const router: Router = express.Router();

router.post(
  '/',
  validateData(algorithmInputSchema),
  validateAndExtractAuthToken(),
  async (req: Request, res: Response) => {
    res.status(500).send({ response: 'Not implemented' });
  }
);

export default router;
