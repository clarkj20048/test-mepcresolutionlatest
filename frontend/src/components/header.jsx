import { useEffect, useState } from 'react';
import './header.css';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ResolutionForm from './resolutionForm';

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const authenticated = isAuthenticated();
  const location = useLocation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setIsAddModalOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAddModalOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsAddModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAddModalOpen]);

  return (
    <>
      <header className="header">
        <nav>
          <h1>
            <Link to="/">
              <img src="/mepclogo.png" alt="MEPC Logo" className="header-logo" />
            </Link>
          </h1>

          <div className="header-actions">
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              {authenticated ? (
                <li><Link to="/admindb">Admin Dashboard</Link></li>
              ) : (
                <li><Link to="/login">Admin Login</Link></li>
              )}
            </ul>

            {authenticated && (
              <div className="admin-shortcuts">
                <button
                  type="button"
                  className="header-link-button"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add Resolution
                </button>
                <button type="button" className="header-link-button" onClick={logout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {authenticated && isAddModalOpen && (
        <div className="header-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="header-modal-content" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="header-modal-close"
              onClick={() => setIsAddModalOpen(false)}
              aria-label="Close add resolution form"
            >
              ×
            </button>
            <ResolutionForm
              className="resolution-form-modal"
              title="Add Resolution"
              description="Paste the OneDrive PDF file link below. Once saved, it will appear in the approved resolutions list."
              onSuccess={() => setIsAddModalOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
