import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { ProductProvider } from './contexts/ProductContext';
import { SalespersonProvider } from './contexts/SalespersonContext';
import { SalesProvider } from './contexts/SalesContext';
import ProductsPage from './pages/ProductsPage';
import SalespersonPage from './pages/SalespersonPage';
import PointOfSale from './features/sales/PointOfSale';

import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ProductProvider>
      <SalespersonProvider>
        <SalesProvider>
          <BrowserRouter>
            {/* Toast container MUST be inside app tree */}
            <ToastContainer position="top-right" autoClose={2000} />

            <div className="min-h-screen bg-white flex flex-col">
              {/* Navigation - full width */}
              <nav className="bg-blue-600 w-full">
                <div className="px-6">
                  <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                      <h1 className="text-2xl font-bold text-white">POS</h1>

                      <div className="flex gap-6">
                        <Link to="/" className="text-white hover:text-blue-100 font-medium">
                          Point of Sale
                        </Link>

                        <Link to="/products" className="text-white hover:text-blue-100 font-medium">
                          Products
                        </Link>

                        <Link to="/salesperson" className="text-white hover:text-blue-100 font-medium">
                          Salesperson
                        </Link>
                      </div>
                    </div>
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
              <footer className="bg-blue-600 w-full">
                <div className="px-6">
                  <div className="flex items-center justify-center h-16">
                    <p className="text-white text-sm">© 2026 POS System. All rights reserved.</p>
                  </div>
                </div>
              </footer>
            </div>
          </BrowserRouter>
        </SalesProvider>
      </SalespersonProvider>
    </ProductProvider>
  );
}

export default App;