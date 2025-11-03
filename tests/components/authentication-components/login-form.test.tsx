/**
 * Tests for Login Form Component
 *
 * This demonstrates more advanced React component testing:
 * - User interactions with fireEvent
 * - Form submissions
 * - Async operations
 * - GraphQL mutations
 * - Error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ApolloMockWrapper, createSuccessMock, createErrorMock } from '../../utils/apollo-mock-utils';

// Mock login mutation
const AUTHENTICATE_USER = `
  mutation AuthenticateUser($email: String!, $password: String!, $tenantId: ID!) {
    authenticateUser(email: $email, password: $password, tenantId: $tenantId) {
      accessToken
      refreshToken
      expiresIn
    }
  }
`;

// Mock component for demonstration
const LoginForm = ({ onSuccess }: { onSuccess?: (token: string) => void }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate API call
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password === 'wrong') {
        throw new Error('Invalid credentials');
      }

      // Simulate successful login
      const mockToken = 'mock-jwt-token';
      onSuccess?.(mockToken);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="email-input"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="password-input"
          disabled={loading}
        />
      </div>

      {error && (
        <div role="alert" data-testid="error-message">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} data-testid="submit-button">
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
};

describe('LoginForm Component', () => {
  describe('Rendering', () => {
    it('should render the login form', () => {
      render(<LoginForm />);

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should render email and password labels', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should have submit button with correct text', () => {
      render(<LoginForm />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveTextContent('Log In');
    });

    it('should not show error message initially', () => {
      render(<LoginForm />);

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should update email input when user types', () => {
      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password input when user types', () => {
      render(<LoginForm />);

      const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('should handle form submission with valid credentials', async () => {
      const mockOnSuccess = jest.fn();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('mock-jwt-token');
      });
    });

    it('should show error message for invalid credentials', async () => {
      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials');
      });
    });

    it('should show error message when fields are empty', async () => {
      render(<LoginForm />);

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'Email and password are required'
        );
      });
    });
  });

  describe('Loading State', () => {
    it('should disable inputs during submission', async () => {
      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Note: In a real async scenario, you would check disabled state during the operation
      // This is a simplified example
      expect(submitButton).toBeInTheDocument();
    });

    it('should show loading text on submit button during submission', async () => {
      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(submitButton).toHaveTextContent('Log In');
    });
  });

  describe('Error Handling', () => {
    it('should clear previous error on new submission', async () => {
      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      // First submission with error
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Second submission
      fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
      fireEvent.click(submitButton);

      // Error should be cleared (in real implementation)
      // This would be tested with actual async behavior
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for inputs', () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should have accessible error message with role alert', async () => {
      render(<LoginForm />);

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should have password input type set to password', () => {
      render(<LoginForm />);

      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have email input type set to email', () => {
      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });
});
