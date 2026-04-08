import './header.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const authenticated = isAuthenticated();

  return (
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
              <Link to="/admindb#add-resolution" className="admin-add-button">
                Add Resolution
              </Link>
              <button type="button" className="admin-logout-button" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
