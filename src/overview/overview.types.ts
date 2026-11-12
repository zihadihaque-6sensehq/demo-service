import type { Type } from '@nestjs/common';

export interface CustomerRecord {
  customerId: string;
  identityName?: string;
  contactPhone?: string;
  contactEmail?: string;
  state?: string;
  region?: string;
  activityStatus?: string;
  latestHaulCreated?: string;
  latestHaulStatus?: string;
}

export interface CustomersListResponse {
  customers: CustomerRecord[];
  totalCount?: number;
}

export interface ExportCustomersResponse {
  exportJobId: string;
  accepted: boolean;
}
