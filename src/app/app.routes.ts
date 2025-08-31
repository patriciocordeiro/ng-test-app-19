import { Routes } from '@angular/router';
import { AppRoutes } from './core/constanst/routes.constants';
import { TASK_ROUTES } from './features/task/task.routes';

export const routes: Routes = [
  {
    path: AppRoutes.TASKS,
    loadComponent: () =>
      import('./features/task/task-layout/task-layout.component').then(c => c.TaskLayoutComponent),
    children: TASK_ROUTES,
  },
  {
    path: AppRoutes.ROOT,
    redirectTo: AppRoutes.TASKS,
    pathMatch: 'full',
  },
];
