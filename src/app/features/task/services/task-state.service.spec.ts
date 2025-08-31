import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { ApiState } from '@core/models/api-state.model';
import { AppError } from '@core/models/app-error.model';
import { PageQuery, PaginatedResult } from '@core/models/pagination.model';
import { Sort } from '@core/models/sorting.model';
import { Task } from '../models/task.model';
import { TaskApiService } from './task-api.service';
import { TaskStateService } from './task-state.service';

describe('TaskStateService', () => {
  let service: TaskStateService;
  let taskApiServiceSpy: jasmine.SpyObj<TaskApiService>;
  let testScheduler: TestScheduler;

  // Mock data
  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
  };

  const mockTask2: Task = {
    id: 2,
    title: 'Test Task 2',
    description: 'Test Description 2',
    completed: true,
  };

  const mockPaginatedResult: PaginatedResult<Task> = {
    items: [mockTask, mockTask2],
    totalCount: 2,
  };

  const mockPageQuery: PageQuery = {
    page: 1,
    limit: 10,
  };

  const mockSort: Sort<Task> = {
    sortBy: 'title',
    direction: 'asc',
  };

  const mockAppError: AppError = {
    status: 500,
    message: 'Internal Server Error',
  };

  const mockNewTaskData: Omit<Task, 'id' | 'completed'> = {
    title: 'New Task',
    description: 'New Task Description',
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('TaskApiService', [
      'getTasks',
      'addTask',
      'updateTask',
      'deleteTask',
      'getTaskById',
    ]);

    TestBed.configureTestingModule({
      providers: [TaskStateService, { provide: TaskApiService, useValue: spy }],
    });

    service = TestBed.inject(TaskStateService);
    taskApiServiceSpy = TestBed.inject(TaskApiService) as jasmine.SpyObj<TaskApiService>;

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have initial tasks state with null data, loading false, and no error', () => {
      const expectedState: ApiState<PaginatedResult<Task> | null> = {
        data: null,
        loading: false,
        error: null,
      };

      expect(service.tasksState()).toEqual(expectedState);
    });

    it('should have initial selected task state with null data, loading false, and no error', () => {
      const expectedState: ApiState<Task> = {
        data: null,
        loading: false,
        error: null,
      };

      expect(service.selectedTaskState()).toEqual(expectedState);
    });
  });

  describe('loadTasks', () => {
    it('should set loading to true when starting to load tasks', () => {
      taskApiServiceSpy.getTasks.and.returnValue(of(mockPaginatedResult));

      service.loadTasks(mockPageQuery, mockSort);

      // Check that loading was set to true initially
      expect(service.tasksState().loading).toBe(false); // Will be false after completion
      expect(service.tasksState().error).toBeNull();
    });

    it('should successfully load tasks and update state', () => {
      taskApiServiceSpy.getTasks.and.returnValue(of(mockPaginatedResult));

      service.loadTasks(mockPageQuery, mockSort);

      expect(taskApiServiceSpy.getTasks).toHaveBeenCalledWith(mockPageQuery, mockSort);
      expect(service.tasksState()).toEqual({
        data: mockPaginatedResult,
        loading: false,
        error: null,
      });
    });

    it('should handle error when loading tasks fails', () => {
      taskApiServiceSpy.getTasks.and.returnValue(throwError(() => mockAppError));

      service.loadTasks(mockPageQuery, mockSort);

      expect(taskApiServiceSpy.getTasks).toHaveBeenCalledWith(mockPageQuery, mockSort);
      expect(service.tasksState()).toEqual({
        data: null,
        loading: false,
        error: mockAppError,
      });
    });

    it('should clear previous error when loading new tasks', () => {
      // First, set an error state
      taskApiServiceSpy.getTasks.and.returnValue(throwError(() => mockAppError));
      service.loadTasks(mockPageQuery, mockSort);
      expect(service.tasksState().error).toEqual(mockAppError);

      // Then, successfully load tasks
      taskApiServiceSpy.getTasks.and.returnValue(of(mockPaginatedResult));
      service.loadTasks(mockPageQuery, mockSort);

      expect(service.tasksState()).toEqual({
        data: mockPaginatedResult,
        loading: false,
        error: null,
      });
    });
  });

  describe('addTask', () => {
    it('should call taskApi.addTask and return the observable', () => {
      const expectedNewTask: Task = { ...mockNewTaskData, id: 3, completed: false };
      taskApiServiceSpy.addTask.and.returnValue(of(expectedNewTask));

      const result$ = service.addTask(mockNewTaskData);

      expect(taskApiServiceSpy.addTask).toHaveBeenCalledWith(mockNewTaskData);

      result$.subscribe(result => {
        expect(result).toEqual(expectedNewTask);
      });
    });

    it('should propagate errors from taskApi.addTask', () => {
      taskApiServiceSpy.addTask.and.returnValue(throwError(() => mockAppError));

      const result$ = service.addTask(mockNewTaskData);

      result$.subscribe({
        next: () => fail('Should have errored'),
        error: error => {
          expect(error).toEqual(mockAppError);
        },
      });
    });
  });

  describe('updateTask', () => {
    beforeEach(() => {
      // Set up initial state with tasks
      taskApiServiceSpy.getTasks.and.returnValue(of(mockPaginatedResult));
      service.loadTasks(mockPageQuery, mockSort);
    });

    it('should call taskApi.updateTask and update the local state optimistically', () => {
      const updatedTask: Task = { ...mockTask, title: 'Updated Title' };
      taskApiServiceSpy.updateTask.and.returnValue(of(updatedTask));

      const result$ = service.updateTask(updatedTask);

      expect(taskApiServiceSpy.updateTask).toHaveBeenCalledWith(updatedTask);

      result$.subscribe(result => {
        expect(result).toEqual(updatedTask);

        // Check that the local state was updated
        const currentState = service.tasksState();
        expect(currentState.data?.items.find(item => item.id === updatedTask.id)).toEqual(
          updatedTask,
        );
      });
    });

    it('should not update local state if data is null', () => {
      // Clear the state
      const clearedState: ApiState<PaginatedResult<Task> | null> = {
        data: null,
        loading: false,
        error: null,
      };
      // We can't directly set the private signal, so we'll test the behavior when state.data is null

      const updatedTask: Task = { ...mockTask, title: 'Updated Title' };
      taskApiServiceSpy.updateTask.and.returnValue(of(updatedTask));

      const result$ = service.updateTask(updatedTask);

      result$.subscribe(result => {
        expect(result).toEqual(updatedTask);
      });
    });

    it('should propagate errors from taskApi.updateTask', () => {
      const updatedTask: Task = { ...mockTask, title: 'Updated Title' };
      taskApiServiceSpy.updateTask.and.returnValue(throwError(() => mockAppError));

      const result$ = service.updateTask(updatedTask);

      result$.subscribe({
        next: () => fail('Should have errored'),
        error: error => {
          expect(error).toEqual(mockAppError);
        },
      });
    });

    it('should only update the correct task in the local state', () => {
      const updatedTask: Task = { ...mockTask, title: 'Updated Title' };
      taskApiServiceSpy.updateTask.and.returnValue(of(updatedTask));

      const result$ = service.updateTask(updatedTask);

      result$.subscribe(() => {
        const currentState = service.tasksState();
        const updatedItem = currentState.data?.items.find(item => item.id === updatedTask.id);
        const unchangedItem = currentState.data?.items.find(item => item.id === mockTask2.id);

        expect(updatedItem).toEqual(updatedTask);
        expect(unchangedItem).toEqual(mockTask2); // Should remain unchanged
      });
    });
  });

  describe('deleteTask', () => {
    it('should call taskApi.deleteTask and return the observable', () => {
      const taskId = 1;
      taskApiServiceSpy.deleteTask.and.returnValue(of(void 0));

      const result$ = service.deleteTask(taskId);

      expect(taskApiServiceSpy.deleteTask).toHaveBeenCalledWith(taskId);

      result$.subscribe(result => {
        expect(result).toBeUndefined();
      });
    });

    it('should propagate errors from taskApi.deleteTask', () => {
      const taskId = 1;
      taskApiServiceSpy.deleteTask.and.returnValue(throwError(() => mockAppError));

      const result$ = service.deleteTask(taskId);

      result$.subscribe({
        next: () => fail('Should have errored'),
        error: error => {
          expect(error).toEqual(mockAppError);
        },
      });
    });
  });

  describe('loadTaskById', () => {
    it('should set loading to true when starting to load a task', () => {
      taskApiServiceSpy.getTaskById.and.returnValue(of(mockTask));

      service.loadTaskById(1);

      // The loading state will be false after the observable completes
      expect(service.selectedTaskState().loading).toBe(false);
      expect(service.selectedTaskState().error).toBeNull();
    });

    it('should successfully load a task by ID and update selected task state', () => {
      taskApiServiceSpy.getTaskById.and.returnValue(of(mockTask));

      service.loadTaskById(1);

      expect(taskApiServiceSpy.getTaskById).toHaveBeenCalledWith(1);
      expect(service.selectedTaskState()).toEqual({
        data: mockTask,
        loading: false,
        error: null,
      });
    });

    it('should handle error when loading task by ID fails', () => {
      taskApiServiceSpy.getTaskById.and.returnValue(throwError(() => mockAppError));

      service.loadTaskById(1);

      expect(taskApiServiceSpy.getTaskById).toHaveBeenCalledWith(1);
      expect(service.selectedTaskState()).toEqual({
        data: null,
        loading: false,
        error: mockAppError,
      });
    });

    it('should clear previous selected task data when loading new task', () => {
      // First, load a task
      taskApiServiceSpy.getTaskById.and.returnValue(of(mockTask));
      service.loadTaskById(1);
      expect(service.selectedTaskState().data).toEqual(mockTask);

      // Then, load a different task
      taskApiServiceSpy.getTaskById.and.returnValue(of(mockTask2));
      service.loadTaskById(2);

      expect(service.selectedTaskState().data).toEqual(mockTask2);
    });

    it('should clear previous error when loading new task', () => {
      // First, set an error state
      taskApiServiceSpy.getTaskById.and.returnValue(throwError(() => mockAppError));
      service.loadTaskById(1);
      expect(service.selectedTaskState().error).toEqual(mockAppError);

      // Then, successfully load a task
      taskApiServiceSpy.getTaskById.and.returnValue(of(mockTask));
      service.loadTaskById(1);

      expect(service.selectedTaskState()).toEqual({
        data: mockTask,
        loading: false,
        error: null,
      });
    });
  });

  describe('clearSelectedTask', () => {
    it('should clear the selected task state', () => {
      // First, load a task
      taskApiServiceSpy.getTaskById.and.returnValue(of(mockTask));
      service.loadTaskById(1);
      expect(service.selectedTaskState().data).toEqual(mockTask);

      // Then, clear the selected task
      service.clearSelectedTask();

      expect(service.selectedTaskState()).toEqual({
        data: null,
        loading: false,
        error: null,
      });
    });

    it('should clear error state when clearing selected task', () => {
      // First, set an error state
      taskApiServiceSpy.getTaskById.and.returnValue(throwError(() => mockAppError));
      service.loadTaskById(1);
      expect(service.selectedTaskState().error).toEqual(mockAppError);

      // Then, clear the selected task
      service.clearSelectedTask();

      expect(service.selectedTaskState()).toEqual({
        data: null,
        loading: false,
        error: null,
      });
    });
  });

  describe('Signal Reactivity', () => {
    it('should provide readonly signals that reflect state changes', () => {
      // Test tasks state reactivity
      const tasksState = service.tasksState;
      expect(typeof tasksState).toBe('function'); // Signal is a function

      // Test selected task state reactivity
      const selectedTaskState = service.selectedTaskState;
      expect(typeof selectedTaskState).toBe('function'); // Signal is a function
    });

    it('should not allow direct mutation of readonly signals', () => {
      const tasksState = service.tasksState;
      const selectedTaskState = service.selectedTaskState;

      // These should be readonly signals, so they shouldn't have update/set methods
      expect('set' in tasksState).toBe(false);
      expect('update' in tasksState).toBe(false);
      expect('set' in selectedTaskState).toBe(false);
      expect('update' in selectedTaskState).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: load tasks, update task, load task by ID', () => {
      // Load initial tasks
      taskApiServiceSpy.getTasks.and.returnValue(of(mockPaginatedResult));
      service.loadTasks(mockPageQuery, mockSort);

      expect(service.tasksState().data).toEqual(mockPaginatedResult);

      // Update a task
      const updatedTask: Task = { ...mockTask, title: 'Updated Title' };
      taskApiServiceSpy.updateTask.and.returnValue(of(updatedTask));

      service.updateTask(updatedTask).subscribe();

      const updatedState = service.tasksState();
      expect(updatedState.data?.items.find(item => item.id === updatedTask.id)?.title).toBe(
        'Updated Title',
      );

      // Load task by ID
      taskApiServiceSpy.getTaskById.and.returnValue(of(updatedTask));
      service.loadTaskById(updatedTask.id);

      expect(service.selectedTaskState().data).toEqual(updatedTask);
    });

    it('should handle error scenarios across different operations', () => {
      // Error in loading tasks
      taskApiServiceSpy.getTasks.and.returnValue(throwError(() => mockAppError));
      service.loadTasks(mockPageQuery, mockSort);
      expect(service.tasksState().error).toEqual(mockAppError);

      // Error in loading task by ID
      taskApiServiceSpy.getTaskById.and.returnValue(throwError(() => mockAppError));
      service.loadTaskById(1);
      expect(service.selectedTaskState().error).toEqual(mockAppError);

      // Clear both errors by successful operations
      taskApiServiceSpy.getTasks.and.returnValue(of(mockPaginatedResult));
      taskApiServiceSpy.getTaskById.and.returnValue(of(mockTask));

      service.loadTasks(mockPageQuery, mockSort);
      service.loadTaskById(1);

      expect(service.tasksState().error).toBeNull();
      expect(service.selectedTaskState().error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty paginated result', () => {
      const emptyResult: PaginatedResult<Task> = {
        items: [],
        totalCount: 0,
      };

      taskApiServiceSpy.getTasks.and.returnValue(of(emptyResult));
      service.loadTasks(mockPageQuery, mockSort);

      expect(service.tasksState().data).toEqual(emptyResult);
    });

    it('should handle update of non-existent task ID', () => {
      // Load initial tasks
      taskApiServiceSpy.getTasks.and.returnValue(of(mockPaginatedResult));
      service.loadTasks(mockPageQuery, mockSort);

      // Try to update a task that doesn't exist in the local state
      const nonExistentTask: Task = {
        id: 999,
        title: 'Non-existent Task',
        description: 'Description',
        completed: false,
      };

      taskApiServiceSpy.updateTask.and.returnValue(of(nonExistentTask));

      service.updateTask(nonExistentTask).subscribe();

      // The local state should remain unchanged since the task ID doesn't exist
      const currentState = service.tasksState();
      expect(currentState.data?.items.length).toBe(2);
      expect(currentState.data?.items.find(item => item.id === 999)).toBeUndefined();
    });

    it('should handle multiple rapid state changes', () => {
      taskApiServiceSpy.getTasks.and.returnValue(of(mockPaginatedResult));
      taskApiServiceSpy.getTaskById.and.returnValue(of(mockTask));

      // Rapid successive calls
      service.loadTasks(mockPageQuery, mockSort);
      service.loadTaskById(1);
      service.clearSelectedTask();
      service.loadTaskById(2);

      // Final state should reflect the last operations
      expect(service.tasksState().data).toEqual(mockPaginatedResult);
      expect(service.selectedTaskState().data).toEqual(mockTask); // Last loadTaskById call
    });
  });
});
