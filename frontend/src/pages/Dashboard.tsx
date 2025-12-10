import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import TaskList from '../components/TaskList';
import { TaskFilters } from '../services/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<
    'todo' | 'in-progress' | 'done' | undefined
  >(undefined);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filters: TaskFilters = statusFilter ? { status: statusFilter } : {};

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>TaskManager</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button
            onClick={() => navigate('/profile')}
            className="profile-button"
          >
            Profile
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-filters">
          <button
            className={`filter-btn ${statusFilter === undefined ? 'active' : ''}`}
            onClick={() => setStatusFilter(undefined)}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'todo' ? 'active' : ''}`}
            onClick={() => setStatusFilter('todo')}
          >
            Todo
          </button>
          <button
            className={`filter-btn ${statusFilter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setStatusFilter('in-progress')}
          >
            In Progress
          </button>
          <button
            className={`filter-btn ${statusFilter === 'done' ? 'active' : ''}`}
            onClick={() => setStatusFilter('done')}
          >
            Done
          </button>
        </div>

        <TaskList filters={filters} />
      </main>
    </div>
  );
};

export default Dashboard;
