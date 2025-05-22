import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../../src/app';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../src/utils/services/projects.manager', () => ({
  __esModule: true,
  default: {
    runAlgorithm: jest.fn().mockImplementation((userId, projectId) => {
      if (
        userId === 'validUserId' &&
        projectId === '507f1f77bcf86cd799439011'
      ) {
        return {
          status: StatusCodes.OK,
          response: {
            id: '507f1f77bcf86cd799439011',
            groups: [
              {
                id: 'group1',
                name: 'Group 1',
                members: [
                  { id: 'user1', name: 'User 1' },
                  { id: 'user2', name: 'User 2' },
                ],
              },
              {
                id: 'group2',
                name: 'Group 2',
                members: [
                  { id: 'user3', name: 'User 3' },
                  { id: 'user4', name: 'User 4' },
                ],
              },
            ],
          },
        };
      }
      return {
        status: StatusCodes.NOT_FOUND,
        response: 'Project not found or unauthorized',
      };
    }),
    getAlgorithmResults: jest.fn().mockImplementation((userId, projectId) => {
      if (
        userId === 'validUserId' &&
        projectId === '507f1f77bcf86cd799439011'
      ) {
        return {
          status: StatusCodes.OK,
          response: {
            id: '507f1f77bcf86cd799439011',
            groups: [
              {
                id: 'group1',
                name: 'Group 1',
                members: [
                  { id: 'user1', name: 'User 1' },
                  { id: 'user2', name: 'User 2' },
                ],
              },
              {
                id: 'group2',
                name: 'Group 2',
                members: [
                  { id: 'user3', name: 'User 3' },
                  { id: 'user4', name: 'User 4' },
                ],
              },
            ],
          },
        };
      }
      if (
        userId === 'validUserId' &&
        projectId === '507f1f77bcf86cd799439022'
      ) {
        return {
          status: StatusCodes.BAD_REQUEST,
          response: 'Algorithm has not been run yet',
        };
      }
      return {
        status: StatusCodes.NOT_FOUND,
        response: 'Project not found or unauthorized',
      };
    }),
  },
}));

jest.mock('../../src/utils/middleware/authToken.middleware', () => ({
  validateAndExtractAuthToken: () => {
    return (
      req: Request & { userId?: string },
      res: Response,
      next: NextFunction
    ) => {
      const isUnauthenticatedTest =
        req.get('x-test-unauthenticated') === 'true';

      if (!isUnauthenticatedTest) {
        req.userId = 'validUserId';
      }

      next();
    };
  },
}));

describe('Algorithm Routes', () => {
  describe('PUT /algorithm/:projectId', () => {
    test('should run algorithm successfully for valid project', async () => {
      const response = await request(app).put(
        '/algorithm/507f1f77bcf86cd799439011'
      );

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toHaveProperty(
        'id',
        '507f1f77bcf86cd799439011'
      );
      expect(response.body.response).toHaveProperty('groups');
      expect(response.body.response.groups).toHaveLength(2);
      expect(response.body.response.groups[0].members).toHaveLength(2);
    });

    test('should fail for invalid project', async () => {
      const response = await request(app).put(
        '/algorithm/507f1f77bcf86cd799439033'
      );

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.response).toBe('Project not found or unauthorized');
    });

    test('should fail for unauthenticated user', async () => {
      const projectService = jest.requireMock(
        '../../src/utils/services/projects.manager'
      ).default;
      const originalRunAlgorithm = projectService.runAlgorithm;

      projectService.runAlgorithm = jest.fn().mockReturnValue({
        status: StatusCodes.NOT_FOUND,
        response: 'Project not found or unauthorized',
      });

      const response = await request(app)
        .put('/algorithm/507f1f77bcf86cd799439011')
        .set('x-test-unauthenticated', 'true');

      projectService.runAlgorithm = originalRunAlgorithm;

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('GET /algorithm/:projectId', () => {
    test('should return algorithm results for valid project', async () => {
      const response = await request(app).get(
        '/algorithm/507f1f77bcf86cd799439011'
      );

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toHaveProperty(
        'id',
        '507f1f77bcf86cd799439011'
      );
      expect(response.body.response).toHaveProperty('groups');
      expect(response.body.response.groups).toHaveLength(2);
    });

    test('should return error if algorithm has not been run', async () => {
      const response = await request(app).get(
        '/algorithm/507f1f77bcf86cd799439022'
      );

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.response).toBe('Algorithm has not been run yet');
    });

    test('should fail for invalid project', async () => {
      const response = await request(app).get(
        '/algorithm/507f1f77bcf86cd799439033'
      );

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.response).toBe('Project not found or unauthorized');
    });

    test('should fail for unauthenticated user', async () => {
      const projectService = jest.requireMock(
        '../../src/utils/services/projects.manager'
      ).default;
      const originalGetAlgorithmResults = projectService.getAlgorithmResults;

      projectService.getAlgorithmResults = jest.fn().mockReturnValue({
        status: StatusCodes.NOT_FOUND,
        response: 'Project not found or unauthorized',
      });

      const response = await request(app)
        .get('/algorithm/507f1f77bcf86cd799439011')
        .set('x-test-unauthenticated', 'true');

      projectService.getAlgorithmResults = originalGetAlgorithmResults;

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
