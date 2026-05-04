import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSalespersons } from '../contexts/SalespersonContext';

import DataTable from '../features/common/DataTable';
import Modal from '../features/common/Modal';
import ConfirmModal from '../features/common/ConfirmModal';

export default function SalespersonPage() {
  const { 
    items: salespersons, 
    loading, 
    fetchSalespersons,
    createSalesperson,
    updateSalesperson,
    deleteSalesperson
  } = useSalespersons();

  const emptyForm = {
    name: '',
    code: '',
  };

  const [formOpen, setFormOpen] = useState(false);
  const [editingSalesperson, setEditingSalesperson] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSalespersons();
  }, [fetchSalespersons]);

  useEffect(() => {
    if (formOpen) {
      // Clear errors when form opens
      setErrors({});
      
      if (editingSalesperson) {
        setFormData({
          name: editingSalesperson.name || '',
          code: editingSalesperson.code || '',
        });
      } else {
        setFormData(emptyForm);
      }
    } else {
      // Clear errors when form closes
      setErrors({});
    }
  }, [editingSalesperson, formOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.code) newErrors.code = 'Code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingSalesperson) {
        await updateSalesperson({
          id: editingSalesperson.salespersonId,
          data: formData
        });
        toast.success('Salesperson updated successfully');
      } else {
        await createSalesperson(formData);
        toast.success('Salesperson created successfully');
      }

      setFormOpen(false);
      setEditingSalesperson(null);
      setFormData(emptyForm);
    } catch (error) {
      // Display user-friendly error messages
      const errorMessage = error?.message || 'Operation failed';
      
      // All responses are 200 OK, check the message content
      if (errorMessage.includes('code already exists')) {
        setErrors({ 
          code: errorMessage
        });
        toast.error(errorMessage);
      } else if (errorMessage.includes('name already exists')) {
        setErrors({ 
          name: errorMessage
        });
        toast.error(errorMessage);
      } else if (errorMessage.includes('not found')) {
        toast.error(errorMessage);
      } else {
        // Generic error
        toast.error(errorMessage);
      }
    }
  };

  const handleEdit = (sp) => {
    setEditingSalesperson(sp);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingSalesperson(null);
    setFormOpen(true);
  };

  const handleDeleteClick = (sp) => {
    setDeleteTarget(sp);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteSalesperson(deleteTarget.salespersonId);
      toast.success('Salesperson deleted successfully');
      setDeleteTarget(null);
    } catch (error) {
      // Display user-friendly error message
      const errorMessage = error?.message || 'Failed to delete salesperson';
      toast.error(errorMessage);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(salespersons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSalespersons = salespersons.slice(startIndex, endIndex);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-gray-800">
            Sale Persons
          </h3>
        </div>

        {/* Add Button */}
        <div className="mb-4 flex justify-left">
          <button
            onClick={handleAddNew}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            + Add Salesperson
          </button>
        </div>

        {/* TABLE (MATCH PRODUCTS STYLE EXACTLY) */}
        <DataTable
          loading={loading}
          data={currentSalespersons}
          emptyMessage="No salespersons found. Click Add Salesperson to create one."
          columns={[
            { label: 'Name', align: 'center' },
            { label: 'Code', align: 'center' },
            { label: 'Entered Date', align: 'center' },
            { label: 'Actions', align: 'center' },
          ]}
renderRow={(sp) => (
  <>
    <td className="px-6 py-3 font-medium text-gray-800 border-r border-gray-200 last:border-r-0">
      {sp.name}
    </td>

    <td className="px-6 py-3 text-gray-700 border-r border-gray-200 last:border-r-0">
      {sp.code}
    </td>

    <td className="px-6 py-3 text-gray-700 border-r border-gray-200 last:border-r-0">
      {new Date(sp.enteredDate).toLocaleDateString()}
    </td>

    <td className="px-6 py-3 text-center space-x-2 border-r border-gray-200 last:border-r-0">
      <button
        onClick={() => handleEdit(sp)}
        className="px-4 py-1 bg-blue-300 text-white rounded hover:bg-blue-400 text-sm"
      >
        Edit
      </button>

      <button
        onClick={() => handleDeleteClick(sp)}
        className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
      >
        Delete
      </button>
    </td>
  </>
)}
        />

        {/* Pagination Controls */}
        {salespersons.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({salespersons.length} salespersons)
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
        )}

      </div>

      {/* FORM MODAL */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
      >
        <h2 className="text-lg font-semibold mb-4">
          {editingSalesperson ? 'Edit Salesperson' : 'Add Salesperson'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            placeholder="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name}</p>
          )}

          <input
            placeholder="Code"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.code && (
            <p className="text-red-500 text-sm">{errors.code}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
            >
              {editingSalesperson ? 'Update' : 'Add'}
            </button>

            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="flex-1 bg-gray-300 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>

        </form>
      </Modal>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Salesperson"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}