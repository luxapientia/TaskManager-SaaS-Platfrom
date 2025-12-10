import React, { useState, useEffect, useCallback } from 'react';
import { taskAPI, Task, TaskFilters } from '../services/api';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import './TaskList.css';

interface TaskListProps {
  filters?: TaskFilters;
}

const TaskList: React.FC<TaskListProps> = ({ filters }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskAPI.getTasks(filters);
      setTasks(response.tasks);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (taskData: any) => {
    try {
      await taskAPI.createTask(taskData);
      setShowForm(false);
      loadTasks();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (id: string, taskData: any) => {
    try {
      await taskAPI.updateTask(id, taskData);
      setEditingTask(null);
      loadTasks();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      await taskAPI.deleteTask(id);
      loadTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  if (loading) {
    return <div className="task-list-loading">Loading tasks...</div>;
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>Tasks</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
        >
          + New Task
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? (data) => handleUpdateTask(editingTask.id, data) : handleCreateTask}
          onCancel={handleCancelForm}
        />
      )}

      {tasks.length === 0 ? (
        <div className="no-tasks">No tasks found. Create your first task!</div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={(status) => handleUpdateTask(task.id, { status })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;

