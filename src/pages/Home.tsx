// pages/HomePage.js
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Navbar from '../pages/Navbar';

export default function HomePage() {
  const navigate = useNavigate();

  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      navigate('/login'); // Redirect if tokens are not present
    }
  }, [accessToken, refreshToken, navigate]);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="bg-blue-800/80 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Welcome to Eventory</h1>
            <p className="text-xl mb-8 text-white">Inventory Management System</p>
            <a href="#" className="bg-blue-600 font-extrabold text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300">Get Started</a>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Features</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Inventory Management Button */}
              <button
                className="bg-blue-600 text-white text-xl py-4 px-6 rounded-lg hover:bg-blue-700 transition duration-300 w-full"
                onClick={() => navigate('/inventory')}
              >
                Inventory Management
              </button>

              {/* Customers Button */}
              <button
                className="bg-blue-600 text-white text-xl py-4 px-6 rounded-lg hover:bg-blue-700 transition duration-300 w-full"
                onClick={() => navigate('/customers')}
              >
                Customers
              </button>
              <button
                className="bg-blue-600 text-white text-xl py-4 px-6 rounded-lg hover:bg-blue-700 transition duration-300 w-full"
                onClick={() => navigate('/salesreport')}
              >
                Sales Reports
              </button>
              <button
                className="bg-blue-600 text-white text-xl py-4 px-6 rounded-lg hover:bg-blue-700 transition duration-300 w-full"
                onClick={() => navigate('/itemreport')}
              >
                Items Report
              </button>
              <button
                className="bg-blue-600 text-white text-xl py-4 px-6 rounded-lg hover:bg-blue-700 transition duration-300 w-full"
                onClick={() => navigate('/customer-ledger')}
              >
                Customer Ledger
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 ReactApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
