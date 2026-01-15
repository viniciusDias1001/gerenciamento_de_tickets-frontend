import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  Component,
  inject,
  ChangeDetectorRef,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

import { UserService, PageResponse } from '../../../../core/services/user.service';
import { UserRole, UserSummaryResponse } from '../../../../core/models/user.models';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList implements OnInit, OnDestroy {
  private zone = inject(NgZone);
  private fb = inject(FormBuilder);
  private usersService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  isAdmin = false;
  private loadSub?: Subscription;

  loading = false;
  errorMsg = '';
  successMsg = '';

  page: PageResponse<UserSummaryResponse> | null = null;

  form = this.fb.group({
    role: ['' as '' | UserRole],
    size: [10],
  });

  ngOnInit() {
    const role = this.auth.getRole();
    this.isAdmin = role === 'ADMIN';

    this.load(0);
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
  }

  load(pageNumber: number) {
    console.log('[Users load] START', { pageNumber, raw: this.form.getRawValue() });

    this.loadSub?.unsubscribe();

    // UI state
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.page = null; // importante pra evitar “render fantasma”
    this.cdr.markForCheck();

    const { role, size } = this.form.getRawValue();

    this.loadSub = this.usersService
      .list({
        page: pageNumber,
        size: size ?? 10,
        role: role || '',
        sort: 'name,asc',
      })
      .pipe(
        take(1),
        finalize(() => {
          this.zone.run(() => {
            this.loading = false;
            this.cdr.markForCheck();
          });
        })
      )
      .subscribe({
        next: (res) => {
          console.log('[Users load] NEXT', {
            total: res.totalElements,
            content: res.content?.length ?? 0,
          });

          this.zone.run(() => {
            this.page = res;
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          console.log('[Users load] ERROR', err);
          this.zone.run(() => {
            this.errorMsg =
              err?.error?.message || 'Falha ao carregar usuários.';
            this.cdr.markForCheck();
          });
        },
      });
  }

  applyFilters() {
    console.log('[Users applyFilters] clicked', this.form.getRawValue());
    this.load(0);
  }

  clearFilters() {
    this.form.patchValue({ role: '', size: 10 });
    this.load(0);
  }

  prev() {
    if (!this.page || this.page.first) return;
    this.load(this.page.number - 1);
  }

  next() {
    if (!this.page || this.page.last) return;
    this.load(this.page.number + 1);
  }

  roleLabel(role: UserRole) {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'TECH':
        return 'Técnico';
      default:
        return 'Cliente';
    }
  }

  // ✅ Regra: só ADMIN logado pode deletar
  canDelete(u: UserSummaryResponse) {
    if (!this.isAdmin) return false;      // só admin vê/usa
    return u.role !== 'ADMIN';            // e não apaga outro admin
  }

  confirmDelete(u: UserSummaryResponse) {
    if (!this.canDelete(u)) return;

    const ok = confirm(
      `Tem certeza que deseja excluir o usuário:\n\n"${u.name}" (${u.email})?\n\nEssa ação não pode ser desfeita.`
    );

    if (!ok) return;

    this.deleteUser(u.id);
  }

  deleteUser(id: string) {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.cdr.markForCheck();

    this.usersService.delete(id).pipe(take(1)).subscribe({
      next: () => {
        this.zone.run(() => {
          this.successMsg = 'Usuário removido com sucesso.';
          this.cdr.markForCheck();
          this.load(this.page?.number ?? 0);
        });
      },
      error: (err) => {
        console.error('[deleteUser]', err);
        this.zone.run(() => {
          this.errorMsg = err?.error?.message || 'Erro ao remover usuário.';
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      complete: () => {
        this.zone.run(() => {
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
    });
  }
}
