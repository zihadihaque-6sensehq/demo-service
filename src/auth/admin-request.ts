import { Request } from 'express';
import { AdminIdentity } from './admin-session.types';

export interface AdminAuthenticatedRequest extends Request {
  adminIdentity: AdminIdentity;
}
