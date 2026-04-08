import React from 'react';
import { useCompletePayment, useInvoice } from '../../hooks/useApiHooks.js';
import { formatCurrency, formatDateTime } from '../../utils.js';
import { FiX } from 'react-icons/fi';
import { BsCashCoin } from 'react-icons/bs';
import { FaCreditCard } from 'react-icons/fa';

const InvoicePrint = ({ order }) => {
  if (!order) return null;

  return (
    <div className="p-8 bg-white text-black min-w-[340px] font-sans">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">EOM Restaurant</h1>
        <p className="text-gray-500 text-sm">Point of Sale System</p>
        <p className="text-gray-400 text-xs mt-1">Tax Invoice</p>
      </div>

      <div className="border-t border-dashed border-gray-300 pt-4 mb-4 text-sm">
        <div className="flex justify-between mb-1">
          <span className="text-gray-500">Order ID</span>
          <span className="font-semibold">{order.orderId}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-500">Customer</span>
          <span className="font-semibold">{order.customerName}</span>
        </div>
        {order.tableNo && (
          <div className="flex justify-between mb-1">
            <span className="text-gray-500">Table</span>
            <span className="font-semibold">{order.tableNo}</span>
          </div>
        )}
        <div className="flex justify-between mb-1">
          <span className="text-gray-500">Type</span>
          <span>{order.type}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-500">Date</span>
          <span>{formatDateTime(order.createdAt)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-500">Payment</span>
          <span>{order.paymentMethod}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
        <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Items</p>
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm mb-1">
            <span>{item.qty}x {item.name}</span>
            <span>{formatCurrency(item.price * item.qty)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-300 pt-4 text-sm">
        <div className="flex justify-between mb-1">
          <span className="text-gray-500">Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-500">Service (10%)</span>
          <span>{formatCurrency(order.serviceCharge)}</span>
        </div>
        <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-gray-200">
          <span>TOTAL</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, orderId }) => {
  const { data: order, isLoading } = useInvoice(isOpen ? orderId : null);
  const paymentMutation = useCompletePayment();

  const handlePayment = async (paymentMethod) => {
    try {
      await paymentMutation.mutateAsync({ orderId, paymentMethod });
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Failed to complete payment');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e2e]">
          <h2 className="text-[#f5f5f5] text-xl font-bold">Payment & Invoice</h2>
          <button onClick={onClose} className="text-[#ababab] hover:text-[#f5f5f5] transition-colors">
            <FiX size={22} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-[#ababab]">Loading order...</div>
        ) : order ? (
          <div className="p-6 flex gap-6">
            <div className="flex-1 bg-white rounded-xl overflow-auto max-h-[60vh] shadow">
              <InvoicePrint order={order} />
            </div>

            <div className="flex flex-col gap-3 w-44">
              <div className="bg-[#262626] rounded-xl p-3 text-center">
                <p className="text-[#ababab] text-xs mb-1">Total Due</p>
                <p className="text-[#f6b100] text-xl font-bold">{formatCurrency(order.total)}</p>
                <p className="text-[#555] text-xs mt-1">{order.paymentStatus}</p>
              </div>

              {order.paymentStatus !== 'Paid' ? (
                <>
                  <button
                    onClick={() => handlePayment('Cash')}
                    disabled={paymentMutation.isPending}
                    className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    <BsCashCoin size={16} /> Cash
                  </button>
                  <button
                    onClick={() => handlePayment('Card')}
                    disabled={paymentMutation.isPending}
                    className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    <FaCreditCard size={16} /> Card
                  </button>
                </>
              ) : (
                <div className="bg-green-900 text-green-400 rounded-xl py-3 text-center text-sm font-semibold">
                  Paid
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-red-400">Order not found.</div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
