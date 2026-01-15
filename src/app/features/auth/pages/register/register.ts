import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

type Role = 'CLIENT' | 'TECH';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['../register/register.scss'], 
})
export class Register {
  loading = false;
  errorMsg = '';
  showPass = false;

  form;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(4)]],
        confirmPassword: ['', [Validators.required]],
        role: ['CLIENT' as Role],
      },
      { validators: [this.passwordMatchValidator] }
    );
  }

  togglePass() {
    this.showPass = !this.showPass;
  }

  private passwordMatchValidator(group: any) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  submit() {
    this.errorMsg = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.loading = true;

    const payload = {
      name: this.form.value.name,
      email: this.form.value.email,
      password: this.form.value.password,
      role: this.form.value.role,
    };

    this.auth.register(payload as any).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/auth/login'); // <-- rota correta
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Falha ao cadastrar.';
      },
    });
  }
}
