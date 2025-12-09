import { authAPI } from '../api';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
  post: jest.fn(),
  get: jest.fn(),
}));

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('authAPI', () => {
    test('logout clears localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('refreshToken', 'test-refresh');

      authAPI.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });
});
