import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AdminSessionService } from '../auth/admin-session.service';
import { InvitedController } from './invited.controller';
import { InvitedService } from './invited.service';

@Module({
  imports: [AuditModule],
  controllers: [InvitedController],
  providers: [InvitedService, AdminSessionService, AdminAuthGuard],
})
export class InvitedModule {}
