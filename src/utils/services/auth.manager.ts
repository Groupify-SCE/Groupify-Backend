import { StatusCodes } from 'http-status-codes';
import {
  ResetPasswordRequestSchema,
  ResetPasswordSchema,
  UserLoginSchema,
  UserRegisterSchema,
} from '../../routes/auth/types';
import { DatabaseManager } from './database.manager';
import bcrypt from 'bcrypt';
import jwtService from './jwt.service';
import { ObjectId } from 'mongodb';
import emailManager from './email.service';

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
        $or: [
          { email: loginData.identifier },
          { username: loginData.identifier },
        ],
      });
      if (!user) {
        return {
          status: StatusCodes.BAD_REQUEST,
          response: 'Invalid credentials',
        };
      }
      const isPasswordValid = await bcrypt.compare(
        loginData.password,
        user.password
      );
      if (!isPasswordValid) {
        return {
          status: StatusCodes.BAD_REQUEST,
          response: 'Invalid credentials',
        };
      }
      const token = jwtService.generateToken(
        {
          type: 'auth',
          userId: user._id.toString(),
        },
        '7d'
      );
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

  public async getUserStatus(
    user_id: string
  ): Promise<{ status: number; response: string }> {
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

  public async requestResetPassword(
    resetPasswordData: ResetPasswordRequestSchema
  ): Promise<{ status: number; response: string }> {
    try {
      const user = await this.userDatabaseManager.findOne({
        email: resetPasswordData.email,
      });
      if (!user) {
        return {
          status: StatusCodes.BAD_REQUEST,
          response: 'User not found with the given email',
        };
      }
      const emailResponse = await emailManager.generateResetPasswordEmail(
        user._id.toString(),
        user.email,
        user.firstName + ' ' + user.lastName
      );
      if (!emailResponse) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          response: 'Failed to send reset password email',
        };
      }
      return {
        status: StatusCodes.OK,
        response: 'Reset password email sent',
      };
    } catch (error) {
      console.error('Error in requestResetPassword: ' + error);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to request reset password',
    };
  }

  public async resetPassword(
    resetPasswordData: ResetPasswordSchema
  ): Promise<{ status: number; response: string }> {
    try {
      if (resetPasswordData.password !== resetPasswordData.passwordConfirmation) {
        return {
          status: StatusCodes.BAD_REQUEST,
          response: 'Passwords do not match',
        };
      }
      const payload = jwtService.verifyToken(resetPasswordData.token);
      if (!payload) {
        return {
          status: StatusCodes.BAD_REQUEST,
          response: 'Invalid token',
        };
      }
      if (!payload || payload.type !== 'reset_password' || typeof payload.user_id !== 'string') {
        return {
          status: StatusCodes.BAD_REQUEST,
          response: 'Invalid token',
        };
      }
      const user = await this.userDatabaseManager.findOne({
        _id: new ObjectId(payload.user_id),
      });
      if (!user) {
        return {
          status: StatusCodes.BAD_REQUEST,
          response: 'User not found',
        };
      }
      const hashedPassword = await bcrypt.hash(resetPasswordData.password, 10);
      const updateResult = await this.userDatabaseManager.update(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      if (!updateResult.acknowledged) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          response: 'Failed to reset password',
        };
      }
      return {
        status: StatusCodes.OK,
        response: 'Password reset successfully',
      };
    } catch (error) {
      console.error('Error in resetPassword: ' + error);
    }
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      response: 'Failed to reset password',
    };
  }
}

const authManager = AuthManager.getInstance();
export default authManager;
