import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, inject, ChangeDetectorRef, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

import { TicketService } from '../../../../core/services/ticket.service';
import { AuthService } from '../../../../core/services/auth';
import { PageResponse, TicketPriority, TicketResponse, TicketStatus } from '../../../../core/models/ticket.models';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf, NgFor, RouterLink, RouterModule],
  templateUrl: './tickets-list.html',
  styleUrls: ['./tickets-list.scss'],
})
export class TicketsList implements OnInit, OnDestroy {
  private zone = inject(NgZone);
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  private loadSub?: Subscription;
  private qpSub?: Subscription;

  loading = false;
  errorMsg = '';
  page: PageResponse<TicketResponse> | null = null;

  
  mineMode = false;

  isAdmin = false;
  isTech = false;
  isClient = false;

  canCreate = false;

  headerTitle = 'Tickets';
  headerSubtitle = 'Lista de tickets (filtros por status/prioridade)';

  
  private mineAll: TicketResponse[] = [];
  private mineFiltered: TicketResponse[] = [];

 
  confirmOpen = false;
  confirmTitle = 'Confirmar exclusão';
  confirmMessage = '';
  private confirmAction: (() => void) | null = null;

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
    this.isClient = role === 'CLIENT';

    
    this.canCreate = this.isClient;

    
    this.qpSub = this.route.queryParamMap.subscribe((pm) => {
      this.mineMode = pm.get('mine') === 'true';

      this.updateHeader();
      this.load(0);
    });
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    this.qpSub?.unsubscribe();
  }

  private updateHeader() {
    if (this.mineMode) {
      if (this.isTech) {
        this.headerTitle = 'Meus Tickets';
        this.headerSubtitle = 'Tickets atribuídos a você';
      } else if (this.isClient) {
        this.headerTitle = 'Meus Tickets';
        this.headerSubtitle = 'Tickets criados por você';
      } else {
        this.headerTitle = 'Meus Tickets';
        this.headerSubtitle = 'Lista filtrada';
      }
    } else {
      this.headerTitle = 'Tickets';
      this.headerSubtitle = 'Lista de tickets (filtros por status/prioridade)';
    }
  }

  load(pageNumber: number) {
    if (this.mineMode) {
      this.loadMine(pageNumber);
    } else {
      this.loadServer(pageNumber);
    }
  }

  private loadServer(pageNumber: number) {
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
          this.zone.run(() => {
            this.errorMsg = err?.error?.message || 'Falha ao carregar tickets.';
            this.cdr.markForCheck();
          });
        },
      });
  }

  
  private loadMine(pageIndex: number) {
    this.loadSub?.unsubscribe();

    this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    const { status, priority } = this.form.getRawValue();

    this.loadSub = this.ticketService
      .list({
        page: 0,
        size: 1000, // lote grande para filtrar local
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
          this.mineAll = res.content ?? [];

          
          

          
          const q = (this.form.value.q ?? '').trim().toLowerCase();
          
          
          this.zone.run(() => {
            this.page = this.buildLocalPage(pageIndex);
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.errorMsg = err?.error?.message || 'Falha ao carregar tickets.';
            this.cdr.markForCheck();
          });
        },
      });
  }

  private buildLocalPage(pageIndex: number): PageResponse<TicketResponse> {
    const size = this.form.value.size ?? 10;
    const totalElements = this.mineFiltered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));

    const safeIndex = Math.min(Math.max(pageIndex, 0), totalPages - 1);
    const start = safeIndex * size;
    const content = this.mineFiltered.slice(start, start + size);

    return {
      content,
      number: safeIndex,
      size,
      totalElements,
      totalPages,
      first: safeIndex === 0,
      last: safeIndex === totalPages - 1,
    };
  }

 

    
    


  applyFilters() {
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
      case 'OPEN': return 'Aberto';
      case 'IN_PROGRESS': return 'Em andamento';
      case 'DONE': return 'Concluído';
      default: return status;
    }
  }

  priorityLabel(priority: TicketPriority) {
    switch (priority) {
      case 'LOW': return 'Baixa';
      case 'MEDIUM': return 'Média';
      case 'HIGH': return 'Alta';
      default: return priority;
    }
  }

  // ===== delete =====
  openDeleteConfirm(ticket: TicketResponse) {
    this.confirmTitle = 'Excluir ticket';
    this.confirmMessage = `Tem certeza que deseja excluir "${ticket.title}"? Essa ação não pode ser desfeita.`;
    this.confirmAction = () => this.deleteTicket(ticket.id);
    this.confirmOpen = true;
  }

  confirmYes() {
    this.confirmOpen = false;
    const fn = this.confirmAction;
    this.confirmAction = null;
    fn?.();
  }

  confirmNo() {
    this.confirmOpen = false;
    this.confirmAction = null;
  }

  private deleteTicket(id: string) {
    this.loading = true;

    this.ticketService.delete(id).pipe(take(1)).subscribe({
      next: () => {
        this.loading = false;
        this.load(this.page?.number ?? 0);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Erro ao remover ticket.';
        this.cdr.markForCheck();
      },
    });
  }
}
