export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority?: TicketPriority; 
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TicketResponse {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: UserSummary;
  assignedTo?: UserSummary | null;
}

export interface PageResponse<T> {
  content: T[];
  number: number;        
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface TicketHistory {
  id: string;
  action: string;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus | null;
  notes: string;
  performedBy: UserSummary;
  createdAt: string;
}
