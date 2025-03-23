import express, { Router, Request, Response } from 'express';
import { validateAndExtractAuthToken } from '../../utils/middleware/authToken.middleware';

const router: Router = express.Router();

router.post(
    '/create',
    validateAndExtractAuthToken(),
    async (req: Request, res: Response) => {
      const userId = req.userId;
    }
  );

export default router;