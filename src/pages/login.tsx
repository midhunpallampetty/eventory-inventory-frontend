import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import js-cookie for cookie management
import axiosInstance from '../config/axiosInstance'; // Import the axiosInstance

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Check if the tokens exist in cookies
  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');

  // Redirect if tokens are present
  useEffect(() => {
    if (accessToken && refreshToken) {
      navigate('/'); // Redirect to homepage if tokens exist
    }
  }, [accessToken, refreshToken, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axiosInstance.post('/login', { username, password });

      // If login is successful, response contains access and refresh tokens
      const data = response.data;

      // Store tokens in cookies
      Cookies.set('accessToken', data.accessToken, { secure: true, expires: 1 });
      Cookies.set('refreshToken', data.refreshToken, { secure: true, expires: 7 });

      setSuccess('Login successful! Redirecting...');
      console.log('Login successful:', data);

      setTimeout(() => {
        navigate('/'); // Redirect after successful login
      }, 2000);
    } catch (err: any) {
      console.error('Login error:', err.message);
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <a href="/" className="text-2xl font-bold">Eventory</a>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4">
        {/* Only show the login form if no tokens are found */}
        {!accessToken && !refreshToken && (
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md text-center">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-green-600 bg-green-100 p-2 rounded-md text-center">
                  {success}
                </p>
              )}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign In
                </button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Register here
                </a>
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 ReactApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
