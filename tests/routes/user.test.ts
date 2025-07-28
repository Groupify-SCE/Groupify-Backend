import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../../src/app';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../src/utils/services/auth.manager', () => ({
  __esModule: true,
  default: {
    getUserInfo: jest.fn().mockImplementation((userId) => {
      if (userId === 'validUserId') {
        return {
          status: StatusCodes.OK,
          response: {
            id: 'validUserId',
            email: 'test@example.com',
            name: 'Test User',
            profilePicture: 'https://example.com/pic.jpg',
          },
        };
      }
      return {
        status: StatusCodes.NOT_FOUND,
        response: 'User not found',
      };
    }),
    editUser: jest.fn().mockImplementation((userData, userId) => {
      if (userId === 'validUserId') {
        return {
          status: StatusCodes.OK,
          response: {
            id: 'validUserId',
            ...userData,
          },
        };
      }
      return {
        status: StatusCodes.UNAUTHORIZED,
        response: 'Unauthorized',
      };
    }),
  },
}));

jest.mock('../../src/utils/middleware/authToken.middleware', () => ({
  validateAndExtractAuthToken:
    () =>
    (req: Request & { userId?: string }, res: Response, next: NextFunction) => {
      if (req.headers.authorization === 'Bearer valid-token') {
        req.userId = 'validUserId';
      }
      next();
    },
}));

describe('User Routes', () => {
  describe('GET /user', () => {
    test('should return user info for authenticated user', async () => {
      const response = await request(app)
        .get('/user')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toHaveProperty('id', 'validUserId');
      expect(response.body.response).toHaveProperty(
        'email',
        'test@example.com'
      );
      expect(response.body.response).toHaveProperty('name', 'Test User');
    });

    test('should fail for unauthenticated user', async () => {
      const response = await request(app)
        .get('/user')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.response).toBe('Unauthorized');
    });
  });

  describe('POST /user/edit', () => {
    test('should edit user info successfully', async () => {
      const updatedUserData = {
        name: 'Updated Name',
        profilePicture: 'https://example.com/new-pic.jpg',
      };

      const response = await request(app)
        .post('/user/edit')
        .set('Authorization', 'Bearer valid-token')
        .send(updatedUserData);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toHaveProperty('id', 'validUserId');
      expect(response.body.response).toHaveProperty('name', 'Updated Name');
      expect(response.body.response).toHaveProperty(
        'profilePicture',
        'https://example.com/new-pic.jpg'
      );
    });

    test('should fail for unauthenticated user', async () => {
      const updatedUserData = {
        name: 'Updated Name',
        profilePicture: 'https://example.com/new-pic.jpg',
      };

      const response = await request(app)
        .post('/user/edit')
        .set('Authorization', 'Bearer invalid-token')
        .send(updatedUserData);

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });
});
