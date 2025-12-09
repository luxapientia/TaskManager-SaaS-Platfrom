import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as api from '../../services/api';

// Mock the API
jest.mock('../../services/api', () => ({
  authAPI: {
    getMe: jest.fn(),
  },
}));

const TestComponent: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isAuthenticated ? (
        <div>Authenticated: {user?.email}</div>
      ) : (
        <div>Not authenticated</div>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should show loading initially', async () => {
    localStorage.setItem('token', 'test-token');
    (api.authAPI.getMe as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  test('should show authenticated when user is found', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    (api.authAPI.getMe as jest.Mock).mockResolvedValue({ user: mockUser });
    localStorage.setItem('token', 'test-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Authenticated: test@example.com/)).toBeInTheDocument();
    });
  });

  test('should show not authenticated when no token', async () => {
    (api.authAPI.getMe as jest.Mock).mockRejectedValue(new Error('No token'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    });
  });
});


