import React from 'react';
import { Task } from '../services/api';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (status: 'todo' | 'in-progress' | 'done') => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'todo':
        return 'status-todo';
      case 'in-progress':
        return 'status-in-progress';
      case 'done':
        return 'status-done';
      default:
        return '';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`task-item ${getStatusClass(task.status)}`} data-testid="task-item">
      <div className="task-item-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <button className="btn btn-sm btn-secondary" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(task.id)}>
            Delete
          </button>
        </div>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-meta">
        <div className="task-status">
          <label>Status:</label>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as 'todo' | 'in-progress' | 'done')}
            className={`status-select ${getStatusClass(task.status)}`}
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className={`task-priority ${getPriorityClass(task.priority)}`} data-testid="task-priority">
          <span className="priority-label">Priority:</span>
          <span className="priority-value">{task.priority}</span>
        </div>

        {task.due_date && (
          <div className="task-due-date">
            <span className="due-date-label">Due:</span>
            <span className="due-date-value">{formatDate(task.due_date)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;

