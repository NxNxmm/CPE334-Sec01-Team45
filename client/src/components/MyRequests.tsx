import { useEffect, useState } from 'react';

interface EquipmentSummary {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  modelNumber?: string | null;
  status: string;
}

interface BorrowRequest {
  id: string;
  itemId: string;
  status: string;
  requestNote: string | null;
  createdAt: string;
  item: EquipmentSummary;
}

interface ActiveLoan {
  id: string;
  itemId: string;
  status: string;
  checkedOutAt: string;
  dueDate: string;
  item: EquipmentSummary;
}

interface MyRequestsResponse {
  requests: BorrowRequest[];
  loans: ActiveLoan[];
  activeLoans?: ActiveLoan[];
  quota?: {
    activeQuota: number;
    maxQuota: number;
    pendingRequestsCount: number;
    activeLoansCount: number;
  };
  activeQuota?: {
    current: number;
    maximum: number;
  };
}

interface MyRequestsProps {
  token: string;
  onNavigateToCatalog?: () => void;
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function MyRequests({ token, onNavigateToCatalog }: MyRequestsProps) {
  const [data, setData] = useState<MyRequestsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    fetch('/api/v1/requests/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error?.message ?? 'Failed to load requests and loans.');
        }
        return response.json();
      })
      .then((body) => {
        if (active) setData(body.data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load personal requests.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  if (isLoading) {
    return (
      <div className="catalog-panel text-center py-5" role="status">
        <div className="spinner-border text-primary mb-2" role="status">
          <span className="visually-hidden">Loading your requests…</span>
        </div>
        <p className="mb-0 text-muted">Loading your requests and active loans…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-alert" role="alert">
        {error}
      </div>
    );
  }

  const requests = data?.requests ?? [];
  const loans = data?.loans ?? data?.activeLoans ?? [];
  const activeCount = data?.activeQuota?.current ?? data?.quota?.activeQuota ?? (requests.filter(r => r.status === 'PENDING').length + loans.length);
  const maxQuota = data?.activeQuota?.maximum ?? data?.quota?.maxQuota ?? 3;
  const isAllEmpty = requests.length === 0 && loans.length === 0;

  return (
    <section aria-labelledby="my-requests-heading">
      <div className="mb-4">
        <p className="eyebrow mb-2">BORROWER PORTAL</p>
        <h1 id="my-requests-heading" className="h2 fw-bold mb-2">My Requests & Active Loans</h1>
        <p className="mb-0 catalog-muted">
          Track personal equipment reservations, active checkouts, and return deadlines.
        </p>
      </div>

      {/* Quota Progress Banner */}
      <div className="quota-banner mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--color-deep-ocean)' }}>
            Personal Borrowing Quota
          </h2>
          <span
            className="badge"
            style={{
              backgroundColor: 'var(--color-matcha-green)',
              color: 'var(--color-deep-ocean)',
              fontSize: '0.9rem',
              fontWeight: 700,
            }}
          >
            {activeCount} / {maxQuota} Items Active
          </span>
        </div>
        <p className="text-muted small mb-2">
          Combined active quota: active loans and pending requests cannot exceed {maxQuota} items.
        </p>
        <div
          className="progress-quota"
          role="progressbar"
          aria-valuenow={activeCount}
          aria-valuemin={0}
          aria-valuemax={maxQuota}
          aria-label="Active borrowing quota progress"
        >
          <div
            className="progress-quota-fill"
            style={{ width: `${Math.min(100, (activeCount / maxQuota) * 100)}%` }}
          />
        </div>
      </div>

      {isAllEmpty ? (
        <div className="empty-requests-card text-center p-5 mb-4">
          <p className="h5 mb-3" style={{ color: 'var(--color-deep-ocean)' }}>
            You have no active loans or requests. Browse the catalog to borrow equipment.
          </p>
          {onNavigateToCatalog && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNavigateToCatalog}
            >
              Browse Equipment Catalog
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Active Loans Section */}
          <section className="mb-5" aria-labelledby="active-loans-subheading">
            <h2 id="active-loans-subheading" className="h5 fw-bold mb-3" style={{ color: 'var(--color-deep-ocean)' }}>
              Active Loans ({loans.length})
            </h2>
            {loans.length === 0 ? (
              <p className="catalog-panel mb-0">No active physical loans.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-equipflow align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Asset Tag</th>
                      <th scope="col">Equipment Name</th>
                      <th scope="col">Checked Out At</th>
                      <th scope="col">Due Date</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan.id}>
                        <td className="fw-bold">{loan.item.assetTag}</td>
                        <td>{loan.item.name}</td>
                        <td>{formatDate(loan.checkedOutAt)}</td>
                        <td className="fw-bold">
                          🕒 <time dateTime={loan.dueDate}>{formatDate(loan.dueDate)}</time>
                        </td>
                        <td>
                          <span className="status-badge status-checked_out">
                            <span aria-hidden="true">●</span> Active Loan
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Pending Requests Section */}
          <section className="mb-4" aria-labelledby="pending-requests-subheading">
            <h2 id="pending-requests-subheading" className="h5 fw-bold mb-3" style={{ color: 'var(--color-deep-ocean)' }}>
              Pending Requests ({requests.length})
            </h2>
            {requests.length === 0 ? (
              <p className="catalog-panel mb-0">No pending borrowing requests.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-equipflow align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Asset Tag</th>
                      <th scope="col">Equipment Name</th>
                      <th scope="col">Requested Date</th>
                      <th scope="col">Purpose Notes</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td className="fw-bold">{req.item.assetTag}</td>
                        <td>{req.item.name}</td>
                        <td>{formatDate(req.createdAt)}</td>
                        <td>{req.requestNote || '—'}</td>
                        <td>
                          <span className="status-badge status-reserved">
                            <span aria-hidden="true">⏳</span> Pending Approval
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}

