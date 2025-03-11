import express, { Router, Request, Response } from 'express';
import { validateAndExtractAuthToken } from '../../utils/middleware/authToken.middleware';

const router: Router = express.Router();

router.get(
  '/',
  validateAndExtractAuthToken(),
  async (req: Request, res: Response) => {
    res.status(500).send({ response: 'Not implemented' });
  }
);

export default router;
