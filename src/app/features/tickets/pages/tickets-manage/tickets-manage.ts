import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

import { TicketService } from '../../../../core/services/ticket.service';
import { UserService, PageResponse } from '../../../../core/services/user.service';
import { UserRole, UserSummaryResponse } from '../../../../core/models/user.models';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

@Component({
  selector: 'app-tickets-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './tickets-manage.html',
  styleUrl: './tickets-manage.scss',
})
export class TicketsManage implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  private ticketService = inject(TicketService);
  private userService = inject(UserService);

  private ticketSub?: Subscription;
  private techSub?: Subscription;
  private assignSub?: Subscription;
  private statusSub?: Subscription;

  loading = false;
  savingStatus = false;
  assigning = false;

  loadingTechs = false;
  techUsers: UserSummaryResponse[] = [];

  errorMsg = '';
  successMsg = '';

  ticketId = '';
  ticket: any = null;

confirmOpen = false;
confirmTitle = 'Confirmar ação';
confirmMessage = '';
private confirmAction: (() => void) | null = null;

  statusOptions: { label: string; value: TicketStatus }[] = [
    { label: 'Aberto', value: 'OPEN' },
    { label: 'Em andamento', value: 'IN_PROGRESS' },
    { label: 'Concluído', value: 'DONE' },
  ];

  form = this.fb.group({
    status: ['OPEN' as TicketStatus, [Validators.required]],
    techId: ['', [Validators.required]], // agora é select
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMsg = 'Ticket não informado.';
      return;
    }

    this.ticketId = id;

    // carrega em paralelo
    this.loadTicket();
    this.loadTechUsers();
  }

  ngOnDestroy(): void {
    this.ticketSub?.unsubscribe();
    this.techSub?.unsubscribe();
    this.assignSub?.unsubscribe();
    this.statusSub?.unsubscribe();
  }

  get isDone(): boolean {
    return (this.ticket?.status as TicketStatus) === 'DONE';
  }

  private apiMsg(err: any, fallback: string) {
    const msg = err?.error?.message || err?.message || fallback;

    if (err?.status === 422 && String(msg).toLowerCase().includes('done')) {
      return 'Este ticket já está CONCLUÍDO (DONE) e não pode ser alterado.';
    }
    return msg;
  }

  // 🔥 Ajuste aqui se o seu backend usa outro campo
  currentTechId(): string {
    return (
      this.ticket?.techId ||
      this.ticket?.assignedTechId ||
      this.ticket?.tech?.id ||
      ''
    );
  }

  currentTechLabel(): string {
    const id = this.currentTechId();
    if (!id) return 'Não atribuído';

    const found = this.techUsers.find((u) => u.id === id);
    if (!found) return `Atribuído: ${id}`;

    return `${found.name} — ${found.email}`;
  }

  loadTicket() {
    console.log('[manage] loadTicket START', this.ticketId);

    this.ticketSub?.unsubscribe();

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.cdr.markForCheck();

    this.ticketSub = this.ticketService
      .getById(this.ticketId)
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
        next: (t: any) => {
          this.zone.run(() => {
            this.ticket = t;

            // ✅ status sempre sincroniza
            this.form.patchValue({
              status: (t.status ?? 'OPEN') as TicketStatus,
            });

            // ✅ NÃO zera techId na carga.
            // Se o ticket vier com um techId, preenche:
            const current = this.currentTechId();
            if (current) {
              this.form.patchValue({ techId: current }, { emitEvent: false });
            }

            // deixa o form “limpo”
            this.form.markAsPristine();
            this.form.markAsUntouched();

            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.errorMsg = this.apiMsg(err, 'Não foi possível carregar o ticket.');
            this.cdr.markForCheck();
          });
        },
      });
  }

  loadTechUsers() {
    console.log('[manage] loadTechUsers START');

    this.techSub?.unsubscribe();

    this.loadingTechs = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    this.techSub = this.userService
      .list({
        role: 'TECH',
        page: 0,
        size: 200,
        sort: 'name,asc',
      })
      .pipe(
        take(1),
        finalize(() => {
          this.zone.run(() => {
            this.loadingTechs = false;
            this.cdr.markForCheck();
          });
        })
      )
      .subscribe({
        next: (res: PageResponse<UserSummaryResponse>) => {
          this.zone.run(() => {
            this.techUsers = res.content ?? [];

            // ✅ se ticket já tinha tech, tenta “amarrar” label
            const current = this.currentTechId();
            if (current && !this.form.value.techId) {
              this.form.patchValue({ techId: current }, { emitEvent: false });
            }

            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.errorMsg =
              err?.error?.message || 'Não foi possível carregar a lista de técnicos.';
            this.cdr.markForCheck();
          });
        },
      });
  }

  saveStatus() {
  this.successMsg = '';
  this.errorMsg = '';

  if (this.isDone) {
    this.errorMsg = 'Este ticket já está CONCLUÍDO (DONE) e não pode mudar de status.';
    return;
  }

  const status = this.form.value.status as TicketStatus | null;
  if (!status) return;

  if ((this.ticket?.status as TicketStatus) === status) {
    this.successMsg = 'Status já estava nesse valor.';
    return;
  }

  // ✅ POPUP ANTES
  this.openConfirm(
    'Confirmar mudança de status',
    `Deseja alterar o status para: ${status}?`,
    () => this.doSaveStatus(status)
  );
}

