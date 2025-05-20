import { StatusCodes } from 'http-status-codes';
import { DatabaseManager } from './database.manager';
import { Document, ObjectId, WithId } from 'mongodb';
import {
  projectPreferencesSaveData,
  projectUpdateData,
} from '../../routes/projects/types';
import { projectUpdateCriterionData } from '../../routes/projects/criteria/types';
import { projectAddParticipantData } from '../../routes/projects/participants/types';
import Student from '../algorithm/student.object';
import { geneticAlgorithmWithPreferences } from '../algorithm/geneticAlgorithm';

class ProjectsManager {
  private static instance: ProjectsManager;
  private userDatabaseManager = new DatabaseManager('Users');
  private projectsDatabaseManager = new DatabaseManager('Projects');
  private criteriaDatabaseManager = new DatabaseManager('Criteria');
  private participantsDatabaseManager = new DatabaseManager('Participants');
  private participantCriteriaDatabaseManager = new DatabaseManager(
    'Participants_Criteria'
  );
  private groupsDatabaseManager = new DatabaseManager('Groups');

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

      let code = makeCode();
      while (await this.projectsDatabaseManager.findOne({ code })) {
        code = makeCode();
      }
      const result = await this.projectsDatabaseManager.create({
        user: new ObjectId(userId),
        name: `New Project ${projects.length + 1}`,
        participants: 10,
        registrants: 0,
        group_size: 2,
        preferences: 0,
        code: code,
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
      const groups = await this.groupsDatabaseManager.findOne({
        _id: new ObjectId(projectId),
      });
      return {
        status: StatusCodes.OK,
        response: { ...project, groups: groups !== undefined },
      };
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
  ): Promise<{ status: number; response: string | WithId<Document> }> {
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

      const existing = await this.participantsDatabaseManager.find({
        tz: data.tz,
      });
      if (existing.length !== 0) {
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
        const createdParticipant =
          await this.participantsDatabaseManager.findOne({
            _id: result.insertedId,
          }); // 👈 שליפה מהדאטהבייס

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
        if (createdParticipant) {
          return {
            status: StatusCodes.OK,
            response: createdParticipant, // 👈 שולחים לפרונט את כל האובייקט
          };
        }
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
      participants.forEach((participant) => {
        if (participant.preferences && participant.preferences.length > 0) {
          participant.preferences = true;
        } else {
          participant.preferences = false;
        }
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

  public async deleteParticipant(
    userId: string,
    projectId: string,
    participantId: string
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
          response: 'The user does not own the project',
        };
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

      const result = await this.participantsDatabaseManager.delete({
        _id: participant._id,
      });

      if (result.acknowledged) {
        await this.participantCriteriaDatabaseManager.delete({
          participant: participant._id,
        });

        return {
          status: StatusCodes.OK,
          response: 'Participant deleted successfully',
        };
      }
    } catch (err) {
      console.error('Failed to delete participant:', err);
    }

    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to delete participant',
    };
  }

  public async updateParticipantCriteria(
    userId: string,
    participantId: string,
    criteria: Record<string, number>
  ): Promise<{ status: number; response: string }> {
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
          response: 'The user does not own the project',
        };
      }

      // נעדכן כל קריטריון שנשלח לפי participant + criterionId
      for (const [criterionId, value] of Object.entries(criteria)) {
        const participantObjectId = new ObjectId(participantId);
        const criterionObjectId = new ObjectId(criterionId);

        const filter = {
          participant: participantObjectId,
          criterion: criterionObjectId,
        };
        const update = { $set: { value } };

        const result = await this.participantCriteriaDatabaseManager.update(
          filter,
          update
        );
        if (!result.acknowledged) {
          return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            response: 'Failed to update participant criteria',
          };
        }
      }

