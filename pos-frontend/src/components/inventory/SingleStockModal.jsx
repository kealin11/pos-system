import React, { useState } from 'react';
import { inventoryAPI } from '../../api/services';
import { FiX } from 'react-icons/fi';

const SingleStockModal = ({ isOpen, onClose, items, onStockUpdate }) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddStock = async () => {
    if (!selectedItem || quantity <= 0) {
      setError('Please select an item and enter a valid quantity');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await inventoryAPI.addStock({
        itemId: selectedItem,
        quantity: parseInt(quantity),
        notes,
      });
      setSelectedItem('');
      setQuantity('');
      setNotes('');
      onStockUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#262626] rounded-xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a3a3a]">
          <h2 className="text-[#f5f5f5] text-xl font-bold">Add Stock</h2>
          <button
            onClick={onClose}
            className="text-[#ababab] hover:text-[#f5f5f5] transition-colors"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[#ababab] text-sm font-medium mb-2">
              Select Item *
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#3a3a3a] text-[#f5f5f5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f6b100]"
            >
              <option value="">Choose an item...</option>
              {items.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} - {item.stock} {item.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#ababab] text-sm font-medium mb-2">
              Quantity *
            </label>
            <input
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#3a3a3a] text-[#f5f5f5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f6b100]"
            />
          </div>

          <div>
            <label className="block text-[#ababab] text-sm font-medium mb-2">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Add notes about this stock addition..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#3a3a3a] text-[#f5f5f5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f6b100] resize-none h-20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[#3a3a3a]">
          <button
            onClick={onClose}
            className="flex-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#f5f5f5] font-semibold py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddStock}
            disabled={loading}
            className="flex-1 bg-[#f6b100] hover:bg-[#d49a00] disabled:opacity-50 text-black font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Adding...' : 'Add Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleStockModal;
