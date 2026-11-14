import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../../src/components/Login.js';

describe('Sprint 1 - Login UI Component Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('UI-01-01: Login form rendering, credentials input & submit', () => {
    it('renders email/password fields, credentials callout, and submit button', () => {
      render(<Login />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/local development credentials/i)).toBeInTheDocument();
    });

    it('shows loading state and disables inputs when submitting', async () => {
      // Mock delayed fetch response
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    data: {
                      token: 'mock-jwt-token',
                      user: {
                        id: '1',
                        email: 'borrower@cpe.kmutt.ac.th',
                        fullName: 'Student Borrower One',
                        studentOrStaffId: '67070501001',
                        role: 'BORROWER',
                      },
                    },
                  }),
                }),
              100
            )
          )
      );

      const handleSuccess = vi.fn();
      render(<Login onLoginSuccess={handleSuccess} />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'borrower@cpe.kmutt.ac.th' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Button should transition to loading state
      expect(screen.getByRole('button', { name: /signing in\.\.\./i })).toBeDisabled();

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            token: 'mock-jwt-token',
            user: expect.objectContaining({ email: 'borrower@cpe.kmutt.ac.th' }),
          })
        );
      });
    });
  });

  describe('UI-01-02: Invalid credentials feedback banner display on 401', () => {
    it('displays dismissible error banner when login API returns 401', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        }),
      });

      render(<Login />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'wrong@cpe.kmutt.ac.th' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'WrongPass!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/invalid email or password\./i)).toBeInTheDocument();
      });

      // Test dismiss button
      const closeButton = screen.getByLabelText(/close/i);
      fireEvent.click(closeButton);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});

