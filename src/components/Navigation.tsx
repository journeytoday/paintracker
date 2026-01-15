import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <Activity className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-semibold text-slate-900">SymptomTracker</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {!user ? (
              <>
                <Link
                  to="/#about"
                  className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                  Project
                </Link>
                <Link
                  to="/#team"
                  className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                  Team
                </Link>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {!user ? (
              <>
                <Link
                  to="/#about"
                  className="block text-slate-600 hover:text-slate-900 py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Project
                </Link>
                <Link
                  to="/#team"
                  className="block text-slate-600 hover:text-slate-900 py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Team
                </Link>
                <Link
                  to="/login"
                  className="block text-slate-600 hover:text-slate-900 py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block bg-primary hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium text-center transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="block text-slate-600 hover:text-slate-900 py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block text-slate-600 hover:text-slate-900 py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left text-slate-600 hover:text-slate-900 py-2 font-medium"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
