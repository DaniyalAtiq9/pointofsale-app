import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import client from '../api/client';

// Create context
export const SalespersonContext = createContext(null);

// Provider component
export const SalespersonProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all salespersons
  const fetchSalespersons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/salesperson');
      setItems(response.data);
    } catch (error) {
      setError(error.response?.data);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create salesperson
  const createSalesperson = useCallback(async (salespersonData) => {
    setLoading(true);
    setError(null);
    try {
      await client.post('/salesperson', salespersonData);
      // Refetch to get complete data with all fields
      const response = await client.get('/salesperson');
      setItems(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create salesperson';
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

  // Update salesperson
  const updateSalesperson = useCallback(async ({ id, data }) => {
    setError(null);
    try {
      const response = await client.put('/salesperson', {
        salespersonId: id,
        data: data
      });
      
      // Check if update was successful (response.data.salesperson exists)
      if (response.data.salesperson) {
        // Success - update local state with the updated salesperson
        setItems(prev => {
          const index = prev.findIndex(item => item.salespersonId === response.data.salesperson.salespersonId);
          if (index !== -1) {
            const newItems = [...prev];
            newItems[index] = response.data.salesperson;
            return newItems;
          }
          return prev;
        });
      } else {
        // Validation error (e.g., "Salesperson code already exists")
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
                          'Failed to update salesperson';
      const errorObj = { 
        message: errorMessage,
        status: error.response?.status || error.status
      };
      setError(errorObj);
      throw errorObj; // Re-throw so component can handle it
    }
  }, []);

  // Delete salesperson
  const deleteSalesperson = useCallback(async (id) => {
    setError(null);
    try {
      await client.delete('/salesperson', { data: { salespersonId: id } });
      setItems(prev => prev.filter(item => item.salespersonId !== id));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to delete salesperson';
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
    fetchSalespersons,
    createSalesperson,
    updateSalesperson,
    deleteSalesperson
  }), [items, loading, error, fetchSalespersons, createSalesperson, updateSalesperson, deleteSalesperson]);

  return (
    <SalespersonContext.Provider value={value}>
      {children}
    </SalespersonContext.Provider>
  );
};

// Custom hook with context validation
export const useSalespersons = () => {
  const context = useContext(SalespersonContext);
  if (!context) {
    throw new Error('useSalespersons must be used within SalespersonProvider');
  }
  return context;
};
