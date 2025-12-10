import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from '../TaskForm';
import { Task } from '../../services/api';

describe('TaskForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const mockTask: Task = {
    id: '1',
    title: 'Existing Task',
    description: 'Existing Description',
    status: 'in-progress',
    user_id: 'user1',
    assigned_to: null,
    due_date: '2024-12-31T00:00:00Z',
    priority: 'high',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  test('renders create form when no task provided', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('renders edit form when task provided', () => {
    render(<TaskForm task={mockTask} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /status/i })).toHaveValue('in-progress');
    expect(screen.getByRole('combobox', { name: /priority/i })).toHaveValue('high');
    expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Task' })).toBeInTheDocument();
  });

  test('submits form with correct data for new task', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Title *'), {
      target: { value: 'New Task' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'New Description' },
    });
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'done' },
    });
    fireEvent.change(screen.getByLabelText('Priority'), {
      target: { value: 'low' },
    });
    fireEvent.change(screen.getByLabelText('Due Date'), {
      target: { value: '2024-12-31' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        status: 'done',
        priority: 'low',
        due_date: '2024-12-31',
      });
    });
  });

  test('submits form with correct data for edit', async () => {
    render(<TaskForm task={mockTask} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Title *'), {
      target: { value: 'Updated Task' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Update Task' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Updated Task',
        description: 'Existing Description',
        status: 'in-progress',
        priority: 'high',
        due_date: '2024-12-31',
      });
    });
  });

  test('handles empty description', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Title *'), {
      target: { value: 'Task Without Description' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: '' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Task Without Description',
        description: undefined,
        status: 'todo',
        priority: 'medium',
        due_date: undefined,
      });
    });
  });

  test('handles empty due date', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Title *'), {
      target: { value: 'Task Without Due Date' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Task Without Due Date',
        description: undefined,
        status: 'todo',
        priority: 'medium',
        due_date: undefined,
      });
    });
  });

  test('shows error message on submit failure', async () => {
    const errorMessage = 'Failed to save task';
    mockOnSubmit.mockRejectedValue(new Error(errorMessage));

    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Title *'), {
      target: { value: 'Test Task' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('disables form fields while loading', async () => {
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Title *'), {
      target: { value: 'Test Task' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Title *')).toBeDisabled();
    });
    await waitFor(() => {
      expect(screen.getByLabelText('Description')).toBeDisabled();
    });
    await waitFor(() => {
      expect(screen.getByLabelText('Status')).toBeDisabled();
    });
    await waitFor(() => {
      expect(screen.getByLabelText('Priority')).toBeDisabled();
    });
    await waitFor(() => {
      expect(screen.getByLabelText('Due Date')).toBeDisabled();
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    });
  });

  test('requires title field', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText('Title *');
    expect(titleInput).toBeRequired();
  });

  test('updates form when task prop changes', () => {
    const { rerender } = render(
      <TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByLabelText('Title *')).toHaveValue('');

    rerender(<TaskForm task={mockTask} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
  });
});

