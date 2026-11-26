import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../../src/App.js';

function mockAppFetch(role: 'BORROWER' | 'CUSTODIAN') {
  return vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();

    if (url.includes('/api/v1/auth/me')) {
      return {
        ok: true,
        json: async () => ({
          data: {
            user:
              role === 'BORROWER'
                ? {
                    id: 'borrower-2',
                    email: 'borrower2@cpe.kmutt.ac.th',
                    fullName: 'Student Borrower Two',
                    studentOrStaffId: '67070501002',
                    role: 'BORROWER',
                  }
                : {
                    id: 'custodian-1',
                    email: 'custodian@cpe.kmutt.ac.th',
                    fullName: 'CPE Lab Custodian',
                    studentOrStaffId: 'STAFF-001',
                    role: 'CUSTODIAN',
                  },
          },
        }),
      } as Response;
    }

    if (url.includes('/api/v1/items')) {
      return {
        ok: true,
        json: async () => ({ data: [] }),
      } as Response;
    }

    if (url.includes('/api/v1/requests/my')) {
      return {
        ok: true,
        json: async () => ({
          data: {
            requests: [],
            loans: [],
            activeQuota: { current: 0, maximum: 3 },
          },
        }),
      } as Response;
    }

    if (url.includes('/api/v1/custodian/requests')) {
      return {
        ok: true,
        json: async () => ({
          data: {
            requests: [],
            activeLoans: [],
          },
        }),
      } as Response;
    }

    throw new Error(`Unexpected fetch URL in test: ${url}`);
  }) as typeof fetch;
}

describe('Sprint 1 - Role-Based Route Guard (DEF-EF-01)', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', '/');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('DEF-EF-01: redirects BORROWER from /custodian/desk to / and renders a dismissible unauthorized alert', async () => {
    localStorage.setItem('equipflow_token', 'borrower-token');
    window.history.replaceState(null, '', '/custodian/desk');
    global.fetch = mockAppFetch('BORROWER');

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /department equipment catalog/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /custodian triage & checkout desk/i })
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/unauthorized|restricted to custodian/i);

    fireEvent.click(screen.getByRole('button', { name: /close unauthorized notice/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('DEF-EF-01 regression: allows CUSTODIAN on /custodian/desk without redirecting or showing an unauthorized alert', async () => {
    localStorage.setItem('equipflow_token', 'custodian-token');
    window.history.replaceState(null, '', '/custodian/desk');
    global.fetch = mockAppFetch('CUSTODIAN');

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /custodian triage & checkout desk/i })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe('/custodian/desk');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('DEF-EF-01 regression: does not show an unauthorized alert when BORROWER visits /', async () => {
    localStorage.setItem('equipflow_token', 'borrower-token');
    window.history.replaceState(null, '', '/');
    global.fetch = mockAppFetch('BORROWER');

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /department equipment catalog/i })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
