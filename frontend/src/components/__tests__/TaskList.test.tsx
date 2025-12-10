import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskList from '../TaskList';
import * as api from '../../services/api';

jest.mock('../../services/api', () => ({
  taskAPI: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  },
}));

// Mock window.confirm
const mockConfirm = jest.fn();
window.confirm = mockConfirm;

describe('TaskList', () => {
  const mockTasks = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Description 1',
      status: 'todo' as const,
      user_id: 'user1',
      assigned_to: null,
      due_date: null,
      priority: 'medium' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Description 2',
      status: 'in-progress' as const,
      user_id: 'user1',
      assigned_to: null,
      due_date: '2024-12-31',
      priority: 'high' as const,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
    (api.taskAPI.getTasks as jest.Mock).mockResolvedValue({
      message: 'Tasks retrieved successfully',
      tasks: mockTasks,
    });
  });

  test('renders loading state initially', () => {
    (api.taskAPI.getTasks as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<TaskList />);
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  test('renders tasks list', async () => {
    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  test('shows empty state when no tasks', async () => {
    (api.taskAPI.getTasks as jest.Mock).mockResolvedValue({
      message: 'Tasks retrieved successfully',
      tasks: [],
    });

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('No tasks found. Create your first task!')).toBeInTheDocument();
    });
  });

  test('shows error message on load failure', async () => {
    const errorMessage = 'Failed to load tasks';
    (api.taskAPI.getTasks as jest.Mock).mockRejectedValue({
      response: { data: { error: errorMessage } },
    });

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('opens form when New Task button is clicked', async () => {
    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    const newTaskButton = screen.getByRole('button', { name: '+ New Task' });
    fireEvent.click(newTaskButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });
  });

  test('creates a new task', async () => {
    (api.taskAPI.createTask as jest.Mock).mockResolvedValue({
      message: 'Task created successfully',
      task: {
        id: '3',
        title: 'New Task',
        description: 'New Description',
        status: 'todo',
        user_id: 'user1',
        assigned_to: null,
        due_date: null,
        priority: 'medium',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      },
    });

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(screen.getByRole('button', { name: '+ New Task' }));

    await waitFor(() => {
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText('Title *'), {
      target: { value: 'New Task' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'New Description' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(api.taskAPI.createTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        status: 'todo',
        priority: 'medium',
        due_date: undefined,
      });
    });

    // Form should close and tasks should reload
    await waitFor(() => {
      expect(api.taskAPI.getTasks).toHaveBeenCalledTimes(2); // Initial load + reload after create
    });
  });

  test('updates task status', async () => {
    (api.taskAPI.updateTask as jest.Mock).mockResolvedValue({
      message: 'Task updated successfully',
      task: { ...mockTasks[0], status: 'done' },
    });

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Find the status select for the first task
    const statusLabels = screen.getAllByText('Status:');
    const statusSelect = statusLabels[0].nextElementSibling as HTMLSelectElement;
    fireEvent.change(statusSelect, { target: { value: 'done' } });

    await waitFor(() => {
      expect(api.taskAPI.updateTask).toHaveBeenCalledWith('1', { status: 'done' });
    });
  });

  test('edits a task', async () => {
    (api.taskAPI.updateTask as jest.Mock).mockResolvedValue({
      message: 'Task updated successfully',
      task: { ...mockTasks[0], title: 'Updated Task' },
    });

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Click edit button
    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
    });

    // Update title
    fireEvent.change(screen.getByLabelText('Title *'), {
      target: { value: 'Updated Task' },
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Update Task' }));

    await waitFor(() => {
      expect(api.taskAPI.updateTask).toHaveBeenCalledWith('1', expect.objectContaining({
        title: 'Updated Task',
      }));
    });
  });

  test('deletes a task', async () => {
    (api.taskAPI.deleteTask as jest.Mock).mockResolvedValue({
      message: 'Task deleted successfully',
    });

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(api.taskAPI.deleteTask).toHaveBeenCalledWith('1');
      expect(api.taskAPI.getTasks).toHaveBeenCalledTimes(2); // Initial load + reload after delete
    });
  });

  test('does not delete task if user cancels confirmation', async () => {
    mockConfirm.mockReturnValue(false);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(api.taskAPI.deleteTask).not.toHaveBeenCalled();
    });
  });

  test('handles delete error', async () => {
    const errorMessage = 'Failed to delete task';
    (api.taskAPI.deleteTask as jest.Mock).mockRejectedValue({
      response: { data: { error: errorMessage } },
    });

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('applies filters when provided', async () => {
    const filters = { status: 'todo' as const };
    render(<TaskList filters={filters} />);

    await waitFor(() => {
      expect(api.taskAPI.getTasks).toHaveBeenCalledWith(filters);
    });
  });

  test('cancels form', async () => {
    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(screen.getByRole('button', { name: '+ New Task' }));

    await waitFor(() => {
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });

    // Cancel form
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
    });
  });
});

