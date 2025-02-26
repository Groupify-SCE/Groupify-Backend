import { StatusCodes } from 'http-status-codes';
import { UserRegisterSchema } from '../../routes/auth/types';

class AuthManager {
  private static instance: AuthManager;

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
      return { status: StatusCodes.CREATED, response: 'User registered successfully' };
    } catch (error) {
      console.error('Error in registerUser: ' + error);
    }
    return { status: StatusCodes.INTERNAL_SERVER_ERROR, response: 'Failed to register user' };
  }
}

const authManager = AuthManager.getInstance();
export default authManager;
