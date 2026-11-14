import React, { useState } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  studentOrStaffId: string;
  role: 'BORROWER' | 'CUSTODIAN';
}

interface LoginProps {
  onLoginSuccess?: (data: { token: string; user: UserProfile }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error?.message ?? 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      if (onLoginSuccess && data?.data) {
        onLoginSuccess(data.data);
      }
    } catch (_error) {
      setErrorMessage('Network error: Unable to connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (role: 'borrower' | 'custodian') => {
    if (role === 'borrower') {
      setEmail('borrower@cpe.kmutt.ac.th');
      setPassword('Password123!');
    } else {
      setEmail('custodian@cpe.kmutt.ac.th');
      setPassword('Password123!');
    }
    setErrorMessage(null);
  };

  return (
    <div className="login-card shadow-sm mx-auto my-5">
      <div className="login-header text-center">
        <h1 className="h4 fw-bold mb-1">EquipFlow — CPE Hardware Lending</h1>
        <p className="small mb-0 opacity-75">Department of Computer Engineering</p>
      </div>

      <div className="p-4" style={{ backgroundColor: '#ffffff' }}>
        {errorMessage && (
          <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center mb-3" role="alert">
            <span className="me-2">⚠️</span>
            <div>{errorMessage}</div>
            <button
              type="button"
              className="btn-close ms-auto"
              aria-label="Close"
              onClick={() => setErrorMessage(null)}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold small" style={{ color: 'var(--color-deep-ocean)' }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="e.g. borrower@cpe.kmutt.ac.th"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold small" style={{ color: 'var(--color-deep-ocean)' }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2 text-white" role="status" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="credentials-callout mt-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold small">🔑 Local Development Credentials</span>
          </div>
          <div className="small mb-2" style={{ lineHeight: '1.6' }}>
            <div>
              <strong>Borrower:</strong> <code>borrower@cpe.kmutt.ac.th</code> / <code>Password123!</code>
            </div>
            <div>
              <strong>Custodian:</strong> <code>custodian@cpe.kmutt.ac.th</code> / <code>Password123!</code>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-quickfill"
              onClick={() => handleQuickFill('borrower')}
              disabled={isLoading}
            >
              Fill Borrower
            </button>
            <button
              type="button"
              className="btn btn-sm btn-quickfill"
              onClick={() => handleQuickFill('custodian')}
              disabled={isLoading}
            >
              Fill Custodian
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
