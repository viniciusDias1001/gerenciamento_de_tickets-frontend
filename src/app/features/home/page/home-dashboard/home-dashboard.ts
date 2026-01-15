import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { TicketService } from '../../../../core/services/ticket.service';
import { PageResponse, TicketPriority, TicketResponse, TicketStatus } from '../../../../core/models/ticket.models';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-dashboard.html',
  styleUrls: ['./home-dashboard.scss'],
})
export class HomeDashboardComponent implements OnInit {
  private ticketService = inject(TicketService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  loading = false;
  errorMsg = '';

  lastTickets: TicketResponse[] = [];

  total = 0;
  open = 0;
  inProgress = 0;
  done = 0;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    // pega uma “amostra” (50) para dashboard
    this.ticketService
      .list({ page: 0, size: 50 })
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
        next: (res: PageResponse<TicketResponse>) => {
          this.zone.run(() => {
            const items = res.content ?? [];
            this.total = res.totalElements ?? items.length;

            this.open = items.filter(t => t.status === 'OPEN').length;
            this.inProgress = items.filter(t => t.status === 'IN_PROGRESS').length;
            this.done = items.filter(t => t.status === 'DONE').length;

            // últimos 5 pelo updatedAt (se vier)
            this.lastTickets = [...items]
              .sort((a: any, b: any) => {
                const da = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
                const db = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
                return db - da;
              })
              .slice(0, 5);

            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.errorMsg = err?.error?.message || 'Não foi possível carregar o dashboard.';
            this.cdr.markForCheck();
          });
        },
      });
  }

  statusLabel(status: TicketStatus) {
    if (status === 'OPEN') return 'Aberto';
    if (status === 'IN_PROGRESS') return 'Em andamento';
    return 'Concluído';
  }

  priorityLabel(priority: TicketPriority) {
    if (priority === 'LOW') return 'Baixa';
    if (priority === 'MEDIUM') return 'Média';
    return 'Alta';
  }
}
