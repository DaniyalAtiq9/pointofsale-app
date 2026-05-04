import { useState } from 'react';
import { useSales } from '../../contexts/SalesContext';
import { useProducts } from '../../contexts/ProductContext';

export default function ProductAutoComplete({ products = [] }) {
  const { addLocalItem } = useSales();
  const { items: productItems } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term.toLowerCase()) ||
          p.code.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  };

  const handleSelectProduct = (product) => {
    addLocalItem({
      saleDetailId: -Math.floor(Math.random() * 1000000000), // Negative number within Int32 range
      productId: product.productId,
      quantity: 1,
      retailPrice: product.retailPrice,
      discount: 0
    });
    setSearchTerm('');
    setFilteredProducts([]);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search by product name or code..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full px-3 py-2 border-0 text-sm focus:outline-none"
      />

      {filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b max-h-48 overflow-y-auto z-10">
          {filteredProducts.map((product) => (
            <button
              key={product.productId}
              onClick={() => handleSelectProduct(product)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0"
            >
              <div className="font-medium">{product.name}</div>
              <div className="text-xs text-gray-500">
                {product.code} - PKR {product.retailPrice}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}