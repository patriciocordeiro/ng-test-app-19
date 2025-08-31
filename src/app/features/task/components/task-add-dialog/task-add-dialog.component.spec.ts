import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAddDialogComponent } from './task-add-dialog.component';

describe('TaskAddDialogComponent', () => {
  let component: TaskAddDialogComponent;
  let fixture: ComponentFixture<TaskAddDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskAddDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