      return {
        status: StatusCodes.OK,
        response: 'Criteria updated successfully',
      };
    } catch (error) {
      console.error('Failed to update participant criteria:', error);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        response: 'Failed to update participant criteria',
      };
    }
  }

  public async updateAllParticipants(
    userId: string,
    projectId: string,
    participants: {
      _id: string;
      firstName: string;
      lastName: string;
      tz: string;
    }[]
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
      if (!project || project.user.toString() !== user._id.toString()) {
        return {
          status: StatusCodes.FORBIDDEN,
          response: 'Unauthorized project access',
        };
      }

      for (const p of participants) {
        await this.participantsDatabaseManager.update(
          { _id: new ObjectId(p._id) },
          {
            $set: {
              firstName: p.firstName,
              lastName: p.lastName,
              tz: p.tz,
            },
          }
        );
      }

      return {
        status: StatusCodes.OK,
        response: 'Participants updated successfully',
      };
    } catch (err) {
      console.error('❌ Failed to update participants:', err);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        response: 'Failed to update participants',
      };
    }
  }

  public async searchProject(code: string): Promise<{
    status: number;
    response:
      | {
          participants: {
            _id: string;
            firstName: string;
            lastName: string;
          }[];
          maxPreferences: number;
        }
      | string;
  }> {
    try {
      const project = await this.projectsDatabaseManager.findOne({
        code: code,
      });
      if (!project) {
        return { status: StatusCodes.NOT_FOUND, response: 'Project not found' };
      }

      const participants = await this.participantsDatabaseManager.find({
        projectId: project._id,
      });

      const participantsArray = participants.map((participant) => ({
        _id: participant._id.toString(),
        firstName: participant.firstName,
        lastName: participant.lastName,
      }));

      return {
        status: StatusCodes.OK,
        response: {
          participants: participantsArray,
          maxPreferences: project.preferences,
        },
      };
    } catch (err) {
      console.error('Failed to search project:', err);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        response: 'Failed to search project',
      };
    }
  }

  public async savePreferences(
    data: projectPreferencesSaveData
  ): Promise<{ status: number; response: string }> {
    try {
      const participant = await this.participantsDatabaseManager.findOne({
        _id: new ObjectId(data.selectedParticipant),
        tz: data.participantId,
      });
      if (!participant) {
        return {
          status: StatusCodes.NOT_FOUND,
          response: 'Participant not found or not authorized',
        };
      }

      const project = await this.projectsDatabaseManager.findOne({
        _id: participant.projectId,
      });
      if (!project) {
        return {
          status: StatusCodes.FORBIDDEN,
          response: 'Unauthorized project access',
        };
      }

      const preferences = await this.participantsDatabaseManager.update(
        { _id: participant._id },
        { $set: { preferences: data.preferences.map((p) => new ObjectId(p)) } }
      );

      if (!preferences.acknowledged) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          response: 'Failed to save preferences',
        };
      }

      return {
        status: StatusCodes.OK,
        response: 'Preferences saved successfully',
      };
    } catch (err) {
      console.error('Failed to save preferences:', err);
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        response: 'Failed to save preferences',
      };
    }
  }

  public async runAlgorithm(projectId: string): Promise<{
    status: number;
    response: string | Student[][];
  }> {
    try {
      const project = await this.projectsDatabaseManager.findOne({
        _id: new ObjectId(projectId),
      });
      if (!project) {
        return { status: StatusCodes.NOT_FOUND, response: 'Project not found' };
      }
      const students = await this.loadStudentsForProject(projectId);
      const numGroups = Math.ceil(students.length / project.group_size);
      const result = geneticAlgorithmWithPreferences(students, numGroups);
      if (result.length === 0) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          response: 'Failed to run algorithm',
        };
      }
      const updateResult = await this.groupsDatabaseManager.update(
        { _id: new ObjectId(projectId) },
        { $set: { groups: result } },
        { upsert: true }
      );
      if (updateResult.acknowledged) {
        return { status: StatusCodes.OK, response: result };
      }
    } catch (err) {
      console.error('Failed to run algorithm:', err);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to run algorithm',
    };
  }

  public async loadStudentsForProject(projectId: string) {
    const docs = await this.participantsDatabaseManager.aggregate([
      {
        $match: { projectId: new ObjectId(projectId) },
      },
      {
        $lookup: {
          from: 'Participants_Criteria',
          localField: '_id',
          foreignField: 'participant',
          as: 'criteriaDocs',
        },
      },
      {
        $lookup: {
          from: 'Criteria',
          localField: 'criteriaDocs.criterion',
          foreignField: '_id',
          as: 'criterionDefs',
        },
      },
      {
        $addFields: {
          criteria: {
            $map: {
              input: '$criteriaDocs',
              as: 'cd',
              in: {
                type: {
                  $let: {
                    vars: {
                      def: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$criterionDefs',
                              as: 'd',
                              cond: { $eq: ['$$d._id', '$$cd.criterion'] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      $concat: ['0-', { $toString: '$$def.range' }],
                    },
                  },
                },
                value: '$$cd.value',
              },
            },
          },
        },
      },
      {
        $project: {
          criteriaDocs: 0,
          criterionDefs: 0,
          tz: 0,
          projectId: 0,
        },
      },
    ]);

    const students = docs.map((doc) => {
      return new Student({
        id: (doc._id as ObjectId).toString(),
        name: `${doc.firstName} ${doc.lastName}`,
        criteria: doc.criteria,
        preferences: doc.preferences?.map((p: ObjectId) => p.toString()) || [],
      });
    });

    return students;
  }
}

function makeCode() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const projectsManager = ProjectsManager.getInstance();
export default projectsManager;
