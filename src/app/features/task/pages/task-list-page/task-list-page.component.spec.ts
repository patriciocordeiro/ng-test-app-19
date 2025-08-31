import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { TaskStateService } from '../../services/task-state.service';
import { TaskListPageComponent } from './task-list-page.component';

describe('TaskListPageComponent', () => {
  let component: TaskListPageComponent;
  let fixture: ComponentFixture<TaskListPageComponent>;

  const mockTaskStateService = {
    tasksState: signal({
      data: null,
      loading: false,
      error: null,
    }),
    loadTasks: jasmine.createSpy('loadTasks'),
    addTask: jasmine.createSpy('addTask').and.returnValue(of({})),
    updateTask: jasmine.createSpy('updateTask').and.returnValue(of({})),
    deleteTask: jasmine.createSpy('deleteTask').and.returnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskListPageComponent, BrowserAnimationsModule],
      providers: [
        {
          provide: TaskStateService,
          useValue: mockTaskStateService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
