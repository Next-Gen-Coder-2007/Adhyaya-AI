import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <img src={logo} alt="logo" />
          </div>
          <h1 className="text-3xl font-bold text-white">Adhyaya AI</h1>
          <p className="text-gray-400 mt-2">Create your account to start learning</p>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-yellow-400" />
              </div>
              <input
                type="text"
                placeholder="Full name"
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-yellow-800/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-yellow-400" />
              </div>
              <input
                type="email"
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-yellow-800/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-yellow-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 bg-gray-900/50 border border-yellow-800/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Eye className="h-5 w-5 text-yellow-400" />
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-yellow-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                className="w-full pl-10 pr-10 py-3 bg-gray-900/50 border border-yellow-800/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Eye className="h-5 w-5 text-yellow-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
                className="w-4 h-4 bg-gray-900 border border-yellow-800 rounded text-yellow-500 focus:ring-yellow-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-yellow-400 hover:text-yellow-300">
                  Terms and Conditions
                </Link>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={!termsAccepted}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-opacity shadow-lg cursor-pointer ${
              termsAccepted
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black hover:opacity-90'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Create Account
          </button>
        </form>

        <div className="my-6 flex items-center before:content-[''] before:flex-1 before:border-t before:border-gray-700 after:content-[''] after:flex-1 after:border-t after:border-gray-700">
          <p className="text-gray-500 px-4 text-sm">or</p>
        </div>

        <div className="space-y-4">
          <button className="w-full py-3 px-4 bg-gray-900/50 border border-yellow-800/30 rounded-xl text-white font-medium hover:bg-gray-800/50 transition-colors flex items-center justify-center space-x-2 cursor-pointer">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign up with Google</span>
          </button>
        </div>

        <p className="text-center text-gray-400 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;