import { Routes } from '@angular/router';
import { TaskListPageComponent } from './pages/task-list-page/task-list-page.component';

export const TASK_ROUTES: Routes = [
  {
    path: '',
    component: TaskListPageComponent,

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
