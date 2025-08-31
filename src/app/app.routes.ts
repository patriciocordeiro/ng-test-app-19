import { Routes } from '@angular/router';
import { AppRoutes } from './core/constants/routes.constants';

export const routes: Routes = [
  {
    path: AppRoutes.ROOT,
    redirectTo: AppRoutes.TASKS,
    pathMatch: 'full',
  },
  {
    path: AppRoutes.TASKS,
    loadChildren: () => import('./features/task/task.routes').then(m => m.TASK_ROUTES),
  },
];
