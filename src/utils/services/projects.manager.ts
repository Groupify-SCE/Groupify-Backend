import { StatusCodes } from 'http-status-codes';
import { DatabaseManager } from './database.manager';
import { Document, ObjectId, WithId } from 'mongodb';
import { projectUpdateData } from '../../routes/projects/types';
import { projectUpdateCriterionData } from '../../routes/projects/criteria/types';
import { projectAddParticipantData } from '../../routes/projects/participants/types';

class ProjectsManager {
  private static instance: ProjectsManager;
  private userDatabaseManager = new DatabaseManager('Users');
  private projectsDatabaseManager = new DatabaseManager('Projects');
  private criteriaDatabaseManager = new DatabaseManager('Criteria');
  private participantsDatabaseManager = new DatabaseManager('Participants');
  private participantCriteriaDatabaseManager = new DatabaseManager(
    'Participants_Criteria'
  );

  private constructor() {}

  public static getInstance(): ProjectsManager {
    if (!ProjectsManager.instance) {
      ProjectsManager.instance = new ProjectsManager();
    }
    return ProjectsManager.instance;
  }

  public async createProject(
    userId: string
  ): Promise<{ status: number; response: string }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(userId),
      });
      if (!user) {
        return { status: StatusCodes.NOT_FOUND, response: 'User not found' };
      }
      const projects = await this.projectsDatabaseManager.find({
        user: new ObjectId(userId),
      });
      const result = await this.projectsDatabaseManager.create({
        user: new ObjectId(userId),
        name: `New Project ${projects.length + 1}`,
        participants: 10,
        registrants: 0,
        group_size: 2,
        preferences: 0,
      });
      if (result.acknowledged) {
        return { status: StatusCodes.OK, response: 'Created project' };
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to created project',
    };
  }

  public async getAllProjects(
    userId: string
  ): Promise<{ status: number; response: string | WithId<Document>[] }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(userId),
      });
      if (!user) {
        return { status: StatusCodes.NOT_FOUND, response: 'User not found' };
      }
      const projects = await this.projectsDatabaseManager.find({
        user: new ObjectId(userId),
      });
      return { status: StatusCodes.OK, response: projects };
    } catch (err) {
      console.error('Failed to get all projects:', err);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to get all projects',
    };
  }

  public async deleteProject(
    userId: string,
    projectId: string
  ): Promise<{ status: number; response: string }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(userId),
      });
      if (!user) {
        return { status: StatusCodes.NOT_FOUND, response: 'User not found' };
      }
      const project = await this.projectsDatabaseManager.findOne({
        _id: new ObjectId(projectId),
      });
      if (!project) {
        return { status: StatusCodes.NOT_FOUND, response: 'Project not found' };
      }
      if (project.user.toString() !== user._id.toString()) {
        return {
          status: StatusCodes.FORBIDDEN,
          response: 'The user dosnt own the project',
        };
      }
      const result = await this.projectsDatabaseManager.delete({
        _id: project._id,
      });
      if (result.acknowledged) {
        await this.criteriaDatabaseManager.delete({
          project: project._id,
        });
        await this.participantsDatabaseManager.delete({
          projectId: project._id,
        });
        await this.participantCriteriaDatabaseManager.delete({
          participant: project._id,
        });
        return { status: StatusCodes.OK, response: 'Project deleted' };
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to delete project',
    };
  }

  public async getProject(
    userId: string,
    projectId: string
  ): Promise<{ status: number; response: string | WithId<Document> }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(userId),
      });
      if (!user) {
        return { status: StatusCodes.NOT_FOUND, response: 'User not found' };
      }
      const project = await this.projectsDatabaseManager.findOne({
        _id: new ObjectId(projectId),
      });
      if (!project) {
        return { status: StatusCodes.NOT_FOUND, response: 'Project not found' };
      }
      if (project.user.toString() !== user._id.toString()) {
        return {
          status: StatusCodes.FORBIDDEN,
          response: 'The user dosnt own the project',
        };
      }
      return { status: StatusCodes.OK, response: project };
    } catch (err) {
      console.error('Failed to get project:', err);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to get project',
    };
  }

  public async updateProject(
    userId: string,
    data: projectUpdateData
  ): Promise<{ status: number; response: string }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(userId),
      });
      if (!user) {
        return { status: StatusCodes.NOT_FOUND, response: 'User not found' };
      }
      const project = await this.projectsDatabaseManager.findOne({
        _id: new ObjectId(data.projectId),
      });
      if (!project) {
        return { status: StatusCodes.NOT_FOUND, response: 'Project not found' };
      }
      if (project.user.toString() !== user._id.toString()) {
        return {
          status: StatusCodes.FORBIDDEN,
          response: 'The user dosnt own the project',
        };
      }
      const result = await this.projectsDatabaseManager.update(
        {
          _id: project._id,
        },
        {
          $set: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.participants !== undefined && {
              participants: data.participants,
            }),
            ...(data.group_size !== undefined && {
              group_size: data.group_size,
            }),
          },
        }
      );
      if (result.acknowledged) {
        return { status: StatusCodes.OK, response: 'Project updated' };
      }
    } catch (err) {
      console.error('Failed to update project:', err);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to update project',
    };
  }

  public async addCriterion(
    userId: string,
    projectId: string
  ): Promise<{ status: number; response: string }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(userId),
      });
      if (!user) {
        return { status: StatusCodes.NOT_FOUND, response: 'User not found' };
      }
      const project = await this.projectsDatabaseManager.findOne({
        _id: new ObjectId(projectId),
      });
      if (!project) {
        return { status: StatusCodes.NOT_FOUND, response: 'Project not found' };
      }
      if (project.user.toString() !== user._id.toString()) {
        return {
          status: StatusCodes.FORBIDDEN,
          response: 'The user dosnt own the project',
        };
      }
      const criteria = await this.criteriaDatabaseManager.find({
        project: new ObjectId(projectId),
      });
      const result = await this.criteriaDatabaseManager.create({
        project: new ObjectId(projectId),
        name: `Criterion ${criteria.length + 1}`,
        range: 100,
      });
      if (result.acknowledged) {
        const participants = await this.participantsDatabaseManager.find({
          projectId: project._id,
        });
        for (const participant of participants) {
          await this.participantCriteriaDatabaseManager.create({
            participant: participant._id,
            criterion: result.insertedId,
            value: 0,
          });
        }
        return {
          status: StatusCodes.OK,
          response: 'Criterion added',
        };
      }
    } catch (err) {
      console.error('Failed to add criterion:', err);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to add criterion',
    };
  }

  public async getAllCriteria(
    userId: string,
    projectId: string
  ): Promise<{ status: number; response: string | WithId<Document>[] }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(userId),
      });
      if (!user) {
        return { status: StatusCodes.NOT_FOUND, response: 'User not found' };
      }
      const project = await this.projectsDatabaseManager.findOne({
        _id: new ObjectId(projectId),
      });
      if (!project) {
        return { status: StatusCodes.NOT_FOUND, response: 'Project not found' };
      }
      if (project.user.toString() !== user._id.toString()) {
        return {
          status: StatusCodes.FORBIDDEN,
          response: 'The user dosnt own the project',
        };
      }
      const criteria = await this.criteriaDatabaseManager.find({
        project: new ObjectId(projectId),
      });
      return { status: StatusCodes.OK, response: criteria };
    } catch (err) {
      console.error('Failed to get all criteria:', err);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to get all criteria',
    };
  }

  public async updateCriterion(
    userId: string,
    data: projectUpdateCriterionData
  ): Promise<{ status: number; response: string }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(userId),
      });
      if (!user) {
        return { status: StatusCodes.NOT_FOUND, response: 'User not found' };
      }
      const criterion = await this.criteriaDatabaseManager.findOne({
        _id: new ObjectId(data.criterionId),
      });
      if (!criterion) {
        return {
          status: StatusCodes.NOT_FOUND,
          response: 'Criterion not found',
        };
      }
      const project = await this.projectsDatabaseManager.findOne({
        _id: criterion.project,
      });
      if (!project) {
        return { status: StatusCodes.NOT_FOUND, response: 'Project not found' };
      }
      if (project.user.toString() !== user._id.toString()) {
        return {
          status: StatusCodes.FORBIDDEN,
          response: 'The user dosnt own the project',
        };
      }
      const result = await this.criteriaDatabaseManager.update(
        {
          _id: criterion._id,
        },
        {
          $set: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.range !== undefined && { range: data.range }),
          },
        }
      );
      if (result.acknowledged) {
        if (data.range !== undefined) {
          const participantsCriteria =
            await this.participantCriteriaDatabaseManager.find({
              criterion: criterion._id,
            });
          for (const participantCriterion of participantsCriteria) {
            if (participantCriterion.value > data.range) {
              await this.participantCriteriaDatabaseManager.update(
                { _id: participantCriterion._id },
                { $set: { value: data.range } }
              );
            }
          }
        }
        return { status: StatusCodes.OK, response: 'Criterion updated' };
      }
    } catch (err) {
      console.error('Failed to update criterion:', err);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to update criterion',
    };
  }

  public async deleteCriterion(
    userId: string,
    criterionId: string
  ): Promise<{ status: number; response: string }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(userId),
      });
      if (!user) {
        return { status: StatusCodes.NOT_FOUND, response: 'User not found' };
      }
      const criterion = await this.criteriaDatabaseManager.findOne({
        _id: new ObjectId(criterionId),
      });
      if (!criterion) {
        return {
          status: StatusCodes.NOT_FOUND,
          response: 'Criterion not found',
        };
      }
      const project = await this.projectsDatabaseManager.findOne({
        _id: criterion.project,
      });
      if (!project) {
        return { status: StatusCodes.NOT_FOUND, response: 'Project not found' };
      }
      if (project.user.toString() !== user._id.toString()) {
        return {
          status: StatusCodes.FORBIDDEN,
          response: 'The user dosnt own the project',
        };
      }
      const result = await this.criteriaDatabaseManager.delete({
        _id: criterion._id,
      });
      if (result.acknowledged) {
        await this.participantCriteriaDatabaseManager.delete({
          criterion: criterion._id,
        });
        return { status: StatusCodes.OK, response: 'Criterion deleted' };
      }
    } catch (err) {
      console.error('Failed to delete criterion:', err);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to delete criterion',
    };
  }

  public async addParticipant(
    userId: string,
    data: projectAddParticipantData
  ): Promise<{ status: number; response: string }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(userId),
      });
      if (!user) {
        return { status: StatusCodes.NOT_FOUND, response: 'User not found' };
      }
      const project = await this.projectsDatabaseManager.findOne({
        _id: new ObjectId(data.projectId),
      });
      if (!project) {
        return { status: StatusCodes.NOT_FOUND, response: 'Project not found' };
      }
      if (project.user.toString() !== user._id.toString()) {
        return {
          status: StatusCodes.FORBIDDEN,
          response: 'The user dosnt own the project',
        };
      }
      const participant = await this.participantsDatabaseManager.find({
        tz: data.tz,
      });
      if (participant.length !== 0) {
        return {
          status: StatusCodes.CONFLICT,
          response: 'Participant already exists',
        };
      }
      const result = await this.participantsDatabaseManager.create({
        projectId: new ObjectId(data.projectId),
        firstName: data.firstName,
        lastName: data.lastName,
        tz: data.tz,
      });
      if (result.acknowledged) {
        const criteria = await this.criteriaDatabaseManager.find({
          project: project._id,
        });
        for (const criterion of criteria) {
          await this.participantCriteriaDatabaseManager.create({
            participant: result.insertedId,
            criterion: criterion._id,
            value: 0,
          });
        }
        return {
          status: StatusCodes.OK,
          response: 'Participant added',
        };
      }
    } catch (err) {
      console.error('Failed to add participant:', err);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to add participant',
    };
  }

  public async getAllParticipants(
    userId: string,
    projectId: string
  ): Promise<{ status: number; response: string | WithId<Document>[] }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(userId),
      });
      if (!user) {
        return { status: StatusCodes.NOT_FOUND, response: 'User not found' };
      }
      const project = await this.projectsDatabaseManager.findOne({
        _id: new ObjectId(projectId),
      });
      if (!project) {
        return { status: StatusCodes.NOT_FOUND, response: 'Project not found' };
      }
      if (project.user.toString() !== user._id.toString()) {
        return {
          status: StatusCodes.FORBIDDEN,
          response: 'The user dosnt own the project',
        };
      }
      const participants = await this.participantsDatabaseManager.find({
        projectId: project._id,
      });
      return {
        status: StatusCodes.OK,
        response: participants,
      };
    } catch (err) {
      console.error('Failed to add participant:', err);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to add participant',
    };
  }

  public async getParticipantCriteria(
    userId: string,
    participantId: string
  ): Promise<{ status: number; response: string | WithId<Document>[] }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(userId),
      });
      if (!user) {
        return { status: StatusCodes.NOT_FOUND, response: 'User not found' };
      }
      const participant = await this.participantsDatabaseManager.findOne({
        _id: new ObjectId(participantId),
      });
      if (!participant) {
        return {
          status: StatusCodes.NOT_FOUND,
          response: 'Participant not found',
        };
      }
      const project = await this.projectsDatabaseManager.findOne({
        _id: participant.projectId,
      });
      if (!project) {
        return { status: StatusCodes.NOT_FOUND, response: 'Project not found' };
      }
      if (project.user.toString() !== user._id.toString()) {
        return {
          status: StatusCodes.FORBIDDEN,
          response: 'The user dosnt own the project',
        };
      }
      const criteria = await this.participantCriteriaDatabaseManager.find({
        participant: participant._id,
      });
      return {
        status: StatusCodes.OK,
        response: criteria,
      };
    } catch (err) {
      console.error('Failed to get participant criteria:', err);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to get participant criteria',
    };
  }
}

const projectsManager = ProjectsManager.getInstance();
export default projectsManager;
