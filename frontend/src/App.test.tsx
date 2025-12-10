import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as api from './services/api';

jest.mock('./services/api', () => ({
  authAPI: {
    getMe: jest.fn(),
  },
}));

test('renders app with routing', async () => {
  (api.authAPI.getMe as jest.Mock).mockRejectedValue(
    new Error('Not authenticated')
  );

  render(<App />);

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });
});
