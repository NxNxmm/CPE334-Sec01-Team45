import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Catalog } from '../../src/components/Catalog.js';

const availableItem = {
  id: 'item-1',
  assetTag: 'CPE-OSC-001',
  name: 'Rigol Oscilloscope',
  category: 'Measurement',
  modelNumber: 'DS1054Z',
  condition: 'GOOD',
  status: 'AVAILABLE' as const,
};

const checkedOutItem = {
  id: 'item-2',
  assetTag: 'CPE-RPI-002',
  name: 'Raspberry Pi',
  category: 'Microcontrollers',
  modelNumber: '4B',
  condition: 'EXCELLENT',
  status: 'CHECKED_OUT' as const,
};

describe('Sprint 1 - Equipment Catalog UI', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('UI-01-03: renders catalog cards with readable status labels', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/api/v1/items') {
        return {
          ok: true,
          json: async () => ({ data: [availableItem, checkedOutItem] }),
        };
      }
      if (url === '/api/v1/requests/my') {
        return {
          ok: true,
          json: async () => ({ data: { activeQuota: { current: 0, maximum: 3 } } }),
        };
      }
      return { ok: false, json: async () => ({}) };
    }) as typeof fetch;

    render(<Catalog token="valid-token" />);

    expect(await screen.findByText('Rigol Oscilloscope')).toBeInTheDocument();
    expect(screen.getByText('CPE-OSC-001')).toBeInTheDocument();
    expect(screen.getByText('AVAILABLE')).toBeInTheDocument();
    expect(screen.getByText('CHECKED OUT')).toBeInTheDocument();
    expect(screen.getByText('Raspberry Pi')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/items', {
      headers: { Authorization: 'Bearer valid-token' },
    });
  });

  it('UI-01-04: opens an accessible detail dialog with serial number and condition', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/api/v1/items') {
        return { ok: true, json: async () => ({ data: [availableItem] }) };
      }
      if (url.startsWith('/api/v1/items/')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              ...availableItem,
              serialNumber: 'RIGOL-123',
              description: 'Four-channel digital oscilloscope.',
            },
          }),
        };
      }
      if (url === '/api/v1/requests/my') {
        return { ok: true, json: async () => ({ data: { activeQuota: { current: 0, maximum: 3 } } }) };
      }
      return { ok: false, json: async () => ({}) };
    }) as typeof fetch;

    render(<Catalog token="valid-token" />);
    fireEvent.click(await screen.findByRole('button', { name: /view details/i }));

    expect(await screen.findByRole('dialog', { name: /rigol oscilloscope/i })).toBeInTheDocument();
    expect(screen.getByText('RIGOL-123')).toBeInTheDocument();
    expect(screen.getByText('Four-channel digital oscilloscope.')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByText('GOOD')).toBeInTheDocument();
  });

  it('UI-01-05: disables request button when item is unavailable', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/api/v1/items') {
        return { ok: true, json: async () => ({ data: [availableItem, checkedOutItem] }) };
      }
      if (url === '/api/v1/requests/my') {
        return { ok: true, json: async () => ({ data: { activeQuota: { current: 1, maximum: 3 } } }) };
      }
      return { ok: false, json: async () => ({}) };
    }) as typeof fetch;

    render(<Catalog token="valid-token" />);

    // Available item has enabled request button
    const reqAvailableBtn = await screen.findByRole('button', {
      name: /request to borrow rigol oscilloscope/i,
    });
    expect(reqAvailableBtn).toBeEnabled();
    expect(reqAvailableBtn).toHaveTextContent('Request to Borrow');

    // Checked out item has disabled request button with explicit status
    const reqUnavailableBtn = screen.getByRole('button', {
      name: /request to borrow raspberry pi/i,
    });
    expect(reqUnavailableBtn).toBeDisabled();
    expect(reqUnavailableBtn).toHaveTextContent('Checked Out');
  });

  it('UI-01-06: disables request button when borrower active quota = 3', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/api/v1/items') {
        return { ok: true, json: async () => ({ data: [availableItem] }) };
      }
      if (url === '/api/v1/requests/my') {
        return {
          ok: true,
          json: async () => ({
            data: {
              activeQuota: { current: 3, maximum: 3 },
              quota: { activeQuota: 3, maxQuota: 3 },
            },
          }),
        };
      }
      return { ok: false, json: async () => ({}) };
    }) as typeof fetch;

    render(<Catalog token="valid-token" />);

    // Quota pill displays 3 / 3
    expect(await screen.findByText(/3 \/ 3/)).toBeInTheDocument();

    // Available item is disabled due to quota reached
    const requestBtn = screen.getByRole('button', {
      name: /request to borrow rigol oscilloscope/i,
    });
    expect(requestBtn).toBeDisabled();
    expect(requestBtn).toHaveTextContent('Limit Reached (3/3)');
  });

  it('submits borrow request with optional purpose notes and updates state', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
      if (url === '/api/v1/items') {
        return { ok: true, json: async () => ({ data: [availableItem] }) };
      }
      if (url.startsWith('/api/v1/items/')) {
        return { ok: true, json: async () => ({ data: { ...availableItem } }) };
      }
      if (url === '/api/v1/requests/my') {
        return { ok: true, json: async () => ({ data: { activeQuota: { current: 1, maximum: 3 } } }) };
      }
      if (url === '/api/v1/requests' && options?.method === 'POST') {
        return {
          ok: true,
          json: async () => ({
            data: {
              id: 'req-new',
              itemId: 'item-1',
              status: 'PENDING',
              requestNote: 'CPE334 Lab demonstration',
            },
          }),
        };
      }
      return { ok: false, json: async () => ({}) };
    }) as typeof fetch;

    render(<Catalog token="valid-token" />);

    // Open detail & request modal
    fireEvent.click(await screen.findByRole('button', { name: /view details/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Type optional academic purpose note
    const noteInput = screen.getByLabelText(/academic purpose/i);
    fireEvent.change(noteInput, { target: { value: 'CPE334 Lab demonstration' } });

    // Submit request
    fireEvent.click(screen.getByRole('button', { name: /confirm request/i }));

    // Success confirmation appears
    expect(await screen.findByText(/request submitted successfully/i)).toBeInTheDocument();

    // Global fetch was called with POST /api/v1/requests
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/requests',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer valid-token' }),
        body: JSON.stringify({
          itemId: 'item-1',
          requestNote: 'CPE334 Lab demonstration',
        }),
      })
    );
  });

  it('shows a useful message when the catalog request fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Please sign in again.' } }),
    }) as typeof fetch;

    render(<Catalog token="expired-token" />);

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Please sign in again.'));
  });
});
