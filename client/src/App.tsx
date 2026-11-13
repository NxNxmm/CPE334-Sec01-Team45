import { useState, useEffect } from 'react';
import { Login, UserProfile } from './components/Login.js';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('equipflow_token'));
  const [isValidating, setIsValidating] = useState<boolean>(Boolean(token));

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          localStorage.removeItem('equipflow_token');
          setToken(null);
          setUser(null);
        }
      } catch (_err) {
        // Network error during validation
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleLoginSuccess = (data: { token: string; user: UserProfile }) => {
    localStorage.setItem('equipflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (_err) {
        // Ignore network errors on logout
      }
    }
    localStorage.removeItem('equipflow_token');
    setToken(null);
    setUser(null);
  };

  if (isValidating) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: 'var(--color-vanilla-milk)' }}>
        <div className="spinner-border spinner-deep-ocean" role="status">
          <span className="visually-hidden">Validating session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
        <Login onLoginSuccess={handleLoginSuccess} />
      </main>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--color-vanilla-milk)' }}>
      {/* Global Navbar */}
      <header className="navbar navbar-expand navbar-equipflow px-4 py-3 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold mb-0 h1">EquipFlow</span>
          <div className="d-flex align-items-center gap-3 ms-auto">
            <span className="text-white-50 small d-none d-sm-inline">Signed in as:</span>
            <span className="fw-semibold text-white">{user.fullName}</span>
            <span className="badge-matcha">{user.role}</span>
            <button
              type="button"
              className="btn btn-sm btn-nav-signout ms-2"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container py-5 flex-grow-1">
        <div className="dashboard-card shadow-sm p-4 mb-4">
          <h2 className="h4 fw-bold mb-2" style={{ color: 'var(--color-deep-ocean)' }}>
            Welcome back, {user.fullName}!
          </h2>
          <p className="mb-3" style={{ color: 'var(--color-deep-ocean)', opacity: 0.85 }}>
            Academic ID: <code>{user.studentOrStaffId}</code> &bull; Email: <code>{user.email}</code>
          </p>
          <div className="dashboard-banner p-4">
            <h3 className="h6 fw-bold mb-2">🎉 Authentication & Role Identity (Feature F-01) Active</h3>
            <p className="mb-0 small" style={{ lineHeight: '1.6' }}>
              Your session is securely verified with JWT Bearer authentication and per-token server-side revocation.
              Equipment catalog browsing and borrowing request workflows will be enabled in upcoming sprint issues.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
