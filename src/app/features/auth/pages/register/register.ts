import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  loading = false;
  errorMsg = '';

  form;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      role: ['CLIENT'],
    });
  }

  submit() {
    this.errorMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();


      return;
    }

    this.loading = true;
    this.auth.register(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Falha ao cadastrar.';
      },
    });
  }
}
