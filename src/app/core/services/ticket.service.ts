import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { PageResponse, TicketResponse, TicketPriority, TicketStatus, TicketHistory  } from '../models/ticket.models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private baseUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  list(params: {
    page?: number;
    size?: number;
    status?: TicketStatus | '';
    priority?: TicketPriority | '';
  }) {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 10));

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.priority) httpParams = httpParams.set('priority', params.priority);

    return this.http.get<PageResponse<TicketResponse>>(this.baseUrl, { params: httpParams });
  }

  create(payload: { title: string; description: string; priority: TicketPriority }) {
    return this.http.post<TicketResponse>(this.baseUrl, payload);
  }

  getById(id: string) {
  return this.http.get<TicketResponse>(`${this.baseUrl}/${id}`);
}

changeStatus(ticketId: string, payload: { status: TicketStatus }) {
  return this.http.patch<void>(`${this.baseUrl}/${ticketId}/status`, payload);
}

assign(id: string, techId: string) {
  return this.http.patch<TicketResponse>(`${this.baseUrl}/${id}/assign/${techId}`, {});
}

gethistory(id: string, page = 0, size = 10) {
  return this.http.get<PageResponse<TicketHistory>>(
    `${this.baseUrl}/${id}/history?page=${page}&size=${size}`
  );
}

delete(id: string) {
  console.log('[TicketService.delete]', id);
  return this.http.delete<void>(`${this.baseUrl}/${id}`);
}
}