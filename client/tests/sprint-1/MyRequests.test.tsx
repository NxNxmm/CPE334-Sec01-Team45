import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MyRequests } from '../../src/components/MyRequests.js';

const mockRequestsData = {
  requests: [
    {
      id: 'req-01',
      itemId: 'itm-01',
      status: 'PENDING',
      requestNote: 'CPE334 Project Verification',
      createdAt: '2026-11-12T10:00:00.000Z',
      item: {
        id: 'itm-01',
        assetTag: 'CPE-FPGA-001',
        name: 'Terasic DE10-Lite FPGA Board',
        category: 'Development Boards',
        status: 'RESERVED',
      },
    },
  ],
  loans: [
    {
      id: 'loan-01',
      itemId: 'itm-02',
      status: 'ACTIVE',
      checkedOutAt: '2026-11-10T09:00:00.000Z',
      dueDate: '2026-11-17T09:00:00.000Z',
      item: {
        id: 'itm-02',
        assetTag: 'CPE-OSC-001',
        name: 'Rigol DS1054Z Digital Oscilloscope',
        category: 'Measurement',
        status: 'CHECKED_OUT',
      },
    },
  ],
  activeQuota: {
    current: 2,
    maximum: 3,
  },
};

describe('Sprint 1 - My Requests & Loans UI', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('UI-01-07: renders active loans and pending requests with 7-day due date', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRequestsData }),
    }) as typeof fetch;

    render(<MyRequests token="valid-token" />);

    // Quota Banner
    expect(await screen.findByText('Personal Borrowing Quota')).toBeInTheDocument();
    expect(screen.getByText(/2 \/ 3 Items Active/i)).toBeInTheDocument();

    // Active Loans Section
    expect(screen.getByRole('heading', { name: /active loans \(1\)/i })).toBeInTheDocument();
    expect(screen.getByText('CPE-OSC-001')).toBeInTheDocument();
    expect(screen.getByText('Rigol DS1054Z Digital Oscilloscope')).toBeInTheDocument();
    expect(screen.getByText('Active Loan')).toBeInTheDocument();
    // Due date (17 Nov 2026, 7 days from checkout)
    expect(screen.getByText(/17 Nov 2026/i)).toBeInTheDocument();

    // Pending Requests Section
    expect(screen.getByRole('heading', { name: /pending requests \(1\)/i })).toBeInTheDocument();
    expect(screen.getByText('CPE-FPGA-001')).toBeInTheDocument();
    expect(screen.getByText('Terasic DE10-Lite FPGA Board')).toBeInTheDocument();
    expect(screen.getByText('CPE334 Project Verification')).toBeInTheDocument();
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith('/api/v1/requests/my', {
      headers: { Authorization: 'Bearer valid-token' },
    });
  });

  it('renders illustrative empty state when borrower has no active loans or requests', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          requests: [],
          loans: [],
          activeQuota: { current: 0, maximum: 3 },
        },
      }),
    }) as typeof fetch;

    const navigateMock = vi.fn();
    render(<MyRequests token="valid-token" onNavigateToCatalog={navigateMock} />);

    expect(
      await screen.findByText(/you have no active loans or requests/i)
    ).toBeInTheDocument();

    const browseBtn = screen.getByRole('button', { name: /browse equipment catalog/i });
    expect(browseBtn).toBeInTheDocument();
    fireEvent.click(browseBtn);
    expect(navigateMock).toHaveBeenCalledTimes(1);
  });

  it('renders error alert when fetching requests fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Session expired. Please log in again.' } }),
    }) as typeof fetch;

    render(<MyRequests token="invalid-token" />);

    expect(
      await screen.findByText('Session expired. Please log in again.')
    ).toBeInTheDocument();
  });
});

