const request = require('supertest');
const app = require('../index');
const pool = require('../config/database');
const User = require('../models/User');
const Task = require('../models/Task');
const taskService = require('../services/taskService');
const { generateToken } = require('../utils/jwt');
const { randomUUID } = require('crypto');

describe('Task API', () => {
  let authToken;
  let testUser;
  let testUser2;
  let testTask;

  beforeAll(async () => {
    // Create tasks table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'todo',
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
        due_date TIMESTAMP,
        priority VARCHAR(20) DEFAULT 'medium',
        created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
        updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
      )
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS tasks_user_id_index ON tasks(user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS tasks_assigned_to_index ON tasks(assigned_to)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS tasks_status_index ON tasks(status)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS tasks_due_date_index ON tasks(due_date)
    `);
  });

  beforeEach(async () => {
    // Recreate test users before each test (since setup.js truncates users after each test)
    const uniqueEmail = `test-${Date.now()}-${randomUUID()}@example.com`;
    testUser = await User.create({
      email: uniqueEmail,
      password: 'Test1234',
      name: 'Test User',
    });

    // Generate token directly instead of making HTTP request (much faster)
    authToken = generateToken({ userId: testUser.id, email: testUser.email });

    // Create second user for assignment tests
    const uniqueEmail2 = `test2-${Date.now()}-${randomUUID()}@example.com`;
    testUser2 = await User.create({
      email: uniqueEmail2,
      password: 'Test1234',
      name: 'Test User 2',
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testTask) {
      try {
        const task = await Task.findById(testTask.id);
        if (task) {
          await task.delete();
        }
      } catch (error) {
        // Task already deleted
      }
    }
  });

  describe('POST /api/tasks', () => {
    test('should create a task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('task');
      expect(response.body.task.title).toBe(taskData.title);
      expect(response.body.task.description).toBe(taskData.description);
      expect(response.body.task.status).toBe(taskData.status);
      expect(response.body.task.priority).toBe(taskData.priority);

      testTask = { id: response.body.task.id };
    });

    test('should create a task with assigned_to', async () => {
      const taskData = {
        title: 'Assigned Task',
        assigned_to: testUser2.id,
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.task.assigned_to).toBe(testUser2.id);

      // Clean up
      const task = await Task.findById(response.body.task.id);
      if (task) {
        await task.delete();
      }
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Unauthorized Task' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should reject invalid title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should reject invalid status', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test', status: 'invalid-status' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should reject invalid priority', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test', priority: 'invalid-priority' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should reject invalid assigned_to UUID', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test', assigned_to: 'not-a-uuid' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should reject non-existent assigned user', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test', assigned_to: randomUUID() })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Assigned user not found');
    });
  });

  describe('GET /api/tasks', () => {
    test('should get all tasks for authenticated user', async () => {
      // Create a few tasks
      const task1 = await Task.create({
        title: 'Task 1',
        user_id: testUser.id,
      });
      const task2 = await Task.create({
        title: 'Task 2',
        status: 'in-progress',
        user_id: testUser.id,
      });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('tasks');
      expect(Array.isArray(response.body.tasks)).toBe(true);
      expect(response.body.tasks.length).toBeGreaterThanOrEqual(2);

      // Clean up
      await task1.delete();
      await task2.delete();
    });

    test('should filter tasks by status', async () => {
      const task = await Task.create({
        title: 'Done Task',
        status: 'done',
        user_id: testUser.id,
      });

      const response = await request(app)
        .get('/api/tasks?status=done')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks.length).toBeGreaterThanOrEqual(1);
      expect(response.body.tasks.every((t) => t.status === 'done')).toBe(true);

      // Clean up
      await task.delete();
    });

    test('should filter tasks by priority', async () => {
      const task = await Task.create({
        title: 'High Priority Task',
        priority: 'high',
        user_id: testUser.id,
      });

      const response = await request(app)
        .get('/api/tasks?priority=high')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks.length).toBeGreaterThanOrEqual(1);
      expect(response.body.tasks.every((t) => t.priority === 'high')).toBe(
        true
      );

      // Clean up
      await task.delete();
    });

    test('should reject request without authentication', async () => {
      const response = await request(app).get('/api/tasks').expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks/:id', () => {
    test('should get a task by id', async () => {
      const task = await Task.create({
        title: 'Get Task Test',
        user_id: testUser.id,
      });

      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('task');
      expect(response.body.task.id).toBe(task.id);
      expect(response.body.task.title).toBe('Get Task Test');

      // Clean up
      await task.delete();
    });

    test('should return 404 if task not found', async () => {
      const fakeId = randomUUID();
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 403 if user is not authorized', async () => {
      const unauthorizedUser = await User.create({
        email: `unauth-${Date.now()}-${randomUUID()}@example.com`,
        password: 'Test1234',
        name: 'Unauthorized User',
      });

      const unauthorizedToken = generateToken({
        userId: unauthorizedUser.id,
        email: unauthorizedUser.email,
      });

      const task = await Task.create({
        title: 'Unauthorized Task',
        user_id: testUser.id,
      });

      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');

      // Clean up
      await task.delete();
    });

    test('should reject invalid UUID', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('should update a task successfully', async () => {
      const task = await Task.create({
        title: 'Original Title',
        user_id: testUser.id,
      });

      const updates = {
        title: 'Updated Title',
        status: 'in-progress',
        description: 'Updated Description',
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('task');
      expect(response.body.task.title).toBe(updates.title);
      expect(response.body.task.status).toBe(updates.status);
      expect(response.body.task.description).toBe(updates.description);

      // Clean up
      await task.delete();
    });

    test('should return 404 if task not found', async () => {
      const fakeId = randomUUID();
      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 403 if user is not authorized', async () => {
      const unauthorizedUser = await User.create({
        email: `unauth-update-${Date.now()}-${randomUUID()}@example.com`,
        password: 'Test1234',
        name: 'Unauthorized User',
      });

      const loginResponse = await request(app).post('/api/auth/login').send({
        email: unauthorizedUser.email,
        password: 'Test1234',
      });

      const unauthorizedToken = loginResponse.body.token;

      const task = await Task.create({
        title: 'Unauthorized Update',
        user_id: testUser.id,
      });

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .send({ title: 'Hacked' })
        .expect(403);

      expect(response.body).toHaveProperty('error');

      // Clean up
      await task.delete();
    });

    test('should return 403 if non-owner tries to assign task', async () => {
      const task = await Task.create({
        title: 'Assignment Test',
        assigned_to: testUser2.id,
        user_id: testUser.id,
      });

      const assignedUserToken = generateToken({
        userId: testUser2.id,
        email: testUser2.email,
      });

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${assignedUserToken}`)
        .send({ assigned_to: testUser.id })
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Only task owner can assign tasks');

      // Clean up
      await task.delete();
    });

    test('should return 404 if assigned user not found during update', async () => {
      const task = await Task.create({
        title: 'Update Assignment Test',
        user_id: testUser.id,
      });

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ assigned_to: randomUUID() })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Assigned user not found');

      // Clean up
      await task.delete();
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('should delete a task successfully', async () => {
      const task = await Task.create({
        title: 'Delete Me',
        user_id: testUser.id,
      });

      const response = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verify task is deleted
      const foundTask = await Task.findById(task.id);
      expect(foundTask).toBeNull();
    });

    test('should return 404 if task not found', async () => {
      const fakeId = randomUUID();
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 403 if user is not the owner', async () => {
      const unauthorizedUser = await User.create({
        email: `unauth-delete-${Date.now()}-${randomUUID()}@example.com`,
        password: 'Test1234',
        name: 'Unauthorized User',
      });

      const loginResponse = await request(app).post('/api/auth/login').send({
        email: unauthorizedUser.email,
        password: 'Test1234',
      });

      const unauthorizedToken = loginResponse.body.token;

      const task = await Task.create({
        title: 'Unauthorized Delete',
        user_id: testUser.id,
      });

      const response = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');

      // Clean up
      await task.delete();
    });

    test('should return 500 on unexpected error in createTask', async () => {
      const createTaskSpy = jest
        .spyOn(taskService, 'createTask')
        .mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Task' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');

      createTaskSpy.mockRestore();
    });

    test('should return 500 on unexpected error in getTasks', async () => {
      const getTasksSpy = jest
        .spyOn(taskService, 'getTasks')
        .mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');

      getTasksSpy.mockRestore();
    });

    test('should return 500 on unexpected error in getTask', async () => {
      const task = await Task.create({
        title: 'Test Task',
        user_id: testUser.id,
      });

      const getTaskByIdSpy = jest
        .spyOn(taskService, 'getTaskById')
        .mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');

      getTaskByIdSpy.mockRestore();

      // Clean up
      await task.delete();
    });

    test('should return 500 on unexpected error in updateTask', async () => {
      const task = await Task.create({
        title: 'Test Task',
        user_id: testUser.id,
      });

      const updateTaskSpy = jest
        .spyOn(taskService, 'updateTask')
        .mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Task' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');

      updateTaskSpy.mockRestore();

      // Clean up
      await task.delete();
    });

    test('should return 500 on unexpected error in deleteTask', async () => {
      const task = await Task.create({
        title: 'Test Task',
        user_id: testUser.id,
      });

      const deleteTaskSpy = jest
        .spyOn(taskService, 'deleteTask')
        .mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');

      deleteTaskSpy.mockRestore();

      // Clean up
      await task.delete();
    });
  });
});
