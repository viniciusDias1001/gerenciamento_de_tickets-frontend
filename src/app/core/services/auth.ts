import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../../environment';

export interface AuthResponse {
  accessToken: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'CLIENT' | 'TECH';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  register(payload: RegisterRequest) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, payload)
      .pipe(
        tap(res => {
          this.setToken(res.accessToken);
          this.setUser(res.name, res.email, res.role);
        })
      );
  }

  login(payload: LoginRequest) {
  return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
    tap({
      next: (res) => {
        if (res?.accessToken) {
          localStorage.setItem('access_token', res.accessToken);
          localStorage.setItem('user_name', res.name ?? '');
          localStorage.setItem('user_email', res.email ?? '');
          localStorage.setItem('user_role', res.role ?? '');
        }
      }
    })
  );
}

  // ===== Storage helpers (SSR safe) =====
  private setToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
  }

  private setUser(name: string, email: string, role: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_name', name);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_role', role);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  getUserName(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_name');
  }

  getUserEmail(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_email');
  }

   getUserRole(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_role');
  }

  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  getRole(): 'CLIENT' | 'TECH' | 'ADMIN' | null {
  const role = this.getUserRole();
  if (role === 'CLIENT' || role === 'TECH' || role === 'ADMIN') return role;
  return null;
}

isAdmin(): boolean {
  return this.getRole() === 'ADMIN';
}

isTech(): boolean {
  const r = this.getRole();
  return r === 'TECH' || r === 'ADMIN'; // admin também pode
}

isClient(): boolean {
  const r = this.getRole();
  return r === 'CLIENT' || r === 'ADMIN'; // se você quiser admin criando ticket
}
}
