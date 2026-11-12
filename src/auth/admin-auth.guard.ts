import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminAuthenticatedRequest } from './admin-request';
import { AdminSessionService } from './admin-session.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly adminSessionService: AdminSessionService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<AdminAuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    const sessionToken = authHeader.slice('Bearer '.length).trim();
    if (!sessionToken) {
      throw new UnauthorizedException();
    }

    let session;
    try {
      session = this.adminSessionService.validateBearerSession(sessionToken);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException();
    }

    request.adminIdentity =
      this.adminSessionService.attachIdentityFromSession(session);

    if (process.env.ADMIN_CUSTOMERS_ACCESS === 'false') {
      throw new ForbiddenException();
    }

    return true;
  }
}
