import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, inject, ChangeDetectorRef, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { TicketService } from '../../../../core/services/ticket.service';
import { Subscription } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import {
  PageResponse,
  TicketPriority,
  TicketResponse,
  TicketStatus,
} from '../../../../core/models/ticket.models';
import { AuthService } from '../../../../core/services/auth';

import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf, NgFor,RouterLink,RouterModule ],
  templateUrl: './tickets-list.html',
  styleUrl: './tickets-list.scss',
})
export class TicketsList implements OnInit, OnDestroy {
  private zone = inject(NgZone);
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);


  isAdmin = false;
  isTech = false;

  private loadSub?: Subscription;

  loading = false;
  errorMsg = '';
  page: PageResponse<TicketResponse> | null = null;

  form = this.fb.group({
    q: [''],
    status: ['' as '' | TicketStatus],
    priority: ['' as '' | TicketPriority],
    size: [10],
  });

  ngOnInit() {
  const role = this.auth.getRole();
  this.isAdmin = role === 'ADMIN';
  this.isTech = role === 'TECH';
    this.load(0);
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
  }

  load(pageNumber: number) {
    console.log('[load] START', { pageNumber, raw: this.form.getRawValue() });

    this.loadSub?.unsubscribe();

    this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    const { status, priority, size } = this.form.getRawValue();

    this.loadSub = this.ticketService
      .list({
        page: pageNumber,
        size: size ?? 10,
        status: status || '',
        priority: priority || '',
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
          console.log('[load] NEXT', { total: res.totalElements, content: res.content.length });

          const q = (this.form.value.q ?? '').trim().toLowerCase();

          const filteredContent = q
            ? res.content.filter((t) =>
                (t.title ?? '').toLowerCase().includes(q) ||
                String(t.id ?? '').toLowerCase().includes(q)
              )
            : res.content;

          this.zone.run(() => {
            this.page = { ...res, content: filteredContent };
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          console.log('[load] ERROR', err);
          this.zone.run(() => {
            this.errorMsg = err?.error?.message || 'Falha ao carregar tickets.';
            this.cdr.markForCheck();
          });
        },
      });
  }

  applyFilters() {
    console.log('[applyFilters] clicou', this.form.getRawValue());
    this.load(0);
  }

  clearFilters() {
    this.form.patchValue({ q: '', status: '', priority: '', size: 10 });
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

  statusLabel(status: TicketStatus) {
    switch (status) {
      case 'OPEN':
        return 'Aberto';
      case 'IN_PROGRESS':
        return 'Em andamento';
      case 'DONE':
        return 'Concluído';
      default:
        return status;
    }
  }
  confirmDelete(ticket: TicketResponse) {
  const ok = confirm(
    `Tem certeza que deseja excluir o ticket:\n\n"${ticket.title}"?\n\nEssa ação não pode ser desfeita.`
  );

  if (!ok) return;

  this.deleteTicket(ticket.id);
}


deleteTicket(id: string) {
  this.loading = true;

  this.ticketService.delete(id).subscribe({
    next: () => {
      alert('Ticket removido com sucesso.');
      this.load(this.page?.number ?? 0);
    },
    error: (err) => {
      console.error('[deleteTicket]', err);
      alert(err?.error?.message || 'Erro ao remover ticket.');
      this.loading = false;
    },
    complete: () => {
      this.loading = false;
    },
  });
}

  priorityLabel(priority: TicketPriority) {
    switch (priority) {
      case 'LOW':
        return 'Baixa';
      case 'MEDIUM':
        return 'Média';
      case 'HIGH':
        return 'Alta';
      default:
        return priority;
    }
  }
}
