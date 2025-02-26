import express, { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const router: Router = express.Router();

router.post('/register', (req: Request, res: Response) => {
  res
    .status(StatusCodes.CREATED)
    .json({ response: 'User registered successfully' });
});

export default router;
