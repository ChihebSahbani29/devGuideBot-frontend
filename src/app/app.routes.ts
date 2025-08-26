import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'workspaces' },
  {
    path: 'workspaces',
    loadChildren: () =>
      import('./features/workspaces/workspaces.routes').then(m => m.WORKSPACES_ROUTES),
  },
  { path: '**', redirectTo: 'workspaces' },
];