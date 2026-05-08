import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/auth-store';
import { getNavItemsForRole } from '@/shared/config/navigation';
import type { UserRole } from '@/shared/config/roles';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = getNavItemsForRole(user?.role as UserRole | undefined | null);

  const handleLogout = async () => {
    await logout();
    // ProtectedRoute wrapper will redirect to /login automatically
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex justify-between h-16">
            {/* Logo/Home */}
            <div className="flex items-center">
              <NavLink
                to="/"
                className="text-xl font-bold text-primary-600"
                onClick={closeMobileMenu}
              >
                Food Store
              </NavLink>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {user ? (
                <>
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-700 hover:text-primary-600'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {user.first_name} ({user.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-700 hover:text-primary-600'
                      }`
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-700 hover:text-primary-600'
                      }`
                    }
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile hamburger button */}
            <div className="flex items-center md:hidden">
              {user && (
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {mobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {user && mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-gray-200"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-primary-600'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-600">
                  {user.first_name} ({user.role})
                </div>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            &copy; 2026 Food Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
