import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import client from '../api/client';

// Create context
export const SalesContext = createContext(null);

/* =========================
   SAFE EMPTY STATE FACTORY
========================= */

const createEmptySale = () => ({
  saleId: null,
  salespersonId: null,
  total: 0,
  comments: '',
  details: [],
});

// Provider component
export const SalesProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [currentSale, setCurrentSale] = useState(createEmptySale());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  /* =========================
     API OPERATIONS
  ========================= */

  // Fetch all sales
  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/salesmaster');
      // Sort sales by editDate in descending order (most recently edited first)
      const sales = Array.isArray(res.data)
        ? res.data.sort((a, b) => {
            const dateA = new Date(a.editDate || a.saleDate);
            const dateB = new Date(b.editDate || b.saleDate);
            return dateB - dateA;
          })
        : [];
      setItems(sales);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch sales';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sale by ID
  // NOTE: This function makes TWO API calls by design:
  // 1. POST /salesmaster/get - Fetches sale master (header) data (total, salesperson, comments, dates)
  // 2. POST /salesmaster/salesdetails/list - Fetches sale details (line items with products, quantities, prices)
  // 
  // This is intentional and follows the master-detail relationship pattern where:
  // - The backend has separate services (ISalesMasterService and ISalesDetailService)
  // - The data is stored in separate database tables (SalesMaster and SalesDetail)
  // - This separation allows for independent CRUD operations on master and details
  // 
  // Both calls use the same payload { saleId } because both need to know which sale to fetch.
  const fetchSaleById = useCallback(async (saleId) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the sale master (header information)
      const saleRes = await client.post('/salesmaster/get', { saleId });
      const sale = saleRes.data;
      
      // Fetch the sale details (line items)
      const detailsRes = await client.post('/salesmaster/salesdetails/list', { saleId });
      const details = detailsRes.data;
      
      // Combine and validate
      const combinedSale = {
        saleId: sale.saleId,
        salespersonId: sale.salespersonId ?? null,
        total: sale.total ?? 0,
        comments: sale.comments ?? '',
        details: Array.isArray(details)
          ? details.map(d => {
              // Validate and sanitize quantity and discount with reasonable limits
              const quantity = Math.max(1, Math.min(999999, Number(d.quantity) || 1));
              const discount = Math.max(0, Number(d.discount) || 0);
              const retailPrice = Number(d.retailPrice) || 0;
              const lineTotal = retailPrice * quantity - discount;
              
              return {
                saleDetailId: d.saleDetailId,
                productId: d.productId,
                retailPrice,
                quantity,
                discount,
                lineTotal,
              };
            })
          : [],
      };
      
      setCurrentSale(combinedSale);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch sale';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create sale master
  const createSaleMaster = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await client.post('/salesmaster', data);
      const saleId = res.data.id || res.data.saleId || res.data.SaleId;
      setCurrentSale(prev => ({
        ...prev,
        saleId
      }));
      setSuccess(true);
      // Return the response data so caller can access the saleId
      return res.data;
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to create sale';
      setError(errorMessage);
      setSuccess(false);
      throw err; // Re-throw so caller can handle the error
    } finally {
      setLoading(false);
    }
  }, []);

  // Add sale detail
  const addSaleDetail = useCallback(async ({ saleId, item }) => {
    try {
      await client.post('/salesmaster/salesdetails', {
        saleId,
        ...item
      });
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to add sale detail';
      setError(errorMessage);
    }
  }, []);

  // Update sale master
  const updateSaleMaster = useCallback(async ({ saleId, data, details }) => {
    try {
      await client.put('/salesmaster', {
        saleId,
        data,
        details: details || []  // Include details array (empty if not provided)
      });
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to update sale';
      setError(errorMessage);
    }
  }, []);

  // Update sale detail
  const updateSaleDetail = useCallback(async ({ saleId, detailId, data }) => {
    try {
      await client.put('/salesmaster/salesdetails', {
        saleId,
        saleDetailId: detailId,
        data
      });
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to update sale detail';
      setError(errorMessage);
    }
  }, []);

  // Batch update sale details
  const batchUpdateSaleDetails = useCallback(async ({ saleId, details }) => {
    try {
      await client.put('/salesmaster/salesdetails/batch', {
        saleId,
        details
      });
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to batch update sale details';
      setError(errorMessage);
    }
  }, []);

  // Batch create sale details
  const batchCreateSaleDetails = useCallback(async ({ saleId, details }) => {
    try {
      await client.post('/salesmaster/salesdetails/batch', {
        saleId,
        details
      });
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to batch create sale details';
      setError(errorMessage);
    }
  }, []);

  // Delete sale
  const deleteSale = useCallback(async (saleId) => {
    setLoading(true);
    try {
      await client.delete('/salesmaster', { data: { saleId } });
      setItems(prev => prev.filter(s => s.saleId !== saleId));
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to delete sale';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     LOCAL STATE ACTIONS
  ========================= */

  // Load sale record into currentSale
  const loadSaleRecord = useCallback((sale) => {
    setCurrentSale({
      saleId: sale.saleId,
      salespersonId: sale.salespersonId ?? null,
      total: sale.total ?? 0,
      comments: sale.comments ?? '',
      details: Array.isArray(sale.details)
        ? sale.details.map(d => {
            // Validate and sanitize quantity and discount with reasonable limits
            const quantity = Math.max(1, Math.min(999999, Number(d.quantity) || 1));
            const discount = Math.max(0, Number(d.discount) || 0);
            const retailPrice = Number(d.retailPrice) || 0;
            const lineTotal = retailPrice * quantity - discount;
            
            return {
              saleDetailId: d.saleDetailId,
              productId: d.productId,
              retailPrice,
              quantity,
              discount,
              lineTotal,
            };
          })
        : [],
    });
  }, []);

  // Reset current sale
  const resetCurrentSale = useCallback(() => {
    setCurrentSale(createEmptySale());
    setFormResetKey(prev => prev + 1);
  }, []);

  // Set salesperson
  const setSalesperson = useCallback((salespersonId) => {
    setCurrentSale(prev => ({
      ...prev,
      salespersonId
    }));
  }, []);

  // Set comments
  const setComments = useCallback((comments) => {
    setCurrentSale(prev => ({
      ...prev,
      comments
    }));
  }, []);

  // Add local item
  const addLocalItem = useCallback((item) => {
    // Validate quantity and discount with reasonable limits
    const quantity = Math.max(1, Math.min(999999, Number(item.quantity) || 1));
    const discount = Math.max(0, Number(item.discount) || 0);
    const retailPrice = Number(item.retailPrice) || 0;
    
    const newItem = {
      ...item,
      quantity,
      discount,
      retailPrice,
      lineTotal: retailPrice * quantity - discount,
    };
    
    setCurrentSale(prev => {
      const newDetails = [...prev.details, newItem];
      // Recalculate total
      const newTotal = newDetails.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
      
      return {
        ...prev,
        details: newDetails,
        total: newTotal
      };
    });
  }, []);

  // Update local item
  const updateLocalItem = useCallback(({ id, quantity, discount }) => {
    setCurrentSale(prev => {
      const newDetails = prev.details.map(d => {
        if (d.saleDetailId === id) {
          // Validate quantity and discount - prevent negative values and cap at maximum
          const validQuantity = Math.max(1, Math.min(999999, Number(quantity) || 1));
          const validDiscount = Math.max(0, Number(discount) || 0);
          
          // Recalculate lineTotal
          const lineTotal = (d.retailPrice || 0) * validQuantity - validDiscount;
          
          return {
            ...d,
            quantity: validQuantity,
            discount: validDiscount,
            lineTotal
          };
        }
        return d;
      });
      
      // Recalculate total
      const newTotal = newDetails.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
      
      return {
        ...prev,
        details: newDetails,
        total: newTotal
      };
    });
  }, []);

  // Remove local item
  const removeLocalItem = useCallback((id) => {
    setCurrentSale(prev => {
      const newDetails = prev.details.filter(d => d.saleDetailId !== id);
      
      // Recalculate total
      const newTotal = newDetails.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
      
      return {
        ...prev,
        details: newDetails,
        total: newTotal
      };
    });
  }, []);

  // Reset success
  const resetSuccess = useCallback(() => {
    setSuccess(false);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    items,
    currentSale,
    loading,
    error,
    success,
    formResetKey,
    fetchSales,
    fetchSaleById,
    createSaleMaster,
    addSaleDetail,
    updateSaleMaster,
    updateSaleDetail,
    batchUpdateSaleDetails,
    batchCreateSaleDetails,
    deleteSale,
    loadSaleRecord,
    resetCurrentSale,
    setSalesperson,
    setComments,
    addLocalItem,
    updateLocalItem,
    removeLocalItem,
    resetSuccess
  }), [
    items,
    currentSale,
    loading,
    error,
    success,
    formResetKey,
    fetchSales,
    fetchSaleById,
    createSaleMaster,
    addSaleDetail,
    updateSaleMaster,
    updateSaleDetail,
    batchUpdateSaleDetails,
    batchCreateSaleDetails,
    deleteSale,
    loadSaleRecord,
    resetCurrentSale,
    setSalesperson,
    setComments,
    addLocalItem,
    updateLocalItem,
    removeLocalItem,
    resetSuccess
  ]);

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
};

// Custom hook with context validation
export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within SalesProvider');
  }
  return context;
};
