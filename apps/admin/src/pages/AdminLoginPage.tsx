import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@vietcraft.com');
  const [password, setPassword] = useState('AdminSecurePassword123!');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lotus-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-lotus-forest flex items-center justify-center text-lotus-sand shadow-md">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
            <path d="M12 2C10.5 6 7 9 4 10c3 1 6.5 4 8 8 1.5-4 5-7 8-8-3-1-6.5-4-8-8z" />
          </svg>
        </div>
        <h2 className="mt-4 font-serif text-3xl font-bold text-lotus-forest">VietCraft CMS</h2>
        <p className="mt-1 text-xs text-lotus-charcoal/60">
          Editorial & Affiliate Content Administration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-lotus-sand/40">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vietcraft.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-lotus-forest"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-lotus-forest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-lotus-forest hover:bg-lotus-forest-dark text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in to Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
            Protected administrative portal. Authorized personnel only.
          </div>
        </div>
      </div>
    </div>
  );
};
