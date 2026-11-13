import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AdminSessionService } from '../auth/admin-session.service';
import { OverviewController } from './overview.controller';
import { OverviewService } from './overview.service';

@Module({
  imports: [AuditModule],
  controllers: [OverviewController],
  providers: [OverviewService, AdminSessionService, AdminAuthGuard],
})
export class OverviewModule {}
