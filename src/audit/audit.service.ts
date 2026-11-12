import { Injectable } from '@nestjs/common';
import { AdminIdentity } from '../auth/admin-session.types';
import { CustomerExportAuditEntry } from './audit.types';

@Injectable()
export class AuditService {
  private readonly entries: CustomerExportAuditEntry[] = [];

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
}
