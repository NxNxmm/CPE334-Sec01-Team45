import { FormEvent, useEffect, useState } from 'react';

interface DeskRequest {
  id: string;
  requestNote: string | null;
  createdAt: string;
  borrower: { id: string; fullName: string; studentOrStaffId: string; email: string };
  item: { id: string; assetTag: string; name: string; category: string; status: string };
}

interface ActiveLoan {
  id: string;
  checkedOutAt: string;
  dueDate: string;
  borrower: { fullName: string; studentOrStaffId: string };
  custodian: { fullName: string; studentOrStaffId: string };
  item: { assetTag: string; name: string };
}

interface DeskData {
  requests: DeskRequest[];
  activeLoans: ActiveLoan[];
}

interface CustodianDeskProps {
  token: string;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function readError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null);
  return body?.error?.message ?? 'The request could not be completed. Please try again.';
}

export function CustodianDesk({ token }: CustodianDeskProps) {
  const [data, setData] = useState<DeskData>({ requests: [], activeLoans: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<DeskRequest | null>(null);
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    fetch('/api/v1/custodian/requests', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error(await readError(response));
        return response.json();
      })
      .then((body) => {
        if (active) setData(body.data ?? { requests: [], activeLoans: [] });
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load the custodian desk.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [token, refreshVersion]);

  const openCheckout = (entry: DeskRequest) => {
    setSelectedRequest(entry);
    setCheckoutNotes('');
    setSubmitError(null);
  };

  const confirmCheckout = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedRequest || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch('/api/v1/custodian/checkouts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: selectedRequest.id, checkoutNotes: checkoutNotes.trim() || undefined }),
      });
      if (!response.ok) throw new Error(await readError(response));
      setSuccessMessage(`Checkout recorded for ${selectedRequest.item.assetTag}.`);
      setSelectedRequest(null);
      setRefreshVersion((version) => version + 1);
    } catch (cause: unknown) {
      setSubmitError(cause instanceof Error ? cause.message : 'Unable to record this checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scheduledDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <section aria-labelledby="custodian-desk-title">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <p className="eyebrow mb-2">CUSTODIAN PORTAL</p>
          <h1 id="custodian-desk-title" className="h2 fw-bold mb-2">Custodian Triage &amp; Checkout Desk</h1>
          <p className="catalog-muted mb-0">Review student requests, verify physical custody, and record checkouts.</p>
        </div>
        <button type="button" className="btn btn-details" onClick={() => setRefreshVersion((version) => version + 1)} disabled={isLoading}>
          ↻ Refresh Queue
        </button>
      </div>

      {successMessage && <p className="custodian-success" role="status">{successMessage}</p>}
      {error && <p className="catalog-alert" role="alert">{error}</p>}
      {isLoading && <p className="catalog-panel" role="status">Loading custodian queue…</p>}

      {!isLoading && !error && (
        <>
          <section className="mb-5" aria-labelledby="triage-queue-title">
            <h2 id="triage-queue-title" className="h5 fw-bold mb-3">Pending Requests ({data.requests.length})</h2>
            {data.requests.length === 0 ? (
              <p className="catalog-panel">There are no pending requests to review.</p>
            ) : (
              <div className="table-responsive table-equipflow">
                <table className="table align-middle mb-0">
                  <thead><tr>
                    <th scope="col">Requested Time</th><th scope="col">Student Name</th><th scope="col">Student ID</th>
                    <th scope="col">Asset Tag</th><th scope="col">Equipment Name</th><th scope="col">Notes</th><th scope="col">Action</th>
                  </tr></thead>
                  <tbody>{data.requests.map((entry) => (
                    <tr key={entry.id}>
                      <td><time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time></td>
                      <td>{entry.borrower.fullName}</td>
                      <td><code className="student-id-badge">{entry.borrower.studentOrStaffId}</code></td>
                      <td className="fw-bold">{entry.item.assetTag}</td>
                      <td>{entry.item.name}</td>
                      <td>{entry.requestNote || '—'}</td>
                      <td><button type="button" className="btn btn-primary text-nowrap" onClick={() => openCheckout(entry)}>Approve &amp; Checkout</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </section>

          <section aria-labelledby="department-active-loans-title">
            <h2 id="department-active-loans-title" className="h5 fw-bold mb-3">Active Loans Monitor ({data.activeLoans.length})</h2>
            {data.activeLoans.length === 0 ? (
              <p className="catalog-panel">There are no active loans.</p>
            ) : (
              <div className="table-responsive table-equipflow">
                <table className="table align-middle mb-0">
                  <thead><tr>
                    <th scope="col">Asset Tag</th><th scope="col">Equipment Name</th><th scope="col">Borrower Name</th>
                    <th scope="col">Checked Out At</th><th scope="col">Due Date</th><th scope="col">Accountable Custodian</th>
                  </tr></thead>
                  <tbody>{data.activeLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td className="fw-bold">{loan.item.assetTag}</td><td>{loan.item.name}</td><td>{loan.borrower.fullName}</td>
                      <td><time dateTime={loan.checkedOutAt}>{formatDate(loan.checkedOutAt)}</time></td>
                      <td className="fw-bold"><time dateTime={loan.dueDate}>{formatDate(loan.dueDate)}</time></td>
                      <td>{loan.custodian.fullName}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {selectedRequest && (
        <div className="catalog-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSubmitting) setSelectedRequest(null); }}>
          <section className="catalog-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-modal-title">
            <header className="catalog-modal-header">
              <h2 id="checkout-modal-title" className="h5 fw-bold mb-0">Confirm Physical Checkout</h2>
              <button type="button" className="btn-modal-close" aria-label="Close checkout" disabled={isSubmitting} onClick={() => setSelectedRequest(null)}>×</button>
            </header>
            <form onSubmit={confirmCheckout}>
              <div className="catalog-modal-body">
                <dl className="detail-list mb-3">
                  <div><dt>Borrower</dt><dd>{selectedRequest.borrower.fullName} ({selectedRequest.borrower.studentOrStaffId})</dd></div>
                  <div><dt>Equipment</dt><dd>{selectedRequest.item.assetTag} ({selectedRequest.item.name})</dd></div>
                </dl>
                <p className="checkout-due-callout mb-3">📅 Scheduled Due Date: <strong><time dateTime={scheduledDueDate.toISOString()}>{formatDate(scheduledDueDate.toISOString())}</time></strong> (7 days from checkout)</p>
                <label htmlFor="checkout-notes" className="form-label fw-semibold">Checkout Staff Notes <span className="fw-normal">(optional)</span></label>
                <textarea id="checkout-notes" className="form-control" rows={3} maxLength={500} value={checkoutNotes} onChange={(event) => setCheckoutNotes(event.target.value)} placeholder="e.g. Verified student ID card; handed over with power cord." disabled={isSubmitting} />
                {submitError && <p className="catalog-alert mt-3 mb-0" role="alert">{submitError}</p>}
              </div>
              <footer className="checkout-modal-footer">
                <button type="button" className="btn btn-details" disabled={isSubmitting} onClick={() => setSelectedRequest(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Processing checkout…' : 'Confirm Physical Checkout'}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
