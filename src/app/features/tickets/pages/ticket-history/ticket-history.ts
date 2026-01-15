import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { TicketService } from '../../../../core/services/ticket.service';
import { PageResponse, TicketHistory, TicketStatus } from '../../../../core/models/ticket.models';

@Component({
  selector: 'app-ticket-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-history.html',
  styleUrls: ['./ticket-history.scss'],
})
export class TicketHistoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(TicketService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  ticketId = '';
  loading = false;
  errorMsg = '';

  page?: PageResponse<TicketHistory>;
  pageSize = 10;

  ngOnInit() {
    console.log('[TicketHistory] ngOnInit START');

    // observa mudanças de rota
    this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id');
      console.log('[TicketHistory] paramMap mudou', { id, url: location.href });

      if (!id) {
        console.warn('[TicketHistory] id ausente → redirect');
        this.router.navigateByUrl('/home/tickets');
        return;
      }

      this.ticketId = id;
      this.load(0);
    });

    // snapshot (comparação)
    const snapId = this.route.snapshot.paramMap.get('id');
    console.log('[TicketHistory] snapshot id', snapId);
  }

  load(pageIndex: number) {
    console.log('[TicketHistory] load START', {
      ticketId: this.ticketId,
      pageIndex,
      pageSize: this.pageSize,
    });

    this.loading = true;
    this.errorMsg = '';
    this.page = undefined;

    this.ticketService
      .gethistory(this.ticketId, pageIndex, this.pageSize)
      .pipe(
        take(1),
        finalize(() => {
          console.log('[TicketHistory] finalize (sempre roda)', {
            loadingBefore: this.loading,
            hasPage: !!this.page,
            errorMsg: this.errorMsg,
          });

          this.zone.run(() => {
            this.loading = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          console.log('[TicketHistory] NEXT response', res);

          this.zone.run(() => {
            this.page = res;
            this.cdr.detectChanges();
          });

          console.log('[TicketHistory] page setada', {
            total: res.totalElements,
            pages: res.totalPages,
            size: res.content?.length,
          });
        },
        error: (err) => {
          console.error('[TicketHistory] ERROR', err);

          this.zone.run(() => {
            this.errorMsg =
              err?.error?.message || 'Não foi possível carregar o histórico.';
            this.cdr.detectChanges();
          });
        },
      });
  }

  prev() {
    console.log('[TicketHistory] prev clicado');
    if (!this.page || this.page.first) return;
    this.load(this.page.number - 1);
  }

  next() {
    console.log('[TicketHistory] next clicado');
    if (!this.page || this.page.last) return;
    this.load(this.page.number + 1);
  }

  statusLabel(s: TicketStatus | null | undefined) {
    if (!s) return '-';
    if (s === 'OPEN') return 'Aberto';
    if (s === 'IN_PROGRESS') return 'Em andamento';
    return 'Concluído';
  }

  actionLabel(a: string) {
    const map: Record<string, string> = {
      CREATED: 'Criado',
      UPDATED: 'Atualizado',
      STATUS_CHANGED: 'Status alterado',
      ASSIGNED: 'Atribuído',
    };
    return map[a] || a;
  }

  back() {
    console.log('[TicketHistory] back()');
    this.router.navigate(['/home/tickets']);
  }
}
