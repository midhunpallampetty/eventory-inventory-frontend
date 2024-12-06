import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // Move this hook outside of the function

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');

  // Handle logout
  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    navigate('/login'); // Redirect to login page
  };

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
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold">Eventory</a>
          <button
            className="md:hidden"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
            <ul className="md:flex space-y-2 md:space-y-0 md:space-x-4">
              <li><a href="#" className="hover:text-blue-200">Home</a></li>
              <li><a href="#" className="hover:text-blue-200">About</a></li>
              <li><a href="#" className="hover:text-blue-200">Services</a></li>
              <li><a href="#" className="hover:text-blue-200">Contact</a></li>
              <li><button className="hover:text-blue-200" onClick={handleLogout}>Logout</button></li>
            </ul>
          </nav>
        </div>
      </header>

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
