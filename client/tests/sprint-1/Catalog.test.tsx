import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Catalog } from '../../src/components/Catalog.js';

const availableItem = {
  id: 'item-1', assetTag: 'CPE-OSC-001', name: 'Rigol Oscilloscope', category: 'Measurement',
  modelNumber: 'DS1054Z', condition: 'GOOD', status: 'AVAILABLE',
};

describe('Sprint 1 - Equipment Catalog UI', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('UI-01-03: renders catalog cards with readable status labels', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [availableItem, { ...availableItem, id: 'item-2', assetTag: 'CPE-RPI-002', name: 'Raspberry Pi', status: 'CHECKED_OUT' }] }),
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
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [availableItem] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { ...availableItem, serialNumber: 'RIGOL-123', description: 'Four-channel digital oscilloscope.' } }) }) as typeof fetch;

    render(<Catalog token="valid-token" />);
    fireEvent.click(await screen.findByRole('button', { name: /view details/i }));

    expect(await screen.findByRole('dialog', { name: /rigol oscilloscope/i })).toBeInTheDocument();
    expect(screen.getByText('RIGOL-123')).toBeInTheDocument();
    expect(screen.getByText('Four-channel digital oscilloscope.')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByText('GOOD')).toBeInTheDocument();
  });

  it('shows a useful message when the catalog request fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: { message: 'Please sign in again.' } }) }) as typeof fetch;

    render(<Catalog token="expired-token" />);

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Please sign in again.'));
  });
});
