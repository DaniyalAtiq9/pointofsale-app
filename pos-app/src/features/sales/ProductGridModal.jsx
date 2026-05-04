import { useState } from 'react';
import { useSales } from '../../contexts/SalesContext';
import { useProducts } from '../../contexts/ProductContext';

export default function ProductGridModal({ products = [], isOpen, onClose }) {
  const { currentSale, addLocalItem, updateLocalItem } = useSales();
  const { items: productItems } = useProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const [clickedProduct, setClickedProduct] = useState(null);
  const itemsPerPage = 10;

  if (!isOpen) return null;

  const handleAddProduct = (product) => {
    // Visual feedback
    setClickedProduct(product.productId);
    setTimeout(() => setClickedProduct(null), 200);

    // Check if product already exists in sale
    const existingItem = currentSale.details.find(
      (item) => item.productId === product.productId
    );

    if (existingItem) {
      // Increase quantity of existing item
      updateLocalItem({
        id: existingItem.saleDetailId,
        quantity: existingItem.quantity + 1,
        discount: existingItem.discount
      });
    } else {
      // Add new item
      addLocalItem({
        saleDetailId: -Math.floor(Math.random() * 1000000000), // Negative number within Int32 range
        productId: product.productId,
        quantity: 1,
        retailPrice: product.retailPrice,
        discount: 0
      });
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop - click to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Center wrapper - don't capture clicks */}
      <div className="relative flex items-center justify-center min-h-screen p-4 pointer-events-none">
        {/* Modal Content - re-enable pointer events */}
        <div 
          className="bg-white rounded-lg shadow-2xl border-2 border-gray-300 p-6 max-w-2xl w-full max-h-[600px] flex flex-col pointer-events-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Select Product</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Compact List */}
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Code</th>
                  <th className="px-4 py-2 text-center align-middle font-medium">Name</th>
                  <th className="px-4 py-2 text-right font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr
                    key={product.productId}
                    onClick={() => handleAddProduct(product)}
                    className={`border-b cursor-pointer transition-all duration-200 ${
                      clickedProduct === product.productId
                        ? 'bg-green-200 scale-[0.98]'
                        : 'hover:bg-blue-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-600">{product.code}</td>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">
                      PKR {product.retailPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({products.length} products)
            </div>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}