import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders TaskManager heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/TaskManager SaaS/i);
  expect(headingElement).toBeInTheDocument();
});
