import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../../src/app';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../src/utils/services/auth.manager', () => ({
  __esModule: true,
  default: {
    registerUser: jest.fn().mockImplementation((userData) => {
      if (userData.email === 'test@example.com') {
        return {
          status: StatusCodes.CREATED,
          response: 'User registered successfully',
        };
      }
      return {
        status: StatusCodes.BAD_REQUEST,
        response: 'Email already exists',
      };
    }),
    loginUser: jest.fn().mockImplementation((userData) => {
      if (
        userData.identifier === 'test@example.com' &&
        userData.password === 'Password123!'
      ) {
        return {
          status: StatusCodes.OK,
          response: 'Logged in successfully',
          token: 'fake-jwt-token',
        };
      }
      return {
        status: StatusCodes.UNAUTHORIZED,
        response: 'Invalid credentials',
      };
    }),
    getUserStatus: jest.fn().mockImplementation((userId) => {
      if (userId === 'validUserId') {
        return {
          status: StatusCodes.OK,
          response: {
            id: 'validUserId',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
          },
        };
      }
      return {
        status: StatusCodes.NOT_FOUND,
        response: 'User not found',
      };
    }),
    requestResetPassword: jest.fn().mockImplementation((data) => {
      if (data.email === 'test@example.com') {
        return {
          status: StatusCodes.OK,
          response: 'Password reset email sent',
        };
      }
      return {
        status: StatusCodes.NOT_FOUND,
        response: 'User not found',
      };
    }),
    resetPassword: jest.fn().mockImplementation((data) => {
      if (data.token === 'valid-token') {
        return {
          status: StatusCodes.OK,
          response: 'Password reset successful',
        };
      }
      return {
        status: StatusCodes.BAD_REQUEST,
        response: 'Invalid or expired token',
      };
    }),
  },
}));

jest.mock('../../src/utils/middleware/authToken.middleware', () => ({
  validateAndExtractAuthToken:
    () =>
    (req: Request & { userId?: string }, res: Response, next: NextFunction) => {
      req.userId = 'validUserId';
      next();
    },
}));

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirmation: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser123',
      });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body.response).toBe('User registered successfully');
    });

    test('should fail if user already exists', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'existing@example.com',
        password: 'Password123!',
        passwordConfirmation: 'Password123!',
        firstName: 'Existing',
        lastName: 'User',
        username: 'existinguser123',
      });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.response).toBe('Email already exists');
    });
  });

  describe('POST /auth/login', () => {
    test('should login successfully with valid credentials', async () => {
      const response = await request(app).post('/auth/login').send({
        identifier: 'test@example.com',
        password: 'Password123!',
      });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toBe('Logged in successfully');
    });

    test('should fail with invalid credentials', async () => {
      const response = await request(app).post('/auth/login').send({
        identifier: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.response).toBe('Invalid credentials');
    });
  });

  describe('GET /auth/status', () => {
    test('should return user status for authenticated user', async () => {
      const response = await request(app).get('/auth/status');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toHaveProperty('id', 'validUserId');
    });
  });

  describe('POST /auth/request-reset-password', () => {
    test('should send reset password email for valid user', async () => {
      const response = await request(app)
        .post('/auth/request-reset-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toBe('Password reset email sent');
    });

    test('should fail for non-existent user', async () => {
      const response = await request(app)
        .post('/auth/request-reset-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.response).toBe('User not found');
    });
  });

  describe('POST /auth/reset-password', () => {
    test('should reset password with valid token', async () => {
      const response = await request(app).post('/auth/reset-password').send({
        token: 'valid-token',
        password: 'NewPassword123!',
        passwordConfirmation: 'NewPassword123!',
      });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toBe('Password reset successful');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app).post('/auth/reset-password').send({
        token: 'invalid-token',
        password: 'NewPassword123!',
        passwordConfirmation: 'NewPassword123!',
      });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.response).toBe('Invalid or expired token');
    });
  });

  describe('POST /auth/logout', () => {
    test('should logout authenticated user', async () => {
      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toBe('Logged out successfully');
    });
  });
});
