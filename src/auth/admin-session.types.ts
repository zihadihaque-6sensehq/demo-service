export interface AdminIdentity {
  adminId: string;
  displayName: string;
}

export interface AdminSession {
  sessionToken: string;
  identity: AdminIdentity;
  expiresAt: Date;
}

export interface AdminSessionRecord {
  sessionToken: string;
  adminId: string;
  displayName: string;
  expiresAt: string;
}
