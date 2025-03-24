import { StatusCodes } from 'http-status-codes';
import { DatabaseManager } from './database.manager';
import { Document, ObjectId, WithId } from 'mongodb';

class ProjectsManager {
  private static instance: ProjectsManager;
  private userDatabaseManager = new DatabaseManager('Users');
  private projectsDatabaseManager = new DatabaseManager('Projects');

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
}

const projectsManager = ProjectsManager.getInstance();
export default projectsManager;
