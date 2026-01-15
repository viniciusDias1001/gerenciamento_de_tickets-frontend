import { Component, Renderer2 } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth'; // ajuste o caminho se precisar
import { NgIf } from '@angular/common';


type Role = 'CLIENT' | 'TECH' | 'ADMIN';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, RouterLink,NgIf],
  templateUrl: './home.html',
})
export class Home {
  usuarioLogado = '';
  emailLogado = ""; 
  role: Role | '' = '';

  isAdmin = false;
  isTech = false;
  isClient = false;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private auth: AuthService
  ) {}

  toggleSidebar() {
   
    const body = document.body;
    body.classList.toggle('sb-sidenav-toggled');
  }

  sair() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  ngOnInit() {
  this.usuarioLogado = this.auth.getUserName() ?? 'Usuário';
    this.emailLogado = this.auth.getUserEmail() ?? '';

    const r = (this.auth.getUserRole() ?? '') as Role | '';
    this.role = r;

    this.isAdmin = r === 'ADMIN';
    this.isTech = r === 'TECH';
    this.isClient = r === 'CLIENT';
}
}

