import type { NextFunction, Request, Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  if (!err || typeof err !== 'object') {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    return;
  }

  if (!('status' in err) || typeof err.status !== 'number') {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });

    return;
  }

  if (!('message' in err)) {
    res
      .status(err.status)
      .json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    return;
  }

  res.status(err.status).send({ error: err.message });
};
