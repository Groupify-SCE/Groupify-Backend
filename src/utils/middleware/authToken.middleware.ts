import { Request, Response, NextFunction } from 'express';
import { validateData } from './validation.middleware';
import { userAuthTokenSchema } from '../../routes/auth/types';
import jwtService from '../services/jwt.service';
import { StatusCodes } from 'http-status-codes';

export function validateAndExtractAuthToken() {
  return (req: Request, res: Response, next: NextFunction) => {
    validateData(userAuthTokenSchema, 'cookies')(
      req,
      res,
      (validationError?: unknown) => {
        if (validationError) {
          return next(validationError);
        }

        const header = req.cookies['Authorization'];
        if (!header || !header.startsWith('Bearer ')) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            response:
              'Authorization header missing or not in the expected format.',
          });
        }

        const token = header.replace('Bearer ', '').trim();
        if (!token) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            response: 'No token provided.',
          });
        }
        const payload = jwtService.verifyToken(token);
        if (!payload) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            response: 'Invalid token.',
          });
        }
        if (payload.type !== 'auth') {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            response: 'Invalid token payload.',
          });
        }
        req.userId = payload.userId;
        next();
      }
    );
  };
}
