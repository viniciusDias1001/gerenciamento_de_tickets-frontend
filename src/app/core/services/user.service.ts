import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment';
import { Observable } from 'rxjs';
import { UserRole, UserSummaryResponse } from '../models/user.models';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // page index (0-based)
  size: number;
  first: boolean;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  list(params: {
    role?: UserRole | '';
    page?: number;
    size?: number;
    sort?: string; // ex: 'name,asc'
  }): Observable<PageResponse<UserSummaryResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 10));

    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.role) httpParams = httpParams.set('role', params.role);

    return this.http.get<PageResponse<UserSummaryResponse>>(this.baseUrl, {
      params: httpParams,
    });
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
