import React from 'react';
import { FiTrendingDown, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '../../utils';

const StockManagementCard = ({ item, onDelete, deleting }) => {
  const isLowStock = item.stock <= item.reorderLevel;
  const isOutOfStock = item.stock === 0;

  return (
    <div className="bg-[#262626] rounded-lg p-4 border border-[#3a3a3a] hover:border-[#f6b100] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm">{item.name}</h3>
          <p className="text-[#888] text-xs mt-1">{item.category}</p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
              isOutOfStock
                ? 'bg-red-900 text-red-100'
                : isLowStock
                  ? 'bg-yellow-900 text-yellow-100'
                  : 'bg-green-900 text-green-100'
            }`}
          >
            {item.stock} {item.unit}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[#888]">
          <span>Reorder Level: {item.reorderLevel} {item.unit}</span>
          <span>Cost: {formatCurrency(item.costPrice || 0)}</span>
        </div>
        <div className="flex justify-between text-xs text-[#888]">
          <span>Sellable</span>
          <span>{item.isSellable ? 'Yes' : 'No'}</span>
        </div>
        {isLowStock && (
          <div className="flex items-center gap-2 text-yellow-400 text-xs">
            <FiTrendingDown size={14} />
            <span>Low stock. Receive more via GRV.</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[#3a3a3a]">
        <button
          type="button"
          onClick={() => onDelete?.(item)}
          disabled={deleting}
          className="w-full inline-flex items-center justify-center gap-2 rounded bg-red-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiTrash2 size={16} />
          Delete Stock Item
        </button>
      </div>
    </div>
  );
};

export default StockManagementCard;
