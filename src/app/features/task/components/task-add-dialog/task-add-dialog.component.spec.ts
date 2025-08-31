import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { TaskAddDialogComponent } from './task-add-dialog.component';
import { TaskStateService } from '../../services/task-state.service';

describe('TaskAddDialogComponent', () => {
  let component: TaskAddDialogComponent;
  let fixture: ComponentFixture<TaskAddDialogComponent>;

  const mockTaskStateService = {
    addTask: jasmine.createSpy('addTask').and.returnValue(
      of({
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
      }),
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskAddDialogComponent, BrowserAnimationsModule],
      providers: [
        {
          provide: TaskStateService,
          useValue: mockTaskStateService,
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: jasmine.createSpy('close'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
