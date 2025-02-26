import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';

export class JWTService {
  private static secret: string =
    process.env.JWT_SECRET ??
    (() => {
      throw new Error('No valid JWT_SECRET in .env');
    })();

  private static instance: JWTService;

  private constructor() {}

  public static getInstance(): JWTService {
    if (!JWTService.instance) {
      JWTService.instance = new JWTService();
    }
    return JWTService.instance;
  }

  public generateToken(
    payload: JwtPayload,
    expiration?: string,
    algorithm: string = 'HS256'
  ): string | null {
    try {
      return jwt.sign(payload, JWTService.secret, {
        algorithm,
        ...(expiration ? { expiresIn: expiration } : {}),
      } as jwt.SignOptions);
    } catch (error) {
      this.handleVerificationError(error);
    }
    return null;
  }

  public verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, JWTService.secret) as JwtPayload;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        return null;
      } else {
        this.handleVerificationError(error);
      }
    }
    return null;
  }

  public handleVerificationError(error: Error | unknown): void {
    console.error(`[${this.constructor.name}] JWT verification failed:`, error);
  }
}

const jwtService = JWTService.getInstance();
export default jwtService;
