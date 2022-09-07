import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';
import { promisify } from 'node:util';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private AUTH_AUDIENCE: string;
  private AUTH_DOMAIN: string;

  constructor(private configService: ConfigService) {
    this.AUTH_AUDIENCE = this.configService.get('AUTH_AUDIENCE') ?? '';
    this.AUTH_DOMAIN = this.configService.get('AUTH_DOMAIN') ?? '';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const checkJWT = promisify(
      jwt({
        secret: expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `${this.AUTH_DOMAIN}.com/.well-known/jwks.json`,
        }),
        audience: this.AUTH_AUDIENCE,
        issuer: this.AUTH_DOMAIN,
        algorithms: ['RS256'],
      }),
    );

    try {
      await checkJWT(request, response);

      return true;
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }
}
