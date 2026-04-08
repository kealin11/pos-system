import React, { useState } from 'react';
import { inventoryAPI } from '../../api/services';
import { FiX, FiTrash2 } from 'react-icons/fi';

const BulkStockModal = ({ isOpen, onClose, items, onStockUpdate }) => {
  const [stockEntries, setStockEntries] = useState([
    { itemId: '', quantity: '', notes: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddEntry = () => {
    setStockEntries([...stockEntries, { itemId: '', quantity: '', notes: '' }]);
  };

  const handleRemoveEntry = (index) => {
    setStockEntries(stockEntries.filter((_, i) => i !== index));
  };

  const handleEntryChange = (index, field, value) => {
    const updated = [...stockEntries];
    updated[index][field] = value;
    setStockEntries(updated);
  };

  const handleSubmit = async () => {
    // Validate entries
    const validEntries = stockEntries.filter(
      (entry) => entry.itemId && entry.quantity && parseInt(entry.quantity) > 0
    );

    if (validEntries.length === 0) {
      setError('Please fill in at least one item with quantity');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let successCount = 0;
      for (const entry of validEntries) {
        try {
          await inventoryAPI.addStock({
            itemId: entry.itemId,
            quantity: parseInt(entry.quantity),
            notes: entry.notes,
          });
          successCount++;
        } catch (err) {
          console.error('Error adding stock to item:', err);
        }
      }

      setSuccess(`Successfully added stock to ${successCount} item(s)`);
      setTimeout(() => {
        setStockEntries([{ itemId: '', quantity: '', notes: '' }]);
        onStockUpdate();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#262626] rounded-xl w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a3a3a] sticky top-0 bg-[#262626]">
          <h2 className="text-[#f5f5f5] text-xl font-bold">Bulk Add Stock</h2>
          <button
            onClick={onClose}
            className="text-[#ababab] hover:text-[#f5f5f5] transition-colors"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-lg text-sm mb-4">
              {success}
            </div>
          )}

          <div className="space-y-4">
            {stockEntries.map((entry, index) => (
              <div
                key={index}
                className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[#ababab] text-sm font-medium">
                    Item {index + 1}
                  </span>
                  {stockEntries.length > 1 && (
                    <button
                      onClick={() => handleRemoveEntry(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#ababab] text-xs font-medium mb-1">
                      Select Item *
                    </label>
                    <select
                      value={entry.itemId}
                      onChange={(e) =>
                        handleEntryChange(index, 'itemId', e.target.value)
                      }
                      className="w-full bg-[#262626] border border-[#3a3a3a] text-[#f5f5f5] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#f6b100]"
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
                    <label className="block text-[#ababab] text-xs font-medium mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      placeholder="Enter quantity"
                      value={entry.quantity}
                      onChange={(e) =>
                        handleEntryChange(index, 'quantity', e.target.value)
                      }
                      className="w-full bg-[#262626] border border-[#3a3a3a] text-[#f5f5f5] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#f6b100]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#ababab] text-xs font-medium mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Add notes about this entry..."
                    value={entry.notes}
                    onChange={(e) =>
                      handleEntryChange(index, 'notes', e.target.value)
                    }
                    className="w-full bg-[#262626] border border-[#3a3a3a] text-[#f5f5f5] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#f6b100]"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddEntry}
            className="mt-4 w-full border border-[#3a3a3a] hover:border-[#f6b100] text-[#f6b100] font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            + Add Another Item
          </button>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[#3a3a3a] sticky bottom-0 bg-[#262626]">
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
            {loading ? 'Adding...' : 'Add Stock to All'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkStockModal;
