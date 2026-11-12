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
