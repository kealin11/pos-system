import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../api/services';
import StockManagementCard from '../components/inventory/StockManagementCard';
import ConfirmDialog from '../components/shared/ConfirmDialog.jsx';
import { FiBarChart2, FiRefreshCw } from 'react-icons/fi';

const StockManagement = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [summary, setSummary] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [itemPendingDelete, setItemPendingDelete] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchSummary();
  }, []);

  useEffect(() => {
    let filtered = items;
    if (filter === 'low') {
      filtered = items.filter((item) => item.stock <= item.reorderLevel);
    } else if (filter === 'out') {
      filtered = items.filter((item) => item.stock === 0);
    }
    setFilteredItems(filtered);
  }, [items, filter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await inventoryAPI.getAll({});
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await inventoryAPI.getSummary();
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleDeleteItem = async (item) => {
    setItemPendingDelete(item);
  };

  const confirmDeleteItem = async () => {
    if (!itemPendingDelete) return;

    setDeletingId(itemPendingDelete._id);
    try {
      await inventoryAPI.delete(itemPendingDelete._id);
      await Promise.all([fetchItems(), fetchSummary()]);
      setItemPendingDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(`Failed to delete stock item: ${error.response?.data?.message || error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#888]">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Stock Management</h1>
        <p className="text-[#888]">Inventory is controlled by posted GRVs and completed sales.</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-[#262626] rounded-lg p-4 border border-[#3a3a3a]">
            <p className="text-[#888] text-sm mb-1">Total Items</p>
            <p className="text-2xl font-bold text-[#f6b100]">{summary.totalItems}</p>
          </div>
          <div className="bg-[#262626] rounded-lg p-4 border border-[#3a3a3a]">
            <p className="text-[#888] text-sm mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-500">{summary.lowStockItems}</p>
          </div>
          <div className="bg-[#262626] rounded-lg p-4 border border-[#3a3a3a]">
            <p className="text-[#888] text-sm mb-1">Out of Stock</p>
            <p className="text-2xl font-bold text-red-500">{summary.outOfStockItems}</p>
          </div>
          <div className="bg-[#262626] rounded-lg p-4 border border-[#3a3a3a]">
            <p className="text-[#888] text-sm mb-1">Total Value</p>
            <p className="text-lg font-bold text-[#f6b100]">
              R{(summary.totalValue || 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-lg border border-[#3a3a3a] bg-[#262626] p-4 text-sm text-[#cfcfcf]">
        Manual stock adjustments are disabled. Use the GRV module to receive stock and the payment flow to sell stock.
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex gap-2 flex-wrap">
          {['all', 'low', 'out'].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                filter === key
                  ? 'bg-[#f6b100] text-black'
                  : 'bg-[#262626] text-white hover:bg-[#3a3a3a]'
              }`}
            >
              {key === 'all' ? 'All' : key === 'low' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            fetchItems();
            fetchSummary();
          }}
          className="p-2 bg-[#262626] hover:bg-[#3a3a3a] rounded transition-colors"
          title="Refresh"
        >
          <FiRefreshCw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <StockManagementCard
            key={item._id}
            item={item}
            deleting={deletingId === item._id}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-[#888]">
          <FiBarChart2 size={48} className="mx-auto mb-4 opacity-50" />
          <p>No items found</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!itemPendingDelete}
        title="Delete Stock Item"
        message={
          itemPendingDelete
            ? `Are you sure you want to delete "${itemPendingDelete.name}" from stock management?`
            : ''
        }
        confirmLabel="Delete Item"
        onCancel={() => setItemPendingDelete(null)}
        onConfirm={confirmDeleteItem}
        busy={!!deletingId}
      />
    </div>
  );
};

export default StockManagement;
