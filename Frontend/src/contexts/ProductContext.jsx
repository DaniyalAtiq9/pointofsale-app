import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import client from '../api/client';

// Create context
export const ProductContext = createContext(null);

// Provider component
export const ProductProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/product');
      setItems(response.data);
    } catch (error) {
      setError(error.response?.data);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create product
  const createProduct = useCallback(async (productData) => {
    setLoading(true);
    setError(null);
    try {
      await client.post('/product', productData);
      // Refetch to get complete data with all fields
      const response = await client.get('/product');
      setItems(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create product';
      const errorObj = { 
        message: errorMessage,
        status: error.response?.status 
      };
      setError(errorObj);
      throw errorObj; // Re-throw so component can handle it
    } finally {
      setLoading(false);
    }
  }, []);

  // Update product
  const updateProduct = useCallback(async ({ id, data }) => {
    setError(null);
    try {
      const response = await client.put('/product', {
        productId: id,
        data: data
      });
      
      // Check if update was successful (response.data.product exists)
      if (response.data.product) {
        // Success - update local state with the updated product
        setItems(prev => {
          const index = prev.findIndex(item => item.productId === response.data.product.productId);
          if (index !== -1) {
            const newItems = [...prev];
            newItems[index] = response.data.product;
            return newItems;
          }
          return prev;
        });
      } else {
        // Validation error (e.g., "Product code already exists")
        const errorObj = { 
          message: response.data.message,
          status: 200 // Still 200 OK, but with error message
        };
        setError(errorObj);
        throw errorObj;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message ||
                          'Failed to update product';
      const errorObj = { 
        message: errorMessage,
        status: error.response?.status || error.status
      };
      setError(errorObj);
      throw errorObj; // Re-throw so component can handle it
    }
  }, []);

  // Delete product
  const deleteProduct = useCallback(async (id) => {
    setError(null);
    try {
      await client.delete('/product', { data: { productId: id } });
      setItems(prev => prev.filter(item => item.productId !== id));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to delete product';
      const errorObj = { 
        message: errorMessage,
        status: error.response?.status 
      };
      setError(errorObj);
      throw errorObj; // Re-throw so component can handle it
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    items,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }), [items, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook with context validation
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};