// nova função (o que realmente chama a API)
private doSaveStatus(status: TicketStatus) {
  this.savingStatus = true;

  this.ticketService.changeStatus(this.ticketId, { status }).subscribe({
    next: () => {
      this.savingStatus = false;
      this.successMsg = 'Status atualizado com sucesso.';
      this.loadTicket();
    },
    error: (err) => {
      this.savingStatus = false;
      this.errorMsg = this.apiMsg(err, 'Não foi possível alterar o status.');
    },
  });
}

  assignTech() {
  this.successMsg = '';
  this.errorMsg = '';

  if (this.isDone) {
    this.errorMsg = 'Este ticket já está CONCLUÍDO (DONE) e não pode ser atribuído.';
    return;
  }

  const ctrl = this.form.get('techId');
  ctrl?.markAsTouched();
  ctrl?.updateValueAndValidity();

  if (ctrl?.invalid) {
    this.errorMsg = 'Selecione um técnico.';
    return;
  }

  const techId = String(this.form.value.techId ?? '').trim();
  if (!techId) {
    this.errorMsg = 'Selecione um técnico.';
    return;
  }

  
  if (this.currentTechId() && this.currentTechId() === techId) {
    this.successMsg = 'Este ticket já está atribuído para esse técnico.';
    ctrl?.markAsPristine();
    ctrl?.markAsUntouched();
    return;
  }

  
  const tech = this.techUsers.find(u => u.id === techId);
  const techLabel = tech ? `${tech.name} (${tech.email})` : techId;

  
  this.openConfirm(
    'Confirmar atribuição',
    `Deseja atribuir este ticket para: ${techLabel}?`,
    () => this.doAssignTech(techId)
  );
}

  back() {
    this.router.navigate(['/home/tickets']);
  }
  openConfirm(title: string, message: string, action: () => void) {
  this.confirmTitle = title;
  this.confirmMessage = message;
  this.confirmAction = action;
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

private doAssignTech(techId: string) {
  this.assignSub?.unsubscribe();

  this.assigning = true;
  this.cdr.markForCheck();

  this.assignSub = this.ticketService
    .assign(this.ticketId, techId)
    .pipe(
      take(1),
      finalize(() => {
        this.zone.run(() => {
          this.assigning = false;
          this.cdr.markForCheck();
        });
      })
    )
    .subscribe({
      next: () => {
        this.zone.run(() => {
          this.successMsg = 'Ticket atribuído com sucesso.';

          const c = this.form.get('techId');
          c?.markAsPristine();
          c?.markAsUntouched();

          this.loadTicket();
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.errorMsg = err?.error?.message || 'Não foi possível atribuir o ticket.';
          this.cdr.markForCheck();
        });
      },
    });
}

get statusUnchanged(): boolean {
  return !!this.ticket && this.form.value.status === (this.ticket.status as TicketStatus);
}

get techUnchanged(): boolean {
  const current = this.currentTechId();
  const selected = String(this.form.value.techId ?? '');
  return !!current && !!selected && current === selected;
}

}

