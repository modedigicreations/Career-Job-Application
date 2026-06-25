import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 mb-6">
        <span className="text-4xl font-bold text-brand-600">404</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-gray-500 max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link to="/dashboard" className="btn-primary">
          <Home className="h-4 w-4 mr-2" /> Go to Dashboard
        </Link>
        <button onClick={() => window.history.back()} className="btn-secondary">
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </button>
      </div>
    </div>
  );
}
