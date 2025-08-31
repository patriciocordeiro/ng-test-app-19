import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TaskStateService } from '../../services/task-state.service';

@Component({
  selector: 'app-task-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, MatCardModule, MatButtonModule],
  templateUrl: './task-detail-page.component.html',
  styleUrls: ['./task-detail-page.component.scss'],
})
export class TaskDetailPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private taskState = inject(TaskStateService);

  // We can use the new `input` from route feature in Angular v16+
  // For now, let's stick to the classic ActivatedRoute for wider compatibility demo.
  private taskId = this.route.snapshot.paramMap.get('id');

  readonly state = this.taskState.selectedTaskState;
  readonly task = computed(() => this.state().data);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  ngOnInit(): void {
    if (this.taskId) {
      this.taskState.loadTaskById(Number(this.taskId));
    }
  }

  ngOnDestroy(): void {
    // Clean up the state when the user navigates away from this page
    this.taskState.clearSelectedTask();
  }
}
