import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/auth-store';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo/Home */}
            <div className="flex items-center">
              <NavLink
                to="/"
                className="text-xl font-bold text-primary-600"
              >
                Food Store
              </NavLink>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium ${
                        isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:text-primary-600'
                      }`
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium ${
                        isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:text-primary-600'
                      }`
                    }
                  >
                    Profile
                  </NavLink>
                  <span className="text-sm text-gray-600">
                    {user.first_name} ({user.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium ${
                        isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:text-primary-600'
                      }`
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium ${
                        isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:text-primary-600'
                      }`
                    }
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2026 Food Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
