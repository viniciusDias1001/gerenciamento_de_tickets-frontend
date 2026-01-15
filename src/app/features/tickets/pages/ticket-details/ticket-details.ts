import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { TicketService } from '../../../../core/services/ticket.service';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket-details.html',
  styleUrl: './ticket-details.scss',
})
export class TicketDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  loading = false;
  errorMsg = '';
  ticket: any = null;

  ngOnInit() {
    console.log('[TicketDetails] ngOnInit START');

    // loga mudanças de rota também
    this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id');
      console.log('[TicketDetails] paramMap mudou', { id, url: location.href });
      if (id) this.load(id);
    });

    // snapshot (só pra comparar)
    const snapId = this.route.snapshot.paramMap.get('id');
    console.log('[TicketDetails] snapshot id', snapId);
  }

  load(id: string) {
    console.log('[TicketDetails] load START', { id });

    this.loading = true;
    this.errorMsg = '';
    this.ticket = null;

    this.ticketService
      .getById(id)
      .pipe(
        take(1),
        finalize(() => {
          console.log('[TicketDetails] finalize (sempre roda)', {
            loadingBefore: this.loading,
            hasTicket: !!this.ticket,
            errorMsg: this.errorMsg,
          });

          // força atualização da tela
          this.zone.run(() => {
            this.loading = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (t) => {
          console.log('[TicketDetails] NEXT ticket recebido', t);

          this.zone.run(() => {
            this.ticket = t;
            this.cdr.detectChanges();
          });

          console.log('[TicketDetails] ticket setado no state', {
            id: this.ticket?.id,
            title: this.ticket?.title,
          });
        },
        error: (e) => {
          console.log('[TicketDetails] ERROR', e);

          this.zone.run(() => {
            this.errorMsg = e?.error?.message || 'Falha ao carregar ticket.';
            this.cdr.detectChanges();
          });
        },
      });
  }
}
