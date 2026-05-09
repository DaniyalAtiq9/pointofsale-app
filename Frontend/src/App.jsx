import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { ProductProvider } from './contexts/ProductContext';
import { SalespersonProvider } from './contexts/SalespersonContext';
import { SalesProvider } from './contexts/SalesContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ProductsPage from './pages/ProductsPage';
import SalespersonPage from './pages/SalespersonPage';
import PointOfSale from './features/sales/PointOfSale';

import 'react-toastify/dist/ReactToastify.css';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
    >
      {/* Sun icon */}
      <span className="text-yellow-300 text-sm select-none" aria-hidden="true">☀️</span>

      {/* Track */}
      <span
        className={`relative inline-block w-11 h-6 rounded-full transition-colors duration-300 ${
          isDark ? 'bg-indigo-500' : 'bg-blue-300'
        }`}
      >
        {/* Thumb */}
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
            isDark ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>

      {/* Moon icon */}
      <span className="text-sm select-none" aria-hidden="true">🌙</span>
    </button>
  );
}

function AppShell() {
  return (
    <BrowserRouter>
      {/* Toast container MUST be inside app tree */}
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col transition-colors duration-300">
        {/* Navigation - full width */}
        <nav className="bg-blue-600 dark:bg-gray-800 w-full transition-colors duration-300">
          <div className="px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <h1 className="text-2xl font-bold text-white">POS</h1>

                <div className="flex gap-6">
                  <Link to="/" className="text-white hover:text-blue-100 dark:hover:text-gray-300 font-medium">
                    Point of Sale
                  </Link>

                  <Link to="/products" className="text-white hover:text-blue-100 dark:hover:text-gray-300 font-medium">
                    Products
                  </Link>

                  <Link to="/salesperson" className="text-white hover:text-blue-100 dark:hover:text-gray-300 font-medium">
                    Salesperson
                  </Link>
                </div>
              </div>

              {/* Dark mode toggle */}
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* Routes */}
        <div className="flex-1 max-w-5xl w-full mx-auto py-4 px-4">
          <Routes>
            <Route path="/" element={<PointOfSale />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/salesperson" element={<SalespersonPage />} />
          </Routes>
        </div>

        {/* Footer - full width */}
        <footer className="bg-blue-600 dark:bg-gray-800 w-full transition-colors duration-300">
          <div className="px-6">
            <div className="flex items-center justify-center h-16">
              <p className="text-white text-sm">© 2026 POS System. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ProductProvider>
        <SalespersonProvider>
          <SalesProvider>
            <AppShell />
          </SalesProvider>
        </SalespersonProvider>
      </ProductProvider>
    </ThemeProvider>
  );
}

export default App;
