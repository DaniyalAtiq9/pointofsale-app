import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { useSales } from '../../contexts/SalesContext';
import { useSalespersons } from '../../contexts/SalespersonContext';
import { useProducts } from '../../contexts/ProductContext';

import ProductAutoComplete from './ProductAutoComplete';
import SalesGrid from './SalesGrid';
import SalesRecords from './SalesRecords';
import ProductGridModal from './ProductGridModal';

export default function PointOfSale() {
  const [activeTab, setActiveTab] = useState('sale');
  const [isProductGridOpen, setIsProductGridOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Context hooks
  const {
    currentSale,
    loading,
    error,
    items: sales,
    success,
    fetchSales,
    fetchSaleById,
    createSaleMaster,
    updateSaleMaster,
    batchUpdateSaleDetails,
    batchCreateSaleDetails,
    deleteSale,
    setSalesperson,
    resetCurrentSale,
    setComments,
    resetSuccess,
  } = useSales();

  const { items: salespersons, fetchSalespersons } = useSalespersons();
  const { items: products, fetchProducts } = useProducts();

  // Success toast
  useEffect(() => {
    if (success) {
      toast.success('Sale saved successfully');
      resetSuccess();
    }
  }, [success, resetSuccess]);

  // Initial data load - runs only once on mount
  useEffect(() => {
    fetchProducts();
    fetchSalespersons();
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Edit sale
  const handleEdit = async (sale) => {
    try {
      await fetchSaleById(sale.saleId);
      setActiveTab('sale');
    } catch (err) {
      console.error('Error loading sale:', err);
      toast.error('Failed to load sale: ' + (err.message || 'Unknown error'));
    }
  };

  // Update sale
  const handleUpdateSale = async () => {
    if (!currentSale.salespersonId) {
      toast.error('Please select a salesperson');
      return;
    }

    if (!currentSale.details || currentSale.details.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    try {
      // Debug: Log all details before validation
      console.log('Current sale details:', currentSale.details);
      
      // Validate and prepare details - ensure all have valid saleDetailId
      const validatedDetails = currentSale.details
        .filter(item => {
          const isValid = item.saleDetailId != null && item.saleDetailId !== undefined && !isNaN(item.saleDetailId);
          if (!isValid) {
            console.warn('Filtering out invalid item:', item);
          }
          return isValid;
        })
        .map((item) => ({
          saleDetailId: parseInt(item.saleDetailId, 10),  // Ensure it's an integer
          productId: parseInt(item.productId, 10),
          retailPrice: parseFloat(item.retailPrice),
          quantity: parseInt(item.quantity, 10),
          discount: parseFloat(item.discount),
        }));

      console.log('Validated details to send:', validatedDetails);

      if (validatedDetails.length === 0) {
        toast.error('No valid items to update');
        return;
      }

      if (validatedDetails.length !== currentSale.details.length) {
        console.warn(`Filtered out ${currentSale.details.length - validatedDetails.length} invalid items`);
      }

      // Single API call to update both master and details
      await updateSaleMaster({
        saleId: currentSale.saleId,
        data: {
          total: currentSale.total,
          salespersonId: currentSale.salespersonId,
          comments: currentSale.comments,
        },
        details: validatedDetails,
      });

      // Cleanup and navigate
      toast.success('Sale updated successfully');
      resetCurrentSale();
      setActiveTab('records');
      fetchSales();
    } catch (err) {
      console.error('Error updating sale:', err);
      toast.error('Failed to update sale: ' + (err.message || 'Unknown error'));
    }
  };

  // Delete sale
  const handleDeleteClick = () => {
    if (!currentSale.saleId) return;
    setDeleteTarget(currentSale);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteSale(deleteTarget.saleId);
      toast.success('Sale deleted successfully');
      resetCurrentSale();
      setActiveTab('records');
      setDeleteTarget(null);
      await fetchSales();
    } catch (err) {
      console.error('Error deleting sale:', err);
      toast.error('Failed to delete sale: ' + (err.message || 'Unknown error'));
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  // New sale
  const handleNewSale = () => {
    resetCurrentSale();
    // Stay on Sale tab (activeTab remains 'sale')
  };

  // Save sale
  const handleSaveSale = async () => {
    if (!currentSale.salespersonId) {
      toast.error('Please select a salesperson');
      return;
    }

    if (!currentSale.details || currentSale.details.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    try {
      // Create sale master
      const saleRes = await createSaleMaster({
        total: currentSale.total,
        salespersonId: currentSale.salespersonId,
        comments: currentSale.comments,
      });

      const saleId = saleRes.saleId || saleRes.id || saleRes.SaleId;

      if (!saleId) {
        toast.error('Sale created but no ID returned');
        return;
      }

      // Batch create all sale details in a single API call
      await batchCreateSaleDetails({
        saleId,
        details: currentSale.details.map((item) => ({
          productId: item.productId,
          retailPrice: item.retailPrice,
          quantity: item.quantity,
          discount: item.discount,
        })),
      });

      toast.success('Sale and details saved successfully!');
      resetCurrentSale();
      fetchSales();
    } catch (err) {
      console.error('Error saving sale:', err);
      toast.error('Failed to save sale: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-1">
          <h6 className="text-xl font-bold text-gray-800">
            Point of Sale
          </h6>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">

            <button
              onClick={() => setActiveTab('sale')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sale'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Sale
            </button>

            <button
              onClick={() => {
                if (activeTab === 'sale') {
                  resetCurrentSale();
                }
                setActiveTab('records');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'records'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Records
            </button>

          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-2 pb-16">

        {/* SALE TAB */}
        {activeTab === 'sale' && (
          <div className="space-y-2">

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-sm">
                {typeof error === 'string' ? error : 'An error occurred'}
              </div>
            )}

            {/* Header Info */}
            <div className="bg-white rounded border border-gray-200 p-2 shadow-sm">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                {/* Display-only date */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={new Date().toLocaleString()}
                    disabled
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded text-sm text-gray-600"
                  />
                </div>

                {/* Salesperson */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Salesperson
                  </label>
                  <select
                    value={currentSale.salespersonId || ''}
                    onChange={(e) =>
                      setSalesperson(parseInt(e.target.value) || null)
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">--Select Salesperson--</option>
                    {salespersons.map((sp) => (
                      <option key={sp.salespersonId} value={sp.salespersonId}>
                        {sp.name} ({sp.code})
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* Product Search */}
            <div className="bg-white rounded border border-gray-200 p-2 shadow-sm">

              <div className="flex flex-col items-center">

                <label className="text-xs font-medium text-gray-700 mb-1">
                  Add Product
                </label>

                <div className="flex items-center w-full max-w-2xl border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">

                  <div className="flex-1">
                    <ProductAutoComplete products={products} />
                  </div>

                  <button
                    onClick={() => setIsProductGridOpen(true)}
                    className="p-2 bg-blue-600 text-white hover:bg-blue-700 border-l border-gray-300"
                  >
                    🛒
                  </button>

                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="bg-white rounded border border-gray-200 p-2 shadow-sm">
              <SalesGrid />
            </div>

            {/* Summary */}
            <div className="bg-white rounded border border-gray-200 p-2 shadow-sm">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

                {/* Comments */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows="2"
                    value={currentSale.comments || ''}
                    onChange={(e) =>
                      setComments(e.target.value)
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>

                {/* Total + Action Buttons */}
                <div className="flex flex-col justify-end">

                  <div className="text-xs text-gray-600">
                    Subtotal
                  </div>

                  <div className="text-2xl font-bold">
                    {(currentSale.total || 0).toFixed(2)}
                  </div>

                  {/* Conditional Button Rendering */}
                  {currentSale.saleId === null ? (
                    // Create Mode: Show only Save button
                    <button
                      onClick={handleSaveSale}
                      disabled={loading}
                      className="w-full mt-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  ) : (
                    // Edit Mode: Show Update, Delete, and New Sale buttons
                    <div className="space-y-1 mt-1">
                      <button
                        onClick={handleUpdateSale}
                        disabled={loading}
                        className="w-full px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
                      >
                        {loading ? 'Updating...' : 'Update Sale'}
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        disabled={loading}
                        className="w-full px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm"
                      >
                        Delete Sale
                      </button>
                      <button
                        onClick={handleNewSale}
                        disabled={loading}
                        className="w-full px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                      >
                        New Sale
                      </button>
                    </div>
                  )}

                </div>

              </div>
            </div>

          </div>
        )}

        {/* RECORDS TAB */}
        {activeTab === 'records' && (
          <SalesRecords
            onEdit={handleEdit}
          />
        )}

      </div>

      {/* PRODUCT MODAL */}
      <ProductGridModal
        products={products}
        isOpen={isProductGridOpen}
        onClose={() => setIsProductGridOpen(false)}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop - click to close */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={cancelDelete}
          />
          
          {/* Center wrapper - don't capture clicks */}
          <div className="relative flex items-center justify-center min-h-screen p-4 pointer-events-none">
            {/* Modal Content - re-enable pointer events */}
            <div 
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4 pointer-events-auto"
            >
              <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete Sale #{deleteTarget.saleId}? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}