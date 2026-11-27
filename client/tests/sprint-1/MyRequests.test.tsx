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

  it('DEF-EF-02: excludes APPROVED requests from Pending Requests count and renders them under Request History with Approved badge', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          requests: [
            {
              id: 'seed_request_checked_out',
              itemId: 'itm-rpi-002',
              status: 'APPROVED',
              requestNote: 'Seeded approved checkout request',
              createdAt: '2026-11-12T00:00:00.000Z',
              item: {
                id: 'itm-rpi-002',
                assetTag: 'CPE-RPI-002',
                name: 'Raspberry Pi 4 Model B 8GB',
                category: 'Microcontrollers',
                status: 'CHECKED_OUT',
              },
            },
            {
              id: 'cmwuq6uo10001s601j8qbjvk4',
              itemId: 'itm-rpi-001',
              status: 'APPROVED',
              requestNote: 'UAT-TH017-R01-REQ: Raspberry Pi 4B embedded lab verification',
              createdAt: '2026-11-24T13:24:48.000Z',
              item: {
                id: 'itm-rpi-001',
                assetTag: 'CPE-RPI-001',
                name: 'Raspberry Pi 4 Model B 4GB',
                category: 'Microcontrollers',
                status: 'CHECKED_OUT',
              },
            },
          ],
          loans: [
            {
              id: 'cmwuqbdqb0003s601jm1zifq0',
              itemId: 'itm-rpi-001',
              status: 'ACTIVE',
              checkedOutAt: '2026-11-24T13:27:11.170Z',
              dueDate: '2026-12-01T13:27:11.170Z',
              item: {
                id: 'itm-rpi-001',
                assetTag: 'CPE-RPI-001',
                name: 'Raspberry Pi 4 Model B 4GB',
                category: 'Microcontrollers',
                status: 'CHECKED_OUT',
              },
            },
            {
              id: 'seed_loan_checked_out',
              itemId: 'itm-rpi-002',
              status: 'ACTIVE',
              checkedOutAt: '2026-11-12T00:00:00.000Z',
              dueDate: '2026-11-19T00:00:00.000Z',
              item: {
                id: 'itm-rpi-002',
                assetTag: 'CPE-RPI-002',
                name: 'Raspberry Pi 4 Model B 8GB',
                category: 'Microcontrollers',
                status: 'CHECKED_OUT',
              },
            },
          ],
          quota: {
            activeQuota: 2,
            maxQuota: 3,
            pendingRequestsCount: 0,
            activeLoansCount: 2,
          },
        },
      }),
    }) as typeof fetch;

    render(<MyRequests token="valid-token" />);

    expect(await screen.findByText(/2 \/ 3 Items Active/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /active loans \(2\)/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /pending requests \(0\)/i })).toBeInTheDocument();
    expect(screen.getByText('No pending borrowing requests.')).toBeInTheDocument();
    expect(screen.queryByText(/pending approval/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /request history \(2\)/i })).toBeInTheDocument();
    expect(screen.getAllByText(/^approved$/i)).toHaveLength(2);
  });

  it('DEF-EF-02: separates PENDING requests from APPROVED history when both statuses exist', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          requests: [
            {
              id: 'req-pending-1',
              itemId: 'itm-01',
              status: 'PENDING',
              requestNote: 'Awaiting custodian triage',
              createdAt: '2026-11-24T10:00:00.000Z',
              item: {
                id: 'itm-01',
                assetTag: 'CPE-FPGA-001',
                name: 'Terasic DE10-Lite FPGA Board',
                category: 'FPGA',
                status: 'RESERVED',
              },
            },
            {
              id: 'req-approved-1',
              itemId: 'itm-02',
              status: 'APPROVED',
              requestNote: 'Checked out last week',
              createdAt: '2026-11-12T10:00:00.000Z',
              item: {
                id: 'itm-02',
                assetTag: 'CPE-OSC-001',
                name: 'Rigol DS1054Z Digital Oscilloscope',
                category: 'Measurement',
                status: 'CHECKED_OUT',
              },
            },
          ],
          loans: [
            {
              id: 'loan-active-1',
              itemId: 'itm-02',
              status: 'ACTIVE',
              checkedOutAt: '2026-11-12T10:30:00.000Z',
              dueDate: '2026-11-19T10:30:00.000Z',
              item: {
                id: 'itm-02',
                assetTag: 'CPE-OSC-001',
                name: 'Rigol DS1054Z Digital Oscilloscope',
                category: 'Measurement',
                status: 'CHECKED_OUT',
              },
            },
          ],
          quota: {
            activeQuota: 2,
            maxQuota: 3,
            pendingRequestsCount: 1,
            activeLoansCount: 1,
          },
        },
      }),
    }) as typeof fetch;

    render(<MyRequests token="valid-token" />);

    expect(await screen.findByText(/2 \/ 3 Items Active/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /pending requests \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /request history \(1\)/i })).toBeInTheDocument();
    expect(screen.getAllByText(/pending approval/i)).toHaveLength(1);
    expect(screen.getAllByText(/^approved$/i)).toHaveLength(1);
  });
});

