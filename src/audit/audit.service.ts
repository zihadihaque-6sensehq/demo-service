import { Injectable, Logger } from '@nestjs/common';
import { AdminIdentity } from '../auth/admin-session.types';
import {
  CustomerExportAuditEntry,
  InviteSentAuditEntry,
} from './audit.types';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly entries: CustomerExportAuditEntry[] = [];
  private readonly inviteEntries: InviteSentAuditEntry[] = [];

  recordCustomerExportStarted(params: {
    adminIdentity: AdminIdentity;
    exportJobId: string;
    filterContext: {
      state?: string;
      region?: string;
      activity?: string;
    };
  }): CustomerExportAuditEntry {
    const entry: CustomerExportAuditEntry = {
      action: 'customers.export.started',
      adminIdentity: { ...params.adminIdentity },
      timestamp: new Date().toISOString(),
      exportJobId: params.exportJobId,
      filterContext: { ...params.filterContext },
    };
    this.entries.push(entry);
    return entry;
  }

  getCustomerExportAuditEntries(): readonly CustomerExportAuditEntry[] {
    return this.entries;
  }

  recordInviteSent(params: {
    adminIdentity: AdminIdentity;
    inviteId: string;
    email: string;
  }): InviteSentAuditEntry {
    const entry: InviteSentAuditEntry = {
      action: 'customers.invite.sent',
      adminIdentity: { ...params.adminIdentity },
      timestamp: new Date().toISOString(),
      inviteId: params.inviteId,
      email: params.email,
    };
    this.inviteEntries.push(entry);
    this.logger.log(
      `customers.invite.sent adminId=${params.adminIdentity.adminId} timestamp=${entry.timestamp} inviteId=${params.inviteId} email=${params.email}`,
    );
    return entry;
  }
}
