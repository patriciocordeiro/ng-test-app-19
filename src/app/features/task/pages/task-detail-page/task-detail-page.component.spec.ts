import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { TaskDetailPageComponent } from './task-detail-page.component';
import { TaskStateService } from '../../services/task-state.service';

describe('TaskDetailPageComponent', () => {
  let component: TaskDetailPageComponent;
  let fixture: ComponentFixture<TaskDetailPageComponent>;

  const mockTaskStateService = {
    selectedTaskState: signal({
      data: null,
      loading: false,
      error: null,
    }),
    loadTaskById: jasmine.createSpy('loadTaskById'),
    clearSelectedTask: jasmine.createSpy('clearSelectedTask'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailPageComponent],
      providers: [
        {
          provide: TaskStateService,
          useValue: mockTaskStateService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
            snapshot: {
              params: { id: '1' },
              paramMap: {
                get: (key: string) => (key === 'id' ? '1' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
