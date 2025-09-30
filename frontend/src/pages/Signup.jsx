import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import axios from 'axios';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = (path) => {
    window.location.href = path; // Fixed navigation
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
      const { data: { user, token } } = res; // Adjusted to match backend response
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
          <h2 className="text-base font-medium text-gray-900 mb-4 text-center">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <User className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className={`w-full pl-8 pr-2 py-1.5 text-sm border ${error ? 'border-red-500' : 'border-gray-200'} rounded focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200`}
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={`w-full pl-8 pr-2 py-1.5 text-sm border ${error ? 'border-red-500' : 'border-gray-200'} rounded focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200`}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={`w-full pl-8 pr-8 py-1.5 text-sm border ${error && password !== confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className={`w-full pl-8 pr-8 py-1.5 text-sm border ${error && password !== confirmPassword ? 'border-red-500' : password && password === confirmPassword ? 'border-green-500' : 'border-gray-200'} rounded focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500 text-center animate-fade-in">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50 transition-all duration-150 hover:scale-105"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-3">
            Have an account? <Link to="/login" className="text-purple-500 hover:text-purple-600">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;