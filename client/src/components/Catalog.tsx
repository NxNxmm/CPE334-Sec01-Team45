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
}

const statusLabel: Record<ItemStatus, string> = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  CHECKED_OUT: 'CHECKED OUT',
  MAINTENANCE: 'MAINTENANCE',
  RETIRED: 'RETIRED',
};

async function readError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  return data?.error?.message ?? 'Something went wrong. Please try again.';
}

export function Catalog({ token }: CatalogProps) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    fetch('/api/v1/items', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error(await readError(response));
        return response.json();
      })
      .then((body) => { if (active) setItems(body.data ?? []); })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load the equipment catalog.');
      })
      .finally(() => { if (active) setIsLoading(false); });

    return () => { active = false; };
  }, [token]);

  const showDetails = async (item: CatalogItem) => {
    setSelectedItem(item);
    setIsDetailLoading(true);
    setDetailError(null);
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

  return (
    <section aria-labelledby="catalog-title">
      <div className="catalog-heading mb-4">
        <p className="eyebrow mb-2">EQUIPFLOW INVENTORY</p>
        <h1 id="catalog-title" className="h2 fw-bold mb-2">Department Equipment Catalog</h1>
        <p className="mb-0 catalog-muted">Browse equipment, specifications, and current availability.</p>
      </div>

      {isLoading && <p role="status" className="catalog-panel">Loading equipment catalog…</p>}
      {error && <p role="alert" className="catalog-alert">{error}</p>}
      {!isLoading && !error && items.length === 0 && (
        <p className="catalog-panel">No equipment is currently listed in the catalog.</p>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="catalog-grid">
          {items.map((item) => (
            <article className="equipment-card" key={item.id}>
              <div className="equipment-card-header">
                <span className="asset-tag">{item.assetTag}</span>
                <span className={`status-badge status-${item.status.toLowerCase()}`}>
                  <span aria-hidden="true">{item.status === 'AVAILABLE' ? '●' : item.status === 'RESERVED' ? '◉' : item.status === 'CHECKED_OUT' ? '●' : '▲'}</span>
                  {statusLabel[item.status]}
                </span>
              </div>
              <div className="equipment-card-body">
                <h2 className="h5 fw-bold">{item.name}</h2>
                <p className="catalog-muted mb-3">{item.category}</p>
                <dl className="equipment-summary mb-0">
                  <div><dt>Model</dt><dd>{item.modelNumber || 'Not specified'}</dd></div>
                  <div><dt>Condition</dt><dd>{item.condition.replaceAll('_', ' ')}</dd></div>
                </dl>
              </div>
              <div className="equipment-card-footer">
                <button type="button" className="btn btn-details" onClick={() => void showDetails(item)}>
                  View Details<span className="visually-hidden"> for {item.name}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="catalog-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedItem(null); }}>
          <section className="catalog-modal" role="dialog" aria-modal="true" aria-labelledby="equipment-detail-title">
            <header className="catalog-modal-header">
              <div>
                <p className="small modal-asset-tag mb-1">{selectedItem.assetTag}</p>
                <h2 id="equipment-detail-title" className="h5 fw-bold mb-0">{selectedItem.name}</h2>
              </div>
              <button type="button" className="btn-modal-close" aria-label="Close details" onClick={() => setSelectedItem(null)}>×</button>
            </header>
            <div className="catalog-modal-body">
              {isDetailLoading && <p role="status">Loading equipment details…</p>}
              {detailError && <p role="alert" className="catalog-alert">{detailError}</p>}
              {!isDetailLoading && !detailError && (
                <>
                  <p>{selectedItem.description || 'No technical description is available.'}</p>
                  <dl className="detail-list mb-0">
                    <div><dt>Category</dt><dd>{selectedItem.category}</dd></div>
                    <div><dt>Model</dt><dd>{selectedItem.modelNumber || 'Not specified'}</dd></div>
                    <div><dt>Serial number</dt><dd>{selectedItem.serialNumber || 'Not specified'}</dd></div>
                    <div><dt>Condition</dt><dd>{selectedItem.condition.replaceAll('_', ' ')}</dd></div>
                    <div><dt>Availability</dt><dd><span className={`status-badge status-${selectedItem.status.toLowerCase()}`}>{statusLabel[selectedItem.status]}</span></dd></div>
                  </dl>
                </>
              )}
            </div>
            <footer className="catalog-modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setSelectedItem(null)}>Close</button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
