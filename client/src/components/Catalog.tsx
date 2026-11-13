import { useEffect, useState } from 'react';

type ItemStatus = 'AVAILABLE' | 'RESERVED' | 'CHECKED_OUT' | 'MAINTENANCE' | 'RETIRED';

interface CatalogItem {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  modelNumber: string | null;
  condition: string;
  status: ItemStatus;
  serialNumber?: string;
  description?: string | null;
  createdAt?: string;
}

interface CatalogProps {
  token: string;
  onNavigateToRequests?: () => void;
}

const statusLabel: Record<ItemStatus, string> = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  CHECKED_OUT: 'CHECKED OUT',
  MAINTENANCE: 'MAINTENANCE',
  RETIRED: 'RETIRED',
};

const statusButtonLabel: Record<ItemStatus, string> = {
  AVAILABLE: 'Request to Borrow',
  RESERVED: 'Reserved',
  CHECKED_OUT: 'Checked Out',
  MAINTENANCE: 'Maintenance',
  RETIRED: 'Retired',
};

async function readError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  return data?.error?.message ?? 'Something went wrong. Please try again.';
}

export function Catalog({ token }: CatalogProps) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [activeQuota, setActiveQuota] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Request submission state
  const [requestNote, setRequestNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    // Fetch catalog items
    fetch('/api/v1/items', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error(await readError(response));
        return response.json();
      })
      .then((body) => {
        if (active) setItems(body.data ?? []);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load the equipment catalog.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    // Concurrently fetch borrower's active quota (graceful fallback if endpoint not mocked)
    fetch('/api/v1/requests/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res && res.ok) {
          const body = await res.json();
          const current = body?.data?.activeQuota?.current ?? body?.data?.quota?.activeQuota;
          if (active && typeof current === 'number') {
            setActiveQuota(current);
          }
        }
      })
      .catch(() => {
        // Non-blocking quota fetch
      });

    return () => {
      active = false;
    };
  }, [token]);

  const showDetails = async (item: CatalogItem) => {
    setSelectedItem(item);
    setIsDetailLoading(true);
    setDetailError(null);
    setSubmitError(null);
    setSubmitSuccess(null);
    setRequestNote('');

    try {
      const response = await fetch(`/api/v1/items/${encodeURIComponent(item.id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await readError(response));
      const body = await response.json();
      setSelectedItem(body.data);
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to load equipment details.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleConfirmRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || selectedItem.status !== 'AVAILABLE' || activeQuota >= 3) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await fetch('/api/v1/requests', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: selectedItem.id,
          requestNote: requestNote.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      // Success: update item status to RESERVED and increment active quota
      const updatedStatus: ItemStatus = 'RESERVED';
      setItems((prev) =>
        prev.map((it) => (it.id === selectedItem.id ? { ...it, status: updatedStatus } : it))
      );
      setSelectedItem((prev) => (prev ? { ...prev, status: updatedStatus } : null));
      setActiveQuota((prev) => Math.min(3, prev + 1));
      setSubmitSuccess(`Request submitted successfully! ${selectedItem.assetTag} is now reserved.`);
      setRequestNote('');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit borrow request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="catalog-title">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div className="catalog-heading">
          <p className="eyebrow mb-2">EQUIPFLOW INVENTORY</p>
          <h1 id="catalog-title" className="h2 fw-bold mb-2">Department Equipment Catalog</h1>
          <p className="mb-0 catalog-muted">Browse equipment, specifications, and current availability.</p>
        </div>
        <div className="d-flex align-items-center">
          <span
            className="badge"
            style={{
              backgroundColor: 'var(--color-matcha-green)',
              color: 'var(--color-deep-ocean)',
              fontSize: '0.95rem',
              fontWeight: 700,
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
            }}
          >
            📋 My Active Items: <strong>{activeQuota} / 3</strong>
          </span>
        </div>
      </div>

      {isLoading && <p role="status" className="catalog-panel">Loading equipment catalog…</p>}
      {error && <p role="alert" className="catalog-alert">{error}</p>}
      {!isLoading && !error && items.length === 0 && (
        <p className="catalog-panel">No equipment is currently listed in the catalog.</p>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="catalog-grid">
          {items.map((item) => {
            const isAvailable = item.status === 'AVAILABLE';
            const isQuotaFull = activeQuota >= 3;
            const canRequest = isAvailable && !isQuotaFull;

            return (
              <article className="equipment-card" key={item.id}>
                <div className="equipment-card-header">
                  <span className="asset-tag">{item.assetTag}</span>
                  <span className={`status-badge status-${item.status.toLowerCase()}`}>
                    <span aria-hidden="true">
                      {item.status === 'AVAILABLE'
                        ? '●'
                        : item.status === 'RESERVED'
                          ? '◉'
                          : item.status === 'CHECKED_OUT'
                            ? '●'
                            : '▲'}
                    </span>
                    {statusLabel[item.status]}
                  </span>
                </div>
                <div className="equipment-card-body">
                  <h2 className="h5 fw-bold">{item.name}</h2>
                  <p className="catalog-muted mb-3">{item.category}</p>
                  <dl className="equipment-summary mb-0">
                    <div>
                      <dt>Model</dt>
                      <dd>{item.modelNumber || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt>Condition</dt>
                      <dd>{item.condition.replaceAll('_', ' ')}</dd>
                    </div>
                  </dl>
                </div>
                <div className="equipment-card-footer d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-details flex-grow-1"
                    onClick={() => void showDetails(item)}
                  >
                    View Details<span className="visually-hidden"> for {item.name}</span>
                  </button>
                  <button
                    type="button"
                    className={`btn flex-grow-1 ${canRequest ? 'btn-primary' : 'btn-request-disabled'}`}
                    disabled={!canRequest}
                    onClick={() => void showDetails(item)}
                    aria-label={`Request to borrow ${item.name}`}
                  >
                    {isQuotaFull
                      ? 'Limit Reached (3/3)'
                      : !isAvailable
                        ? statusButtonLabel[item.status]
                        : 'Request to Borrow'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <div
          className="catalog-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) setSelectedItem(null);
          }}
        >
          <section
            className="catalog-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="equipment-detail-title"
          >
            <header className="catalog-modal-header">
              <div>
                <p className="small modal-asset-tag mb-1">{selectedItem.assetTag}</p>
                <h2 id="equipment-detail-title" className="h5 fw-bold mb-0">
                  {selectedItem.name}
                </h2>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                aria-label="Close details"
                disabled={isSubmitting}
                onClick={() => setSelectedItem(null)}
              >
                ×
              </button>
            </header>
            <div className="catalog-modal-body">
              {isDetailLoading && <p role="status">Loading equipment details…</p>}
              {detailError && <p role="alert" className="catalog-alert">{detailError}</p>}
              {!isDetailLoading && !detailError && (
                <>
                  <p>{selectedItem.description || 'No technical description is available.'}</p>
                  <dl className="detail-list mb-3">
                    <div>
                      <dt>Category</dt>
                      <dd>{selectedItem.category}</dd>
                    </div>
                    <div>
                      <dt>Model</dt>
                      <dd>{selectedItem.modelNumber || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt>Serial number</dt>
                      <dd>{selectedItem.serialNumber || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt>Condition</dt>
                      <dd>{selectedItem.condition.replaceAll('_', ' ')}</dd>
                    </div>
                    <div>
                      <dt>Availability</dt>
                      <dd>
                        <span className={`status-badge status-${selectedItem.status.toLowerCase()}`}>
                          {statusLabel[selectedItem.status]}
                        </span>
                      </dd>
                    </div>
                  </dl>

                  {submitSuccess && (
                    <div className="alert alert-success mb-3" role="status">
                      {submitSuccess}
                    </div>
                  )}

                  {/* Request Form if Available and Quota not full */}
                  {selectedItem.status === 'AVAILABLE' && activeQuota < 3 && !submitSuccess && (
                    <form onSubmit={handleConfirmRequest} className="mt-3 pt-3 border-top">
                      <div className="mb-3">
                        <label
                          htmlFor="request-note"
                          className="form-label fw-semibold"
                          style={{ color: 'var(--color-deep-ocean)' }}
                        >
                          Academic Purpose / Course Project Notes (optional)
                        </label>
                        <textarea
                          id="request-note"
                          className="form-control"
                          rows={2}
                          maxLength={250}
                          placeholder="e.g. Needed for CPE334 Lab demonstration (max 250 characters)"
                          value={requestNote}
                          onChange={(e) => setRequestNote(e.target.value)}
                          disabled={isSubmitting}
                        />
                        <div className="text-end text-muted small mt-1">
                          {requestNote.length} / 250
                        </div>
                      </div>

                      {submitError && (
                        <div className="catalog-alert mb-3" role="alert">
                          {submitError}
                        </div>
                      )}

                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={isSubmitting}
                          onClick={() => setSelectedItem(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting request…' : 'Confirm Request'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Informational notices when not available or quota exceeded */}
                  {!submitSuccess && selectedItem.status === 'AVAILABLE' && activeQuota >= 3 && (
                    <div className="catalog-alert mt-3" role="alert">
                      Active quota limit reached (3/3). You cannot submit additional borrow requests until existing items are returned.
                    </div>
                  )}

                  {!submitSuccess && selectedItem.status !== 'AVAILABLE' && (
                    <div className="catalog-panel mt-3">
                      This item is currently {statusLabel[selectedItem.status].toLowerCase()} and cannot be requested.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Standard Close button when not in active request form */}
            {(selectedItem.status !== 'AVAILABLE' || activeQuota >= 3) && (
              <footer className="catalog-modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </button>
              </footer>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
