import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useProducts } from '../contexts/ProductContext';

import DataTable from '../features/common/DataTable';
import ProductForm from '../features/product/ProductForm';
import ConfirmModal from '../features/common/ConfirmModal';

export default function ProductsPage() {
  const { items: products, loading, fetchProducts, deleteProduct } = useProducts();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    // Removed unnecessary fetchProducts() call - Redux state is already updated
  };

  const handleDeleteClick = (product) => {
    setDeleteTarget(product);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteProduct(deleteTarget.productId);
      toast.success('Product deleted successfully');
      setDeleteTarget(null);
    } catch (error) {
      // Display user-friendly error message
      const errorMessage = error?.message || 'Failed to delete product';
      toast.error(errorMessage);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Products
          </h3>
        </div>

        {/* Add Button */}
        <div className="mb-4 flex justify-left">
          <button
            onClick={handleAddNew}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-small"
          >
            + Add Product
          </button>
        </div>

        {/* TABLE */}
        <DataTable
          loading={loading}
          data={currentProducts}
          emptyMessage='No products found. Click "Add Product" to create one.'
          columns={[
            { label: 'Name', align: 'center' },
            { label: 'Code', align: 'center' },
            { label: 'Cost Price', align: 'right' },
            { label: 'Retail Price', align: 'right' },
            { label: 'Actions', align: 'center' },
          ]}
renderRow={(product) => (
  <>
    <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
      {product.name}
    </td>

    <td className="px-6 py-3 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
      {product.code}
    </td>

    <td className="px-6 py-3 text-right text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
      {parseFloat(product.costPrice).toFixed(2)}
    </td>

    <td className="px-6 py-3 text-right text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
      {parseFloat(product.retailPrice).toFixed(2)}
    </td>

    <td className="px-6 py-3 text-center space-x-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
      <button
        onClick={() => handleEdit(product)}
        className="px-4 py-1 bg-blue-300 text-white rounded hover:bg-blue-400 text-sm"
      >
        Edit
      </button>

      <button
        onClick={() => handleDeleteClick(product)}
        className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
      >
        Delete
      </button>
    </td>
  </>
)}
        />

        {/* Pagination Controls */}
        {products.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages} ({products.length} products)
            </div>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODALS OUTSIDE MAIN CONTAINER */}

      <ProductForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        product={editingProduct}
        isEditing={!!editingProduct}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}