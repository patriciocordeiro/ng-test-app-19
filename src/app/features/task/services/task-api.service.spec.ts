import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiEndpoints } from '@core/constants/api-endpoints.constant';
import { PageQuery, PaginatedResult } from '@core/models/pagination.model';
import { ServerPaginatedResponse } from '@core/models/server-paginated-response.model';
import { Sort } from '@core/models/sorting.model';
import { environment } from '@env/environment';
import { Task } from '../models/task.model';
import { TaskApiService } from './task-api.service';

describe('TaskApiService', () => {
  let service: TaskApiService;
  let httpTestingController: HttpTestingController;
  const tasksUrl = `${environment.apiBaseUrl}/${ApiEndpoints.TASKS}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskApiService],
    });
    service = TestBed.inject(TaskApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // After every test, verify that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test suite for getTasks
  describe('#getTasks', () => {
    const pageQuery: PageQuery = { page: 1, limit: 10 };
    const sort: Sort<Task> = { sortBy: 'title', direction: 'asc' };
    const dummyTasks: Task[] = [{ id: 1, title: 'Test', description: 'Desc', completed: false }];
    const dummyServerResponse: ServerPaginatedResponse<Task> = {
      data: dummyTasks,
      items: 1,
      pages: 1,
      first: 1,
      last: 1,
    };

    it('should return a PaginatedResult on success', () => {
      let result: PaginatedResult<Task> | undefined;
      service.getTasks(pageQuery, sort).subscribe(res => {
        result = res;
      });

      const req = httpTestingController.expectOne(req => req.url === tasksUrl);
      expect(req.request.method).toBe('GET');
      // Verify query params
      expect(req.request.params.get('_page')).toBe('1');
      expect(req.request.params.get('_per_page')).toBe('10');
      expect(req.request.params.get('_sort')).toBe('title');

      // Respond with a mock HttpResponse
      req.flush(dummyServerResponse, { headers: { 'X-Total-Count': '1' } });

      expect(result).toBeDefined();
      expect(result?.items).toEqual(dummyTasks);
      expect(result?.totalCount).toBe(1);
    });

    it('should handle different page queries and sorting', () => {
      const pageQuery2: PageQuery = { page: 2, limit: 5 };
      const sort2: Sort<Task> = { sortBy: 'completed', direction: 'desc' };

      service.getTasks(pageQuery2, sort2).subscribe();

      const req = httpTestingController.expectOne(req => req.url === tasksUrl);
      expect(req.request.params.get('_page')).toBe('2');
      expect(req.request.params.get('_per_page')).toBe('5');
      expect(req.request.params.get('_sort')).toBe('-completed');
      expect(req.request.params.get('_order')).toBe('desc');

      req.flush(dummyServerResponse, { headers: { 'X-Total-Count': '10' } });
    });

    it('should handle empty response', () => {
      const emptyResponse: ServerPaginatedResponse<Task> = {
        data: [],
        items: 0,
        pages: 0,
        first: 1,
        last: 1,
      };

      let result: PaginatedResult<Task> | undefined;
      service.getTasks(pageQuery, sort).subscribe(res => {
        result = res;
      });

      const req = httpTestingController.expectOne(req => req.url === tasksUrl);
      req.flush(emptyResponse, { headers: { 'X-Total-Count': '0' } });

      expect(result?.items).toEqual([]);
      expect(result?.totalCount).toBe(0);
    });

    it('should handle errors', () => {
      let error: unknown;
      service.getTasks(pageQuery, sort).subscribe({
        error: e => (error = e),
      });

      // We expect 3 requests due to retry(2)
      for (let i = 0; i < 3; i++) {
        const req = httpTestingController.expectOne(req => req.url === tasksUrl);
        req.flush('Something went wrong', { status: 500, statusText: 'Server Error' });
      }

      expect(error).toBeDefined();
    });

    it('should retry on failure exactly 2 times', () => {
      service.getTasks(pageQuery, sort).subscribe({
        error: () => {}, // Ignore error for this test
      });

      // Should make exactly 3 requests (initial + 2 retries)
      for (let i = 0; i < 3; i++) {
        const req = httpTestingController.expectOne(req => req.url === tasksUrl);
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      }

      // No more requests should be made
      httpTestingController.verify();
      expect().nothing(); // Explicit expectation for the test
    });
  });

  // Test suite for getTaskById
  describe('#getTaskById', () => {
    const dummyTask: Task = { id: 1, title: 'Test', description: 'Desc', completed: false };

    it('should return a single task on success', () => {
      let result: Task | undefined;
      service.getTaskById(1).subscribe(res => {
        result = res;
      });

      const req = httpTestingController.expectOne(`${tasksUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyTask);

      expect(result).toEqual(dummyTask);
    });

    it('should handle different task IDs', () => {
      const task2: Task = {
        id: 99,
        title: 'Task 99',
        description: 'Description 99',
        completed: true,
      };

      let result: Task | undefined;
      service.getTaskById(99).subscribe(res => {
        result = res;
      });

      const req = httpTestingController.expectOne(`${tasksUrl}/99`);
      expect(req.request.method).toBe('GET');
      req.flush(task2);

      expect(result).toEqual(task2);
    });

    it('should handle errors', () => {
      let error: unknown;
      service.getTaskById(1).subscribe({
        error: e => (error = e),
      });

      // We expect 3 requests due to retry(2)
      for (let i = 0; i < 3; i++) {
        const req = httpTestingController.expectOne(`${tasksUrl}/1`);
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      }

      expect(error).toBeDefined();
    });

    it('should retry on failure exactly 2 times', () => {
      service.getTaskById(1).subscribe({
        error: () => {}, // Ignore error for this test
      });

      // Should make exactly 3 requests (initial + 2 retries)
      for (let i = 0; i < 3; i++) {
        const req = httpTestingController.expectOne(`${tasksUrl}/1`);
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      }

      // No more requests should be made
      httpTestingController.verify();
      expect().nothing(); // Explicit expectation for the test
    });
  });

  // Test suite for addTask
  describe('#addTask', () => {
    const newTaskData: Omit<Task, 'id' | 'completed'> = {
      title: 'New Task',
      description: 'New Desc',
    };
    const createdTask: Task = { id: 2, ...newTaskData, completed: false };

    it('should create and return a task on success', () => {
      let result: Task | undefined;
      service.addTask(newTaskData).subscribe(res => {
        result = res;
      });

      const req = httpTestingController.expectOne(tasksUrl);
      expect(req.request.method).toBe('POST');
      // Check that the request body is correct (without id, completed=false)
      expect(req.request.body).toEqual({ ...newTaskData, completed: false });
      req.flush(createdTask);

      expect(result).toEqual(createdTask);
    });

    it('should automatically set completed to false for new tasks', () => {
      const taskDataWithoutCompleted: Omit<Task, 'id' | 'completed'> = {
        title: 'Another Task',
        description: 'Another Description',
      };

      service.addTask(taskDataWithoutCompleted).subscribe();

      const req = httpTestingController.expectOne(tasksUrl);
      expect(req.request.body.completed).toBe(false);
      req.flush({ id: 3, ...taskDataWithoutCompleted, completed: false });
    });

    it('should handle minimal task data', () => {
      const minimalTaskData: Omit<Task, 'id' | 'completed'> = {
        title: 'Minimal',
        description: '',
      };

      service.addTask(minimalTaskData).subscribe();

      const req = httpTestingController.expectOne(tasksUrl);
      expect(req.request.body).toEqual({ ...minimalTaskData, completed: false });
      req.flush({ id: 4, ...minimalTaskData, completed: false });
    });

    it('should handle errors', () => {
      let error: unknown;
      service.addTask(newTaskData).subscribe({
        error: e => (error = e),
      });

      const req = httpTestingController.expectOne(tasksUrl);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });

      expect(error).toBeDefined();
    });
  });

  // Test suite for updateTask
  describe('#updateTask', () => {
    const taskToUpdate: Task = {
      id: 1,
      title: 'Updated',
      description: 'Updated Desc',
      completed: true,
    };

    it('should update and return a task on success', () => {
      let result: Task | undefined;
      service.updateTask(taskToUpdate).subscribe(res => {
        result = res;
      });

      const req = httpTestingController.expectOne(`${tasksUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(taskToUpdate);
      req.flush(taskToUpdate);

      expect(result).toEqual(taskToUpdate);
    });

    it('should handle updating different task properties', () => {
      const partialUpdate: Task = {
        id: 5,
        title: 'Just title changed',
        description: 'Original description',
        completed: false,
      };

      let result: Task | undefined;
      service.updateTask(partialUpdate).subscribe(res => {
        result = res;
      });

      const req = httpTestingController.expectOne(`${tasksUrl}/5`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(partialUpdate);
      req.flush(partialUpdate);

      expect(result).toEqual(partialUpdate);
    });

    it('should handle toggling completion status', () => {
      const toggleTask: Task = {
        id: 10,
        title: 'Toggle Task',
        description: 'Toggle Description',
        completed: true,
      };

      service.updateTask(toggleTask).subscribe();

      const req = httpTestingController.expectOne(`${tasksUrl}/10`);
      expect(req.request.body.completed).toBe(true);
      req.flush(toggleTask);
    });

    it('should handle errors', () => {
      let error: unknown;
      service.updateTask(taskToUpdate).subscribe({
        error: e => (error = e),
      });

      const req = httpTestingController.expectOne(`${tasksUrl}/1`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });

      expect(error).toBeDefined();
    });
  });

  // Test suite for deleteTask
  describe('#deleteTask', () => {
    it('should complete successfully on deletion', () => {
      let completed = false;
      service.deleteTask(1).subscribe({
        complete: () => (completed = true),
      });

      const req = httpTestingController.expectOne(`${tasksUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });

      expect(completed).toBe(true);
    });

    it('should handle deletion of different task IDs', () => {
      let result: void | null | undefined;
      service.deleteTask(999).subscribe(res => {
        result = res;
      });

      const req = httpTestingController.expectOne(`${tasksUrl}/999`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });

      expect(result).toBe(null); // DELETE returns null from the flush
    });

    it('should handle successful deletion with different status codes', () => {
      let completed = false;
      service.deleteTask(5).subscribe({
        complete: () => (completed = true),
      });

      const req = httpTestingController.expectOne(`${tasksUrl}/5`);
      req.flush(null, { status: 200, statusText: 'OK' });

      expect(completed).toBe(true);
    });

    it('should handle errors', () => {
      let error: unknown;
      service.deleteTask(1).subscribe({
        error: e => (error = e),
      });

      const req = httpTestingController.expectOne(`${tasksUrl}/1`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(error).toBeDefined();
    });

    it('should handle server errors during deletion', () => {
      let error: unknown;
      service.deleteTask(1).subscribe({
        error: e => (error = e),
      });

      const req = httpTestingController.expectOne(`${tasksUrl}/1`);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });

      expect(error).toBeDefined();
    });
  });

  // Integration tests
  describe('Integration Tests', () => {
    it('should handle complete CRUD workflow', () => {
      const newTaskData = { title: 'Integration Task', description: 'Integration Description' };
      const createdTask: Task = { id: 100, ...newTaskData, completed: false };
      const updatedTask: Task = { ...createdTask, completed: true };

      // 1. Create task
      service.addTask(newTaskData).subscribe();
      let req = httpTestingController.expectOne(tasksUrl);
      expect(req.request.method).toBe('POST');
      req.flush(createdTask);

      // 2. Get task by ID
      service.getTaskById(100).subscribe();
      req = httpTestingController.expectOne(`${tasksUrl}/100`);
      expect(req.request.method).toBe('GET');
      req.flush(createdTask);

      // 3. Update task
      service.updateTask(updatedTask).subscribe();
      req = httpTestingController.expectOne(`${tasksUrl}/100`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedTask);

      // 4. Delete task
      service.deleteTask(100).subscribe();
      req = httpTestingController.expectOne(`${tasksUrl}/100`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should handle concurrent requests properly', () => {
      const pageQuery: PageQuery = { page: 1, limit: 10 };
      const sort: Sort<Task> = { sortBy: 'title', direction: 'asc' };
      const mockResponse: ServerPaginatedResponse<Task> = {
        data: [],
        items: 0,
        pages: 0,
        first: 1,
        last: 1,
      };

      // Make multiple concurrent requests
      service.getTasks(pageQuery, sort).subscribe();
      service.getTaskById(1).subscribe();
      service.getTaskById(2).subscribe();

      // Verify all requests are made
      const getTasksReq = httpTestingController.expectOne(req => req.url === tasksUrl);
      const getTask1Req = httpTestingController.expectOne(`${tasksUrl}/1`);
      const getTask2Req = httpTestingController.expectOne(`${tasksUrl}/2`);

      // Respond to all requests
      getTasksReq.flush(mockResponse, { headers: { 'X-Total-Count': '0' } });
      getTask1Req.flush({ id: 1, title: 'Task 1', description: 'Desc 1', completed: false });
      getTask2Req.flush({ id: 2, title: 'Task 2', description: 'Desc 2', completed: true });

      expect().nothing(); // Explicit expectation for concurrent request handling
    });
  });

  // Edge case tests
  describe('Edge Cases', () => {
    it('should handle network timeout scenarios', () => {
      let error: unknown;
      service.getTasks({ page: 1, limit: 10 }, { sortBy: 'title', direction: 'asc' }).subscribe({
        error: e => (error = e),
      });

      // Simulate timeout by flushing with a timeout error
      for (let i = 0; i < 3; i++) {
        const req = httpTestingController.expectOne(req => req.url === tasksUrl);
        req.flush('Timeout', { status: 408, statusText: 'Request Timeout' });
      }

      expect(error).toBeDefined();
    });

    it('should handle empty string responses', () => {
      let completed = false;
      service.deleteTask(1).subscribe({
        complete: () => (completed = true),
      });

      const req = httpTestingController.expectOne(`${tasksUrl}/1`);
      req.flush('', { status: 204, statusText: 'No Content' });

      // Should complete successfully even with empty response
      expect(completed).toBe(true);
    });
  });
});
