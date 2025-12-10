const taskService = require('../services/taskService');
const Task = require('../models/Task');
const User = require('../models/User');
const pool = require('../config/database');
const { randomUUID } = require('crypto');

describe('TaskService', () => {
  let testUser1;
  let testUser2;

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
    const uniqueEmail1 = `test-${Date.now()}-${randomUUID()}@example.com`;
    const uniqueEmail2 = `test-${Date.now()}-${randomUUID()}@example.com`;

    testUser1 = await User.create({
      email: uniqueEmail1,
      password: 'Test1234',
      name: 'Test User 1',
    });

    testUser2 = await User.create({
      email: uniqueEmail2,
      password: 'Test1234',
      name: 'Test User 2',
    });
  });

  afterAll(async () => {
    // Clean up test data (users are already cleaned by setup.js)
    try {
      await pool.query('TRUNCATE TABLE tasks RESTART IDENTITY CASCADE');
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  describe('createTask', () => {
    test('should create a task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000).toISOString(),
      };

      const task = await taskService.createTask(taskData, testUser1.id);

      expect(task).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.status).toBe(taskData.status);
      expect(task.user_id).toBe(testUser1.id);
      expect(task.priority).toBe(taskData.priority);
    });

    test('should create a task with assigned_to', async () => {
      const taskData = {
        title: 'Assigned Task',
        description: 'Assigned Description',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000).toISOString(),
        assigned_to: testUser2.id,
      };

      const task = await taskService.createTask(taskData, testUser1.id);

      expect(task).toBeDefined();
      expect(task.assigned_to).toBe(testUser2.id);

      // Clean up
      await task.delete();
    });

    test('should throw error if assigned user does not exist', async () => {
      const taskData = {
        title: 'Invalid Task',
        description: 'Invalid Task Description',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000).toISOString(),
        assigned_to: randomUUID(),
      };

      await expect(
        taskService.createTask(taskData, testUser1.id)
      ).rejects.toThrow('Assigned user not found');
    });
  });

  describe('getTaskById', () => {
    test('should get a task by id for task owner', async () => {
      const taskData = {
        title: 'Get Task Test',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000).toISOString(),
      };

      const createdTask = await taskService.createTask(taskData, testUser1.id);
      const task = await taskService.getTaskById(createdTask.id, testUser1.id);

      expect(task).toBeDefined();
      expect(task.id).toBe(createdTask.id);
      expect(task.title).toBe(taskData.title);

      // Clean up
      await task.delete();
    });

    test('should get a task by id for assigned user', async () => {
      const taskData = {
        title: 'Assigned Get Task',
        description: 'Assigned Get Task Description',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000).toISOString(),
        assigned_to: testUser2.id,
      };

      const createdTask = await taskService.createTask(taskData, testUser1.id);
      const task = await taskService.getTaskById(createdTask.id, testUser2.id);

      expect(task).toBeDefined();
      expect(task.id).toBe(createdTask.id);

      // Clean up
      await task.delete();
    });

    test('should throw error if task not found', async () => {
      const fakeId = randomUUID();
      await expect(
        taskService.getTaskById(fakeId, testUser1.id)
      ).rejects.toThrow('Task not found');
    });

    test('should throw error if user is not authorized', async () => {
      const taskData = {
        title: 'Unauthorized Task',
        description: 'Unauthorized Task Description',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000).toISOString(),
      };

      const createdTask = await taskService.createTask(taskData, testUser1.id);
      const unauthorizedUser = await User.create({
        email: `unauth-${Date.now()}-${randomUUID()}@example.com`,
        password: 'Test1234',
        name: 'Unauthorized User',
      });

      await expect(
        taskService.getTaskById(createdTask.id, unauthorizedUser.id)
      ).rejects.toThrow('Unauthorized to access this task');

      // Clean up
      await createdTask.delete();
    });
  });

  describe('getTasks', () => {
    test('should get all tasks for a user', async () => {
      // Create multiple tasks
      const task1 = await taskService.createTask(
        {
          title: 'Task 1',
          description: 'Task 1 Description',
          status: 'todo',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000).toISOString(),
        },
        testUser1.id
      );
      const task2 = await taskService.createTask(
        {
          title: 'Task 2',
          description: 'Task 2 Description',
          status: 'in-progress',
          priority: 'high',
          due_date: new Date(Date.now() + 172800000).toISOString(),
        },
        testUser1.id
      );
      const task3 = await taskService.createTask(
        {
          title: 'Task 3',
          description: 'Task 3 Description',
          status: 'todo',
          priority: 'low',
          due_date: new Date(Date.now() + 259200000).toISOString(),
          assigned_to: testUser1.id,
        },
        testUser2.id
      );

      const tasks = await taskService.getTasks(testUser1.id);

      expect(tasks.length).toBeGreaterThanOrEqual(3);
      const taskIds = tasks.map((t) => t.id);
      expect(taskIds).toContain(task1.id);
      expect(taskIds).toContain(task2.id);
      expect(taskIds).toContain(task3.id);

      // Clean up
      await task1.delete();
      await task2.delete();
      await task3.delete();
    });

    test('should filter tasks by status', async () => {
      const task1 = await taskService.createTask(
        {
          title: 'Todo Task',
          description: 'Todo Task Description',
          status: 'todo',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000).toISOString(),
        },
        testUser1.id
      );
      const task2 = await taskService.createTask(
        {
          title: 'Done Task',
          description: 'Done Task Description',
          status: 'done',
          priority: 'high',
          due_date: new Date(Date.now() + 172800000).toISOString(),
        },
        testUser1.id
      );

      const tasks = await taskService.getTasks(testUser1.id, {
        status: 'done',
      });

      expect(tasks.length).toBeGreaterThanOrEqual(1);
      expect(tasks.some((t) => t.id === task2.id)).toBe(true);
      expect(tasks.every((t) => t.status === 'done')).toBe(true);

      // Clean up
      await task1.delete();
      await task2.delete();
    });

    test('should filter tasks by priority', async () => {
      const task1 = await taskService.createTask(
        {
          title: 'High Priority',
          description: 'High Priority Description',
          status: 'todo',
          priority: 'high',
          due_date: new Date(Date.now() + 86400000).toISOString(),
        },
        testUser1.id
      );
      const task2 = await taskService.createTask(
        {
          title: 'Low Priority',
          description: 'Low Priority Description',
          status: 'todo',
          priority: 'low',
          due_date: new Date(Date.now() + 172800000).toISOString(),
        },
        testUser1.id
      );

      const tasks = await taskService.getTasks(testUser1.id, {
        priority: 'high',
      });

      expect(tasks.length).toBeGreaterThanOrEqual(1);
      expect(tasks.some((t) => t.id === task1.id)).toBe(true);
      expect(tasks.every((t) => t.priority === 'high')).toBe(true);

      // Clean up
      await task1.delete();
      await task2.delete();
    });

    test('should filter tasks by assigned_to', async () => {
      const task1 = await taskService.createTask(
        {
          title: 'Assigned Task 1',
          description: 'Assigned Task 1 Description',
          status: 'todo',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000).toISOString(),
          assigned_to: testUser2.id,
        },
        testUser1.id
      );
      const task2 = await taskService.createTask(
        {
          title: 'Assigned Task 2',
          description: 'Assigned Task 2 Description',
          status: 'in-progress',
          priority: 'high',
          due_date: new Date(Date.now() + 172800000).toISOString(),
          assigned_to: testUser2.id,
        },
        testUser1.id
      );
      const task3 = await taskService.createTask(
        {
          title: 'Unassigned Task',
          description: 'Unassigned Task Description',
          status: 'todo',
          priority: 'low',
          due_date: new Date(Date.now() + 259200000).toISOString(),
        },
        testUser1.id
      );

      // Use Task.findByUserId directly to test the assigned_to filter
      const Task = require('../models/Task');
      const tasks = await Task.findByUserId(testUser1.id, {
        assigned_to: testUser2.id,
      });

      expect(tasks.length).toBeGreaterThanOrEqual(2);
      expect(tasks.some((t) => t.id === task1.id)).toBe(true);
      expect(tasks.some((t) => t.id === task2.id)).toBe(true);
      expect(tasks.every((t) => t.assigned_to === testUser2.id)).toBe(true);

      // Clean up
      await task1.delete();
      await task2.delete();
      await task3.delete();
    });
  });

  describe('updateTask', () => {
    test('should update a task successfully', async () => {
      const task = await taskService.createTask(
        {
          title: 'Original Title',
          description: 'Original Description',
          status: 'todo',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000).toISOString(),
        },
        testUser1.id
      );

      const updates = {
        title: 'Updated Title',
        status: 'in-progress',
        description: 'Updated Description',
      };

      const updatedTask = await taskService.updateTask(
        task.id,
        updates,
        testUser1.id
      );

      expect(updatedTask.title).toBe(updates.title);
      expect(updatedTask.status).toBe(updates.status);
      expect(updatedTask.description).toBe(updates.description);

      // Clean up
      await updatedTask.delete();
    });

    test('should allow assigned user to update task', async () => {
      const task = await taskService.createTask(
        {
          title: 'Assigned Task',
          description: 'Assigned Task Description',
          status: 'todo',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000).toISOString(),
          assigned_to: testUser2.id,
        },
        testUser1.id
      );

      const updates = { status: 'done' };
      const updatedTask = await taskService.updateTask(
        task.id,
        updates,
        testUser2.id
      );

      expect(updatedTask.status).toBe('done');

      // Clean up
      await updatedTask.delete();
    });

    test('should throw error if task not found', async () => {
      const fakeId = randomUUID();
      await expect(
        taskService.updateTask(fakeId, { title: 'New Title' }, testUser1.id)
      ).rejects.toThrow('Task not found');
    });

    test('should throw error if user is not authorized', async () => {
      const task = await taskService.createTask(
        {
          title: 'Unauthorized Update',
          description: 'Unauthorized Update Description',
          status: 'todo',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000).toISOString(),
        },
        testUser1.id
      );
      const unauthorizedUser = await User.create({
        email: `unauth-update-${Date.now()}-${randomUUID()}@example.com`,
        password: 'Test1234',
        name: 'Unauthorized User',
      });

      await expect(
        taskService.updateTask(
          task.id,
          { title: 'Hacked' },
          unauthorizedUser.id
        )
      ).rejects.toThrow('Unauthorized to update this task');

      // Clean up
      await task.delete();
    });

    test('should throw error if non-owner tries to assign task', async () => {
      const task = await taskService.createTask(
        {
          title: 'Assignment Test',
          description: 'Assignment Test Description',
          status: 'todo',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000).toISOString(),
          assigned_to: testUser2.id,
        },
        testUser1.id
      );

      await expect(
        taskService.updateTask(
          task.id,
          { assigned_to: testUser1.id },
          testUser2.id
        )
      ).rejects.toThrow('Only task owner can assign tasks');

      // Clean up
      await task.delete();
    });

    test('should successfully update assigned_to when user exists', async () => {
      const task = await taskService.createTask(
        {
          title: 'Assignment Update Test',
          description: 'Assignment Update Test Description',
          status: 'todo',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000).toISOString(),
        },
        testUser1.id
      );

      const updatedTask = await taskService.updateTask(
        task.id,
        { assigned_to: testUser2.id },
        testUser1.id
      );

      expect(updatedTask.assigned_to).toBe(testUser2.id);

      // Clean up
      await updatedTask.delete();
    });

    test('should throw error if assigned user does not exist', async () => {
      const task = await taskService.createTask(
        {
          title: 'Invalid Assignment',
          description: 'Invalid Assignment Description',
          status: 'todo',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000).toISOString(),
        },
        testUser1.id
      );

      await expect(
        taskService.updateTask(
          task.id,
          { assigned_to: randomUUID() },
          testUser1.id
        )
      ).rejects.toThrow('Assigned user not found');

      // Clean up
      await task.delete();
    });
  });

  describe('deleteTask', () => {
    test('should delete a task successfully', async () => {
      const task = await taskService.createTask(
        {
          title: 'Delete Me',
          description: 'Delete Me Description',
          status: 'todo',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000).toISOString(),
        },
        testUser1.id
      );

      const deletedTask = await taskService.deleteTask(task.id, testUser1.id);

      expect(deletedTask).toBeDefined();
      expect(deletedTask.id).toBe(task.id);

      // Verify task is deleted
      const foundTask = await Task.findById(task.id);
      expect(foundTask).toBeNull();
    });

    test('should throw error if task not found', async () => {
      const fakeId = randomUUID();
      await expect(
        taskService.deleteTask(fakeId, testUser1.id)
      ).rejects.toThrow('Task not found');
    });

    test('should throw error if user is not the owner', async () => {
      const task = await taskService.createTask(
        {
          title: 'Unauthorized Delete',
          description: 'Unauthorized Delete Description',
          status: 'todo',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000).toISOString(),
          assigned_to: testUser2.id,
        },
        testUser1.id
      );

      await expect(
        taskService.deleteTask(task.id, testUser2.id)
      ).rejects.toThrow('Unauthorized to delete this task');

      // Clean up
      await task.delete();
    });
  });
});
