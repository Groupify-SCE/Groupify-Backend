import { StatusCodes } from 'http-status-codes';
import { UserRegisterSchema } from '../../routes/auth/types';
import { DatabaseManager } from './database.manager';
import bcrypt from 'bcrypt';

class AuthManager {
  private static instance: AuthManager;
  private userDatabaseManager = new DatabaseManager('Users');

  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public async registerUser(
    userData: UserRegisterSchema
  ): Promise<{ status: number; response: string }> {
    try {
      if (userData.password !== userData.passwordConfirmation) {
        return {
          status: StatusCodes.BAD_REQUEST,
          response: 'Passwords do not match',
        };
      }
      const userExistsByEmail = await this.userDatabaseManager.findOne({
        email: userData.email,
      });
      if (userExistsByEmail) {
        return {
          status: StatusCodes.BAD_REQUEST,
          response: 'User already exists with the given email',
        };
      }
      const userExistsByUsername = await this.userDatabaseManager.findOne({
        username: userData.username,
      });
      if (userExistsByUsername) {
        return {
          status: StatusCodes.BAD_REQUEST,
          response: 'User already exists with the given username',
        };
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const createUserResult = await this.userDatabaseManager.create({
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
      });
      if (createUserResult.acknowledged) {
        return {
          status: StatusCodes.CREATED,
          response: 'User registered successfully',
        };
      }
    } catch (error) {
      console.error('Error in registerUser: ' + error);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to register user',
    };
  }
}

const authManager = AuthManager.getInstance();
export default authManager;
