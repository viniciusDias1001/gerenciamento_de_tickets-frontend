import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loading = false;
  errorMsg = '';
  form;
  showPass = false;
capsOn = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }
  checkCaps(e: KeyboardEvent) {
  this.capsOn = !!(e.getModifierState && e.getModifierState('CapsLock'));
}
togglePass() {
  this.showPass = !this.showPass;
}

  submit() {
    this.errorMsg = '';

    
    this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.auth
      .login(this.form.getRawValue() as any)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges(); 
        })
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/home/dashboard');
        },
        error: (err) => {
          this.errorMsg = 'Email ou senha inválidos.';
          this.cdr.detectChanges(); 
        },
      });
  }
}
