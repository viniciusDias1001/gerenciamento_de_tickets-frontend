import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketService } from '../../../../core/services/ticket.service';
import { TicketPriority } from '../../../../core/models/ticket.models';

@Component({
  selector: 'app-tickets-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './tickets-create.html',
  styleUrls: ['./tickets-create.scss'],
})
export class TicketsCreateComponent {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private router = inject(Router);

  loading = false;
  errorMsg = '';

  priorities: { label: string; value: TicketPriority }[] = [
    { label: 'Baixa', value: 'LOW' },
    { label: 'Média', value: 'MEDIUM' },
    { label: 'Alta', value: 'HIGH' },
  ];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    priority: ['MEDIUM' as TicketPriority],
  });

  submit() {
    this.errorMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const payload = {
      title: this.form.value.title!,
      description: this.form.value.description!,
      priority: this.form.value.priority!,
    };

    this.ticketService.create(payload).subscribe({
      next: () => {
        this.router.navigate(['/home/tickets']);
      },
      error: (err) => {
        this.errorMsg =
          err?.error?.message ||
          'Não foi possível criar o ticket. Verifique seus dados e tente novamente.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
