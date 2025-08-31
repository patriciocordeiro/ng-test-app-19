import { Routes } from '@angular/router';
import { TaskLayoutComponent } from './task-layout/task-layout.component';

export const TASK_ROUTES: Routes = [
  {
    path: '',
    component: TaskLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/task-list-page/task-list-page.component').then(
            c => c.TaskListPageComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/task-detail-page/task-detail-page.component').then(
            c => c.TaskDetailPageComponent,
          ),
      },
    ],
  },
];
