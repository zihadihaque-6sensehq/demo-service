import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { AdminIdentity } from '../auth/admin-session.types';
import { GetCustomerFiltersQueryDto } from './dto/get-customer-filters-query.dto';
import { GetInvitedQueryDto } from './dto/get-invited-query.dto';
import { SendInviteDto } from './dto/send-invite.dto';
import {
  CustomerFiltersResponse,
  FilterOption,
  InvitedListResponse,
  InviteListItem,
  SendInviteResponse,
  StoredInviteRecord,
} from './invited.types';

const SEED_INVITES: InviteListItem[] = [
  {
    id: 'inv-001',
    email: 'casey.nguyen@example.com',
    invitedAt: '2025-11-12T16:20:00.000Z',
    state: 'California',
    region: 'Bay Area',
    status: 'pending',
  },
  {
    id: 'inv-002',
    email: 'drew.kim@example.com',
    invitedAt: '2025-11-11T11:05:00.000Z',
    state: 'Texas',
    region: 'Austin',
    status: 'pending',
  },
  {
    id: 'inv-003',
    email: null,
    invitedAt: '2025-11-09T08:30:00.000Z',
    state: 'New York',
    region: 'NYC',
    status: 'expired',
  },
  {
    id: 'inv-004',
    email: 'taylor.brooks@example.com',
    invitedAt: '2025-11-08T19:45:00.000Z',
    state: 'California',
    region: 'Los Angeles',
    status: 'pending',
  },
];

const DEFAULT_REGISTERED_EMAILS = [
  'avery.chen@example.com',
  'jordan.lee@example.com',
  'sam.rivera@example.com',
  'morgan.patel@example.com',
];

@Injectable()
export class InvitedService {
  private readonly invites: StoredInviteRecord[] = this.loadInvites();
  private readonly registeredEmails: Set<string> = this.loadRegisteredEmails();

  constructor(private readonly auditService: AuditService) {}

  listInvited(query: GetInvitedQueryDto): InvitedListResponse {
    this.assertOperational();

    let results = this.invites.map((record) => this.toListItem(record));

    if (query.state && query.state !== 'All') {
      results = results.filter(
        (row) => row.state?.toLowerCase() === query.state!.toLowerCase(),
      );
    }
    if (query.region && query.region !== 'All') {
      results = results.filter(
        (row) => row.region?.toLowerCase() === query.region!.toLowerCase(),
      );
    }

    const sortField = query.sort ?? 'invitedAt';
    if (sortField === 'invitedAt') {
      results.sort((a, b) => {
        const aTime = a.invitedAt ? Date.parse(a.invitedAt) : 0;
        const bTime = b.invitedAt ? Date.parse(b.invitedAt) : 0;
        return bTime - aTime;
      });
    } else if (sortField === 'email') {
      results.sort((a, b) =>
        (a.email ?? '').localeCompare(b.email ?? '', undefined, {
          sensitivity: 'base',
        }),
      );
    }

    const totalCount = results.length;

    if (query.page !== undefined || query.pageSize !== undefined) {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 25;
      const start = (page - 1) * pageSize;
      results = results.slice(start, start + pageSize);
    }

    return { items: results, totalCount };
  }

  sendInvite(
    dto: SendInviteDto,
    adminIdentity: AdminIdentity,
  ): SendInviteResponse {
    this.assertOperational();

    const email = dto.email.trim();
    const normalized = email.toLowerCase();

    if (this.registeredEmails.has(normalized)) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_REGISTERED',
        message:
          'This email is already associated with an existing customer account.',
      });
    }

    const existingInvite = this.invites.find(
      (invite) => invite.emailNormalized === normalized,
    );
    if (existingInvite) {
      throw new ConflictException({
        code: 'INVITE_ALREADY_SENT',
        message: 'An invite has already been sent to this email address.',
      });
    }

    const inviteId = randomUUID();
    const invitedAt = new Date().toISOString();
    const record: StoredInviteRecord = {
      id: inviteId,
      email,
      invitedAt,
      state: null,
      region: null,
      status: 'pending',
      emailNormalized: normalized,
    };
    this.invites.unshift(record);

    this.auditService.recordInviteSent({
      adminIdentity,
      inviteId,
      email,
    });

    return {
      inviteId,
      email,
      status: 'pending',
    };
  }

  getFilters(query: GetCustomerFiltersQueryDto): CustomerFiltersResponse {
    this.assertOperational();

    const stateValues = new Map<string, string>();
    const regionValues = new Map<string, string>();

    for (const invite of this.invites) {
      if (invite.state) {
        stateValues.set(invite.state, invite.state);
      }
      if (invite.region) {
        const matchesState =
          !query.state ||
          query.state === 'All' ||
          invite.state?.toLowerCase() === query.state.toLowerCase();
        if (matchesState) {
          regionValues.set(invite.region, invite.region);
        }
      }
    }

    return {
      states: this.toSortedOptions(stateValues),
      regions: this.toSortedOptions(regionValues),
    };
  }

  private toListItem(record: StoredInviteRecord): InviteListItem {
    return {
      id: record.id,
      email: record.email,
      invitedAt: record.invitedAt,
      state: record.state,
      region: record.region,
      status: record.status,
    };
  }

  private toSortedOptions(values: Map<string, string>): FilterOption[] {
    return [...values.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }));
  }

  private loadInvites(): StoredInviteRecord[] {
    const raw = process.env.INVITED_RECORDS_JSON;
    const source = raw ? this.parseInviteSeed(raw) : [...SEED_INVITES];
    return source.map((item) => ({
      ...item,
      emailNormalized: (item.email ?? '').toLowerCase(),
    }));
  }

  private parseInviteSeed(raw: string): InviteListItem[] {
    try {
      const parsed = JSON.parse(raw) as InviteListItem[];
      if (!Array.isArray(parsed)) {
        throw new Error('INVITED_RECORDS_JSON must be a JSON array');
      }
      return parsed;
    } catch {
      throw new InternalServerErrorException(
        'Invalid INVITED_RECORDS_JSON configuration',
      );
    }
  }

  private loadRegisteredEmails(): Set<string> {
    const raw = process.env.INVITE_REGISTERED_EMAILS_JSON;
    if (!raw) {
      return new Set(
        DEFAULT_REGISTERED_EMAILS.map((email) => email.toLowerCase()),
      );
    }
    try {
      const parsed = JSON.parse(raw) as string[];
      if (!Array.isArray(parsed)) {
        throw new Error('INVITE_REGISTERED_EMAILS_JSON must be a JSON array');
      }
      return new Set(parsed.map((email) => email.toLowerCase()));
    } catch {
      throw new InternalServerErrorException(
        'Invalid INVITE_REGISTERED_EMAILS_JSON configuration',
      );
    }
  }

  private assertOperational(): void {
    if (process.env.INVITED_SIMULATE_SERVER_ERROR === 'true') {
      throw new InternalServerErrorException('Invited service unavailable');
    }
  }
}
