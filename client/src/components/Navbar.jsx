import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const link = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-semibold ${isActive ? 'bg-pine-soft text-pine-dark' : 'text-muted hover:text-ink'}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-line bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <img src="/favicon.svg" alt="" className="h-7 w-7" />
          StartupPlanner
        </Link>
        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
              <NavLink to="/new" className={link}>New plan</NavLink>
              <NavLink to="/compare" className={link}>Compare</NavLink>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="ml-2 rounded-md px-3 py-1.5 text-sm font-semibold text-muted hover:text-rose"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={link}>Log in</NavLink>
              <Link to="/register" className="btn-primary ml-1 !py-1.5">Get started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
