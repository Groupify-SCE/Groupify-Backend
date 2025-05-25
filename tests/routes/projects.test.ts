import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../../src/app';
import { Request, Response, NextFunction } from 'express';

const VALID_PROJECT_ID = '507f1f77bcf86cd799439011';
const VALID_PROJECT_ID_2 = '507f1f77bcf86cd799439022';
const INVALID_PROJECT_ID = '507f1f77bcf86cd799439033';

jest.mock('../../src/utils/services/projects.manager', () => ({
  __esModule: true,
  default: {
    createProject: jest.fn().mockImplementation((userId) => {
      if (userId === 'validUserId') {
        return {
          status: StatusCodes.CREATED,
          response: {
            id: VALID_PROJECT_ID,
            name: 'New Project',
            owner: 'validUserId',
            createdAt: new Date().toISOString(),
          },
        };
      }
      return {
        status: StatusCodes.UNAUTHORIZED,
        response: 'Unauthorized',
      };
    }),
    getAllProjects: jest.fn().mockImplementation((userId) => {
      if (userId === 'validUserId') {
        return {
          status: StatusCodes.OK,
          response: [
            {
              id: VALID_PROJECT_ID,
              name: 'Project 1',
              owner: 'validUserId',
              createdAt: new Date().toISOString(),
            },
            {
              id: VALID_PROJECT_ID_2,
              name: 'Project 2',
              owner: 'validUserId',
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return {
        status: StatusCodes.UNAUTHORIZED,
        response: 'Unauthorized',
      };
    }),
    getProject: jest.fn().mockImplementation((userId, projectId) => {
      if (userId === 'validUserId' && projectId === VALID_PROJECT_ID) {
        return {
          status: StatusCodes.OK,
          response: {
            id: VALID_PROJECT_ID,
            name: 'Project 1',
            owner: 'validUserId',
            createdAt: new Date().toISOString(),
            participants: [],
            groups: [],
          },
        };
      }
      return {
        status: StatusCodes.NOT_FOUND,
        response: 'Project not found or unauthorized',
      };
    }),
    deleteProject: jest.fn().mockImplementation((userId, projectId) => {
      if (userId === 'validUserId' && projectId === VALID_PROJECT_ID) {
        return {
          status: StatusCodes.OK,
          response: 'Project deleted successfully',
        };
      }
      return {
        status: StatusCodes.NOT_FOUND,
        response: 'Project not found or unauthorized',
      };
    }),
    updateProject: jest.fn().mockImplementation((userId, data) => {
      if (userId === 'validUserId' && data.projectId === VALID_PROJECT_ID) {
        return {
          status: StatusCodes.OK,
          response: {
            id: VALID_PROJECT_ID,
            name: data.name || 'Project 1',
            owner: 'validUserId',
          },
        };
      }
      return {
        status: StatusCodes.NOT_FOUND,
        response: 'Project not found or unauthorized',
      };
    }),
    searchProject: jest.fn().mockImplementation((code) => {
      if (code === 'ABC12345') {
        return {
          status: StatusCodes.OK,
          response: {
            id: VALID_PROJECT_ID,
            name: 'Project 1',
            code: 'ABC12345',
          },
        };
      }
      return {
        status: StatusCodes.NOT_FOUND,
        response: 'Project not found',
      };
    }),
    savePreferences: jest.fn().mockImplementation((data) => {
      if (
        data.projectId === VALID_PROJECT_ID &&
        data.participantId === 'participant123'
      ) {
        return {
          status: StatusCodes.OK,
          response: 'Preferences saved successfully',
        };
      }
      return {
        status: StatusCodes.BAD_REQUEST,
        response: 'Invalid request',
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

describe('Projects Routes', () => {
  describe('POST /projects/create', () => {
    test('should create a new project for authenticated user', async () => {
      const response = await request(app).post('/projects/create');

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body.response).toHaveProperty('id', VALID_PROJECT_ID);
      expect(response.body.response).toHaveProperty('owner', 'validUserId');
    });

    test('should fail for unauthenticated user', async () => {
      const originalMock = jest.requireMock(
        '../../src/utils/services/projects.manager'
      ).default.createProject;
      jest.requireMock(
        '../../src/utils/services/projects.manager'
      ).default.createProject = jest.fn().mockReturnValue({
        status: StatusCodes.UNAUTHORIZED,
        response: 'Unauthorized',
      });

      const response = await request(app).post('/projects/create');

      jest.requireMock(
        '../../src/utils/services/projects.manager'
      ).default.createProject = originalMock;

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('GET /projects/get-all', () => {
    test('should return all projects for authenticated user', async () => {
      const response = await request(app).get('/projects/get-all');

      expect(response.status).toBe(StatusCodes.OK);
      expect(Array.isArray(response.body.response)).toBe(true);
      expect(response.body.response).toHaveLength(2);
      expect(response.body.response[0]).toHaveProperty('id', VALID_PROJECT_ID);
    });

    test('should fail for unauthenticated user', async () => {
      const originalMock = jest.requireMock(
        '../../src/utils/services/projects.manager'
      ).default.getAllProjects;
      jest.requireMock(
        '../../src/utils/services/projects.manager'
      ).default.getAllProjects = jest.fn().mockReturnValue({
        status: StatusCodes.UNAUTHORIZED,
        response: 'Unauthorized',
      });

      const response = await request(app).get('/projects/get-all');

      jest.requireMock(
        '../../src/utils/services/projects.manager'
      ).default.getAllProjects = originalMock;

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('GET /projects/get/:projectId', () => {
    test('should return project details for valid project', async () => {
      const response = await request(app).get(
        `/projects/get/${VALID_PROJECT_ID}`
      );

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toHaveProperty('id', VALID_PROJECT_ID);
      expect(response.body.response).toHaveProperty('owner', 'validUserId');
    });

    test('should fail for invalid project', async () => {
      const response = await request(app).get(
        `/projects/get/${INVALID_PROJECT_ID}`
      );

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('DELETE /projects/delete/:projectId', () => {
    test('should delete project successfully', async () => {
      const response = await request(app).delete(
        `/projects/delete/${VALID_PROJECT_ID}`
      );

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toBe('Project deleted successfully');
    });

    test('should fail for invalid project', async () => {
      const response = await request(app).delete(
        `/projects/delete/${INVALID_PROJECT_ID}`
      );

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('PUT /projects/update', () => {
    test('should update project successfully', async () => {
      const response = await request(app).put('/projects/update').send({
        projectId: VALID_PROJECT_ID,
        name: 'Updated Project Name',
      });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toHaveProperty('id', VALID_PROJECT_ID);
      expect(response.body.response).toHaveProperty(
        'name',
        'Updated Project Name'
      );
    });

    test('should fail for invalid project', async () => {
      const response = await request(app).put('/projects/update').send({
        projectId: INVALID_PROJECT_ID,
        name: 'Updated Project Name',
      });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('GET /projects/search/:code', () => {
    test('should find project by code', async () => {
      const response = await request(app).get('/projects/search/ABC12345');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toHaveProperty('id', VALID_PROJECT_ID);
      expect(response.body.response).toHaveProperty('code', 'ABC12345');
    });

    test('should fail for invalid code', async () => {
      const response = await request(app).get('/projects/search/XYZ98765');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('POST /projects/preferences/save', () => {
    test('should save preferences successfully', async () => {
      const response = await request(app)
        .post('/projects/preferences/save')
        .send({
          projectId: VALID_PROJECT_ID,
          participantId: 'participant123',
          preferences: ['pref1', 'pref2'],
          selectedParticipant: 'participant456',
        });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.response).toBe('Preferences saved successfully');
    });
  });
});
