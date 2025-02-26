import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import authRouter from './routes/auth';

const app = express();
const port = 3001;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).send('hello');
});

app.use('/auth', authRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    return console.log(`Running on http://localhost:${port}`);
  });
}

export default app;
