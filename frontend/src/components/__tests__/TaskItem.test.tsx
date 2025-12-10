import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '../TaskItem';
import { Task } from '../../services/api';

describe('TaskItem', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    user_id: 'user1',
    assigned_to: null,
    due_date: '2024-12-31T00:00:00Z',
    priority: 'medium',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task information', () => {
    render(
      <TaskItem
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    const statusSelect = screen.getByRole('combobox', { name: /status/i });
    expect(statusSelect).toHaveValue('todo');
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText(/12\/31\/2024/)).toBeInTheDocument(); // Date format may vary
  });

  test('renders task without description', () => {
    const taskWithoutDescription = { ...mockTask, description: null };
    render(
      <TaskItem
        task={taskWithoutDescription}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  test('renders task without due date', () => {
    const taskWithoutDueDate = { ...mockTask, due_date: null };
    render(
      <TaskItem
        task={taskWithoutDueDate}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  test('calls onDelete when delete button is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  test('calls onStatusChange when status is changed', () => {
    render(
      <TaskItem
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusSelect = screen.getByRole('combobox', { name: /status/i });
    fireEvent.change(statusSelect, { target: { value: 'done' } });

    expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    expect(mockOnStatusChange).toHaveBeenCalledWith('done');
  });

  test('applies correct status class', () => {
    render(
      <TaskItem
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const taskItem = screen.getByTestId('task-item');
    expect(taskItem).toHaveClass('status-todo');
  });

  test('applies correct priority class for high priority', () => {
    const highPriorityTask = { ...mockTask, priority: 'high' as const };
    render(
      <TaskItem
        task={highPriorityTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const priorityElement = screen.getByTestId('task-priority');
    expect(priorityElement).toHaveClass('priority-high');
  });

  test('applies correct priority class for low priority', () => {
    const lowPriorityTask = { ...mockTask, priority: 'low' as const };
    render(
      <TaskItem
        task={lowPriorityTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const priorityElement = screen.getByTestId('task-priority');
    expect(priorityElement).toHaveClass('priority-low');
  });

  test('displays all status options', () => {
    render(
      <TaskItem
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusSelect = screen.getByRole('combobox', { name: /status/i });
    expect(statusSelect).toBeInTheDocument();

    const options = Array.from((statusSelect as HTMLSelectElement).options).map(
      (opt) => opt.textContent
    );
    expect(options).toContain('Todo');
    expect(options).toContain('In Progress');
    expect(options).toContain('Done');
  });

  test('handles in-progress status', () => {
    const inProgressTask = { ...mockTask, status: 'in-progress' as const };
    render(
      <TaskItem
        task={inProgressTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const taskItem = screen.getByTestId('task-item');
    expect(taskItem).toHaveClass('status-in-progress');
    const statusSelect = screen.getByRole('combobox', { name: /status/i });
    expect(statusSelect).toHaveValue('in-progress');
  });

  test('handles done status', () => {
    const doneTask = { ...mockTask, status: 'done' as const };
    render(
      <TaskItem
        task={doneTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const taskItem = screen.getByTestId('task-item');
    expect(taskItem).toHaveClass('status-done');
    const statusSelect = screen.getByRole('combobox', { name: /status/i });
    expect(statusSelect).toHaveValue('done');
  });
});
