export type UserRole = 'CLIENT' | 'TECH' | 'ADMIN';

export interface UserSummaryResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}