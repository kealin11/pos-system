import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../api/services';
import { FiX } from 'react-icons/fi';

const EditProductModal = ({ isOpen, onClose, product, categories, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    costPrice: '',
    description: '',
    reorderLevel: '10',
    isSellable: true,
  });
  const [productId, setProductId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && product) {
      setProductId(product._id || product.id);
      setFormData({
        name: product.name || '',
        category: product.category || (categories.length > 0 ? categories[0] : ''),
        price: product.price ? String(product.price) : '',
        costPrice: product.costPrice ? String(product.costPrice) : '',
        description: product.description || '',
        reorderLevel: product.reorderLevel ? String(product.reorderLevel) : '10',
        isSellable: product.isSellable !== false,
      });
      setError('');
      setSuccess('');
    }
  }, [isOpen, product, categories]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event?.preventDefault?.();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      return;
    }
    if (!productId) {
      setError('Product ID is missing');
      return;
    }

    setLoading(true);
    try {
      await inventoryAPI.update(productId, {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
        description: formData.description.trim(),
        reorderLevel: parseInt(formData.reorderLevel, 10) || 10,
        isSellable: formData.isSellable,
      });

      setSuccess('Product updated successfully.');
      setTimeout(() => {
        onProductUpdated();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#262626] rounded-xl w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a3a3a]">
          <h2 className="text-[#f5f5f5] text-xl font-bold">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-[#ababab] hover:text-[#f5f5f5] transition-colors"
          >
            <FiX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div>
            <label className="block text-[#ababab] text-sm font-medium mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-[#3a3a3a] text-[#f5f5f5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f6b100]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#ababab] text-sm font-medium mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-[#3a3a3a] text-[#f5f5f5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f6b100]"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#ababab] text-sm font-medium mb-2">Reorder Level</label>
              <input
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-[#3a3a3a] text-[#f5f5f5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f6b100]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#ababab] text-sm font-medium mb-2">Selling Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                className="w-full bg-[#1a1a1a] border border-[#3a3a3a] text-[#f5f5f5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f6b100]"
              />
            </div>

            <div>
              <label className="block text-[#ababab] text-sm font-medium mb-2">Cost Price</label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                step="0.01"
                className="w-full bg-[#1a1a1a] border border-[#3a3a3a] text-[#f5f5f5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f6b100]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#ababab] text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-[#3a3a3a] text-[#f5f5f5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f6b100] resize-none h-16"
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-[#f5f5f5]">
            <input
              type="checkbox"
              name="isSellable"
              checked={formData.isSellable}
              onChange={handleChange}
            />
            Show this product on the POS menu
          </label>
        </form>

        <div className="flex gap-3 px-6 py-4 border-t border-[#3a3a3a]">
          <button
            onClick={onClose}
            className="flex-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#f5f5f5] font-semibold py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[#f6b100] hover:bg-[#d49a00] disabled:opacity-50 text-black font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
