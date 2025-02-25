import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
const app = express();
const port = 3001;

app.get('/', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).send('hello');
});

app.listen(port, () => {
  return console.log(`Running on http://localhost:${port}`);
});
