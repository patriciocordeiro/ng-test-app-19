import { Sort } from '@/app/core/models/sorting.model';
import { Component, inject, signal } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskStateService } from '../../services/task-state.service';

@Component({
  selector: 'app-task-list-page',
  imports: [],
  templateUrl: './task-list-page.component.html',
  styleUrl: './task-list-page.component.scss',
})
export class TaskListPageComponent {
  private taskState: TaskStateService = inject(TaskStateService);
  readonly tasksState = this.taskState.tasksState;

  readonly #pageQuery = signal({ page: 1, limit: 10 });
  readonly #sortQuery = signal<Sort<Task>>({
    direction: 'asc',
    sortBy: 'title',
  });

  constructor() {
    // This effect will run initially and then again anytime #pageQuery or #sort changes
    this.taskState.loadTasks(this.#pageQuery(), this.#sortQuery());
  }

  get data() {
    return this.tasksState().data;
  }

  get loading() {
    return this.tasksState().loading;
  }

  get error() {
    return this.tasksState().error;
  }

  retryLoad(): void {
    this.taskState.loadTasks(this.#pageQuery(), this.#sortQuery());
  }
}
