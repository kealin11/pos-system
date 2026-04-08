import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartTotal,
  selectCartCount,
  updateQty,
  removeItem,
  clearCart,
} from '../../redux/slices/cartSlice.js';
import { usePlaceOrder } from '../../hooks/useApiHooks.js';
import { formatCurrency } from '../../utils.js';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Cart = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);
  const placeOrder = usePlaceOrder();
  const [placed, setPlaced] = useState(false);

  const handlePlaceOrder = async () => {
    if (!items.length) return;

    try {
      const payload = {
        customerName: 'Guest',
        customerPhone: '',
        guestCount: 1,
        type: 'Dine In',
        items: items.map((item) => ({
          productId: item.id,
          qty: item.qty,
        })),
      };

      await placeOrder.mutateAsync(payload);
      setPlaced(true);
      setTimeout(() => {
        dispatch(clearCart());
        setPlaced(false);
        onClose();
        navigate('/orders');
      }, 1200);
    } catch (err) {
      console.error('Place order error:', err);
      alert('Failed to create order. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#1a1a1a] h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2e2e2e]">
          <div className="flex items-center gap-3">
            <FiShoppingCart className="text-[#f6b100] text-xl" />
            <h2 className="text-[#f5f5f5] text-xl font-bold">Cart</h2>
            {count > 0 && (
              <span className="bg-[#f6b100] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-[#ababab] hover:text-[#f5f5f5] transition-colors">
            <FiX size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
              <FiShoppingCart size={48} className="text-[#ababab]" />
              <p className="text-[#ababab] text-sm">Your cart is empty</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-[#262626] rounded-xl p-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#1f1f1f]" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-[#f5f5f5] text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-[#f6b100] text-sm font-bold mt-0.5">
                      {formatCurrency(item.price)}
                    </p>
                    <p className="text-[#666] text-xs mt-0.5">In stock: {item.stock}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => dispatch(updateQty({ id: item.id, qty: item.qty - 1 }))}
                      className="bg-[#1f1f1f] hover:bg-[#333] text-[#f5f5f5] rounded-lg w-7 h-7 flex items-center justify-center transition-colors"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="text-[#f5f5f5] text-sm font-semibold w-5 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => dispatch(updateQty({ id: item.id, qty: item.qty + 1 }))}
                      disabled={item.qty >= item.stock}
                      className="bg-[#f6b100] hover:bg-[#d49a00] disabled:bg-[#444] disabled:text-[#888] text-white rounded-lg w-7 h-7 flex items-center justify-center transition-colors"
                    >
                      <FiPlus size={12} />
                    </button>
                    <button
                      onClick={() => dispatch(removeItem(item.id))}
                      className="ml-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-[#2e2e2e] flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between text-[#ababab]">
                <span>Subtotal ({count} item{count > 1 ? 's' : ''})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#ababab]">
                <span>Service charge (10%)</span>
                <span>{formatCurrency(subtotal * 0.1)}</span>
              </div>
              <div className="flex justify-between text-[#f5f5f5] font-bold text-base mt-1 pt-2 border-t border-[#333]">
                <span>Total</span>
                <span className="text-[#f6b100]">{formatCurrency(total)}</span>
              </div>
            </div>

            {placeOrder.error && (
              <p className="text-red-400 text-xs">
                {placeOrder.error.response?.data?.message || 'Failed to create order'}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => dispatch(clearCart())}
                className="flex-1 border border-[#444] text-[#ababab] hover:text-[#f5f5f5] hover:border-[#666] rounded-xl py-3 text-sm font-semibold transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={placed || placeOrder.isPending}
                className="flex-[2] bg-[#f6b100] hover:bg-[#d49a00] disabled:opacity-70 text-white rounded-xl py-3 text-sm font-bold transition-colors"
              >
                {placed ? 'Order Created' : placeOrder.isPending ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
