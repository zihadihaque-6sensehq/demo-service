import type { Type } from '@nestjs/common';

export interface InviteListItem {
  id: string;
  email: string | null;
  invitedAt: string | null;
  state: string | null;
  region: string | null;
  status: string | null;
}

export interface InvitedListResponse {
  items: InviteListItem[];
  totalCount: number;
}

export interface SendInviteResponse {
  inviteId: string;
  email: string;
  status: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface CustomerFiltersResponse {
  states: FilterOption[];
  regions: FilterOption[];
}

export interface StoredInviteRecord extends InviteListItem {
  emailNormalized: string;
}
