import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 px-4">
        <div className="space-y-2">
          <h1 className="text-7xl font-bold text-gray-300">404</h1>
          <p className="text-2xl font-semibold text-gray-800">Page Not Found</p>
          <p className="text-gray-600 max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
