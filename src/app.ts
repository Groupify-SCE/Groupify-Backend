import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import authRouter from './routes/auth';
import algorithmRouter from './routes/algorithm';
import userRouter from './routes/user';
import cookieParser from 'cookie-parser';
const app = express();
const port = 3001;

const allowedOrigins = [
  'http://localhost:3000',
  'https://groupify-frontend.onrender.com',
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).send('hello');
});

app.use('/auth', authRouter);
app.use('/algorithm', algorithmRouter);
app.use('/user', userRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`);
  });
}

export default app;
