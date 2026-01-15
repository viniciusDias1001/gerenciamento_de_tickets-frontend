import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout';
import { authGuard } from './core/guards/auth.guard';
import { techGuard } from './core/guards/tech.guard';
import { adminGuard } from './core/guards/admin.guard';
import { clientGuard } from './core/guards/client.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },

  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },

 
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/page/home/home').then(m => m.Home),
    children: [
   
      { path: '', pathMatch: 'full', redirectTo: 'tickets' },

      
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/tickets/pages/tickets-list/tickets-list')
            .then(m => m.TicketsList),
      },
      {
        path: 'tickets/novo',
        canActivate: [clientGuard],
        loadComponent: () =>
          import('./features/tickets/pages/tickets-create/tickets-create')
            .then(m => m.TicketsCreateComponent),
      },
      {
        path: 'tickets/gerenciar',
        canActivate: [techGuard],
        loadComponent: () =>
          import('./features/tickets/pages/tickets-manage/tickets-manage')
            .then(m => m.TicketsManage),
      },
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/users/pages/users-list/users-list')
            .then(m => m.UsersList),
      },
      {
       path: 'tickets/:id/manage',
        canActivate: [techGuard], // TECH ou ADMIN (se teu techGuard já permite admin, perfeito)
        loadComponent: () =>
        import('./features/tickets/pages/tickets-manage/tickets-manage')
        .then(m => m.TicketsManage),
      },
      {
      path: 'tickets/:id/history',
      canActivate: [authGuard],
      loadComponent: () =>
      import('./features/tickets/pages/ticket-history/ticket-history')
      .then(m => m.TicketHistoryComponent),

      },
      {
     path: 'tickets/:id',
     canActivate: [authGuard],
     loadComponent: () =>
    import('./features/tickets/pages/ticket-details/ticket-details')
      .then(m => m.TicketDetailsComponent),
},
      
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];
