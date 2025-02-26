import { StatusCodes } from 'http-status-codes';
import { UserLoginSchema, UserRegisterSchema } from '../../routes/auth/types';
import { DatabaseManager } from './database.manager';
import bcrypt from 'bcrypt';
import jwtService, { JWTService } from './jwt.service';
import { ObjectId } from 'mongodb';

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

  public async loginUser(
    loginData: UserLoginSchema
  ): Promise<{ status: number; response: string }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        $or: [{ email: loginData.identifier }, { username: loginData.identifier }],
      });
      if (!user) {
        return {
          status: StatusCodes.BAD_REQUEST,
          response: 'Invalid credentials',
        };
      }
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        return {
          status: StatusCodes.BAD_REQUEST,
          response: 'Invalid credentials',
        };
      }
      const token = jwtService.generateToken({
        type: 'auth',
        userId: user._id.toString(),
      }, '7d')
      if (!token) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          response: 'Failed to generate token',
        };
      }
      return {
        status: StatusCodes.OK,
        response: token,
      };
    } catch (error) {
      console.error('Error in loginUser: ' + error);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to login user',
    };
  }

  public async getUserStatus(user_id: string): Promise<{ status: number; response: string }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(user_id),
      });
      if (!user) {
        return {
          status: StatusCodes.UNAUTHORIZED,
          response: 'Invalid token',
        };
      }
      return {
        status: StatusCodes.OK,
        response: 'User is authenticated',
      };
    } catch (error) {
      console.error('Error in getUserStatus: ' + error);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to get user status',
    };
  }
}

const authManager = AuthManager.getInstance();
export default authManager;
