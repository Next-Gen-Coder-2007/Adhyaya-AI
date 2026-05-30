import { Link } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="w-24 h-24 bg-gradient-to-r from-yellow-500/20 to-yellow-700/20 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-yellow-800/30">
          <AlertCircle className="w-12 h-12 text-yellow-400" />
        </div>

        <h1 className="text-7xl sm:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/"
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center px-6 py-3 border-2 border-yellow-600 text-yellow-400 rounded-xl font-semibold hover:bg-yellow-900/20 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-16">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
          <p className="text-xm text-gray-600 mt-4">
            Error 404: Resource Not Found
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;