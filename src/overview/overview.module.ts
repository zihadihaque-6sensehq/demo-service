import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AdminSessionService } from '../auth/admin-session.service';
import { OverviewController } from './overview.controller';
import { OverviewService } from './overview.service';

@Module({
  controllers: [OverviewController],
  providers: [
    OverviewService,
    AuditService,
    AdminSessionService,
    AdminAuthGuard,
  ],
})
export class OverviewModule {}
