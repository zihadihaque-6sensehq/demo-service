import type { Type } from '@nestjs/common';
import { AdminIdentity } from '../auth/admin-session.types';

export interface CustomerExportAuditEntry {
  action: 'customers.export.started';
  adminIdentity: AdminIdentity;
  timestamp: string;
  exportJobId: string;
  filterContext: {
    state?: string;
    region?: string;
    activity?: string;
  };
}

export interface InviteSentAuditEntry {
  action: 'customers.invite.sent';
  adminIdentity: AdminIdentity;
  timestamp: string;
  inviteId: string;
  email: string;
}
