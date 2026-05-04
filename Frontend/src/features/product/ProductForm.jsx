import { useState, useEffect } from 'react';
import { useProducts } from '../../contexts/ProductContext';
import Modal from "../common/Modal";

export default function ProductForm({
  isOpen,
  onClose,
  product = null,
  isEditing = false,
}) {
  const { createProduct, updateProduct, fetchProducts } = useProducts();

  const emptyForm = {
    name: '',
    code: '',
    costPrice: '',
    retailPrice: '',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // ✅ KEY FIX: sync product → form state and clear errors when form opens/closes
  useEffect(() => {
    if (isOpen) {
      // Clear errors when form opens
      setErrors({});
      
      if (isEditing && product) {
        setFormData({
          name: product.name || '',
          code: product.code || '',
          costPrice: product.costPrice || '',
          retailPrice: product.retailPrice || '',
        });
      } else {
        setFormData(emptyForm);
      }
    } else {
      // Clear errors when form closes
      setErrors({});
    }
  }, [product, isEditing, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.code) newErrors.code = 'Code is required';
    if (!formData.costPrice) newErrors.costPrice = 'Cost price is required';
    if (!formData.retailPrice)
      newErrors.retailPrice = 'Retail price is required';

    if (
      parseFloat(formData.retailPrice) <
      parseFloat(formData.costPrice)
    ) {
      newErrors.retailPrice =
        'Retail price must be greater than cost price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEditing && product) {
        await updateProduct({
          id: product.productId,
          data: formData,
        });
      } else {
        await createProduct(formData);
      }

      setFormData(emptyForm);
      onClose();
    } catch (error) {
      // Display user-friendly error messages
      const errorMessage = error?.message || 'Operation failed';
      
      // All responses are 200 OK, check the message content
      if (errorMessage.includes('code already exists')) {
        setErrors({ 
          code: errorMessage
        });
      } else if (errorMessage.includes('name already exists')) {
        setErrors({ 
          name: errorMessage
        });
      } else if (errorMessage.includes('Retail price cannot be less than cost price')) {
        setErrors({ 
          retailPrice: errorMessage
        });
      } else if (errorMessage.includes('not found')) {
        setErrors({ 
          name: errorMessage
        });
      } else {
        // Generic error
        console.error('Error saving product:', errorMessage);
        setErrors({ 
          name: errorMessage
        });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>

        <button
          onClick={onClose}
          className="text-gray-500 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* FORM (ONLY ONE — FIXED) */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name}</p>
          )}
        </div>

        {/* Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.code && (
            <p className="text-red-500 text-sm">{errors.code}</p>
          )}
        </div>

        {/* Cost Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Price
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.costPrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                costPrice: e.target.value,
              })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.costPrice && (
            <p className="text-red-500 text-sm">
              {errors.costPrice}
            </p>
          )}
        </div>

        {/* Retail Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Retail Price
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.retailPrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                retailPrice: e.target.value,
              })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.retailPrice && (
            <p className="text-red-500 text-sm">
              {errors.retailPrice}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <button
            type="submit"
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg"
          >
            {isEditing ? 'Update' : 'Add'} Product
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-300 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}