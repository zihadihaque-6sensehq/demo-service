import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import {
  AdminIdentity,
  AdminSession,
  AdminSessionRecord,
} from './admin-session.types';

@Injectable()
export class AdminSessionService implements OnModuleInit {
  private readonly sessions = new Map<string, AdminSession>();

  onModuleInit(): void {
    const raw = process.env.ADMIN_SESSIONS_JSON;
    if (raw) {
      this.loadSessionsFromConfig(raw);
      return;
    }
    this.bootstrapDefaultSession();
  }

  validateBearerSession(sessionToken: string): AdminSession {
    const session = this.sessions.get(sessionToken);
    if (!session) {
      throw new UnauthorizedException();
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException();
    }
    return session;
  }

  attachIdentityFromSession(session: AdminSession): AdminIdentity {
    return { ...session.identity };
  }

  private loadSessionsFromConfig(raw: string): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('ADMIN_SESSIONS_JSON must be valid JSON');
    }
    if (!Array.isArray(parsed)) {
      throw new Error('ADMIN_SESSIONS_JSON must be a JSON array');
    }
    for (const record of parsed as AdminSessionRecord[]) {
      this.registerSession({
        sessionToken: record.sessionToken,
        identity: {
          adminId: record.adminId,
          displayName: record.displayName,
        },
        expiresAt: new Date(record.expiresAt),
      });
    }
  }

  private bootstrapDefaultSession(): void {
    const sessionToken = process.env.ADMIN_API_TOKEN;
    if (!sessionToken) {
      return;
    }
    const ttlSeconds = Number(process.env.ADMIN_SESSION_TTL_SECONDS ?? '28800');
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    this.registerSession({
      sessionToken,
      identity: {
        adminId: process.env.ADMIN_IDENTITY_ID ?? 'admin',
        displayName: process.env.ADMIN_IDENTITY_NAME ?? 'Admin User',
      },
      expiresAt,
    });
  }

  private registerSession(session: AdminSession): void {
    this.sessions.set(session.sessionToken, session);
  }
}
