import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CustodianDesk } from '../../src/components/CustodianDesk.js';

const deskData = {
  requests: [{
    id: 'request-1',
    requestNote: 'CPE334 lab demonstration',
    createdAt: '2026-11-12T10:00:00.000Z',
    borrower: { id: 'borrower-1', fullName: 'Student Borrower One', studentOrStaffId: '67070501001', email: 'borrower@cpe.kmutt.ac.th' },
    item: { id: 'item-1', assetTag: 'CPE-OSC-001', name: 'Rigol DS1054Z Oscilloscope', category: 'Measurement', status: 'RESERVED' },
  }],
  activeLoans: [{
    id: 'loan-1',
    checkedOutAt: '2026-11-10T09:00:00.000Z',
    dueDate: '2026-11-17T09:00:00.000Z',
    borrower: { fullName: 'Student Borrower Two', studentOrStaffId: '67070501002' },
    custodian: { fullName: 'CPE Lab Custodian', studentOrStaffId: 'STAFF-001' },
    item: { assetTag: 'CPE-RPI-002', name: 'Raspberry Pi 4 Model B 8GB' },
  }],
};

const okResponse = (data: unknown) => ({ ok: true, json: async () => ({ data }) });

describe('Sprint 1 - Custodian Desk UI', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('UI-01-08: renders the pending triage queue and active loans monitor', async () => {
    global.fetch = vi.fn().mockResolvedValue(okResponse(deskData)) as typeof fetch;
    render(<CustodianDesk token="custodian-token" />);

    expect(await screen.findByRole('heading', { name: /custodian triage & checkout desk/i })).toBeInTheDocument();
    expect(screen.getByText('Student Borrower One')).toBeInTheDocument();
    expect(screen.getByText('67070501001')).toBeInTheDocument();
    expect(screen.getByText('CPE-OSC-001')).toBeInTheDocument();
    expect(screen.getByText('CPE334 lab demonstration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /approve & checkout/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /active loans monitor \(1\)/i })).toBeInTheDocument();
    expect(screen.getByText('CPE Lab Custodian')).toBeInTheDocument();
  });

  it('confirms checkout, disables while submitting, and refreshes the queue on success', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(okResponse(deskData))
      .mockResolvedValueOnce(okResponse({ id: 'loan-2' }))
      .mockResolvedValueOnce(okResponse({ requests: [], activeLoans: deskData.activeLoans }));
    global.fetch = fetchMock as typeof fetch;
    render(<CustodianDesk token="custodian-token" />);

    fireEvent.click(await screen.findByRole('button', { name: /approve & checkout/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/scheduled due date/i)).toBeInTheDocument();
    expect(screen.getByText(/Student Borrower One \(67070501001\)/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/checkout staff notes/i), { target: { value: 'ID verified; power cord included' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm physical checkout/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock.mock.calls[1][0]).toBe('/api/v1/custodian/checkouts');
    expect(JSON.parse((fetchMock.mock.calls[1][1] as RequestInit).body as string)).toEqual({
      requestId: 'request-1',
      checkoutNotes: 'ID verified; power cord included',
    });
    expect(await screen.findByText('Checkout recorded for CPE-OSC-001.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows role errors returned by the custodian endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Access denied: requires CUSTODIAN role.' } }),
    }) as typeof fetch;
    render(<CustodianDesk token="borrower-token" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Access denied: requires CUSTODIAN role.');
  });
});
