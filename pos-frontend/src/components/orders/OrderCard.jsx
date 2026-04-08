import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaCheckDouble, FaCircle, FaClock, FaCheck, FaTrash } from 'react-icons/fa';
import { formatCurrency, formatDateTime, getInitials } from '../../utils.js';
import { useUpdateOrderStatus, useDeleteOrder } from '../../hooks/useApiHooks.js';
import PaymentModal from '../payment/PaymentModal.jsx';
import { BsCashCoin } from 'react-icons/bs';
import { selectIsAdmin } from '../../redux/slices/authSlice.js';
import ConfirmDialog from '../shared/ConfirmDialog.jsx';

const statusConfig = {
  Ready: {
    icon: FaCheckDouble, color: 'text-green-400',
    bg: 'bg-[#2e4a40]', label: 'Ready', sub: 'Ready to serve',
  },
  'In Progress': {
    icon: FaClock, color: 'text-yellow-400',
    bg: 'bg-[#4a3a04]', label: 'In Progress', sub: 'Being prepared',
  },
  Completed: {
    icon: FaCheck, color: 'text-blue-400',
    bg: 'bg-[#1a2a4a]', label: 'Completed', sub: 'Order fulfilled',
  },
  Cancelled: {
    icon: FaCheck, color: 'text-red-400',
    bg: 'bg-[#4a1a1a]', label: 'Cancelled', sub: 'Order cancelled',
  },
};

const bgColors = [
  'bg-red-500', 'bg-blue-500', 'bg-green-600', 'bg-purple-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
];
const getAvatarBg = (name) => bgColors[(name?.charCodeAt(0) ?? 0) % bgColors.length];

const nextStatus = { 'In Progress': 'Ready' };

const OrderCard = ({ order }) => {
  const cfg          = statusConfig[order.status] || statusConfig['In Progress'];
  const Icon         = cfg.icon;
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder  = useDeleteOrder();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const canAdvance   = order.status in nextStatus;
  const isAdmin = useSelector(selectIsAdmin);

  const handleDelete = () => {
    deleteOrder.mutate(order._id, {
      onSuccess: () => setDeleteDialogOpen(false),
      onError: (error) => {
        alert(`Failed to delete order: ${error.response?.data?.message || error.message}`);
      },
    });
  };

  return (
    <>
      <div className="w-[480px] bg-[#262626] p-4 rounded-xl hover:bg-[#2a2a2a] transition-colors">

        {/* Top Row */}
        <div className="flex items-center gap-4">
          <div className={`${getAvatarBg(order.customerName)} p-3 text-white text-sm font-bold rounded-xl flex-shrink-0`}>
            {getInitials(order.customerName)}
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[#f5f5f5] text-base font-semibold">{order.customerName}</h1>
              <p className="text-[#ababab] text-xs">
                {order.orderId} · {order.type}
                {order.tableNo ? ` · ${order.tableNo}` : ''}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className={`${cfg.color} ${cfg.bg} px-2 py-1 rounded-lg text-xs font-semibold`}>
                <Icon className="inline mr-1" size={10} />{cfg.label}
              </p>
              <p className="text-[#ababab] text-xs">
                <FaCircle className={`inline mr-1 ${cfg.color}`} size={8} />{cfg.sub}
              </p>
            </div>
          </div>
        </div>

        {/* Items Preview */}
        <div className="mt-3 px-1">
          {order.items.slice(0, 2).map((item, i) => (
            <div key={i} className="flex justify-between text-xs text-[#888] mb-0.5">
              <span>{item.qty}× {item.name}</span>
              <span>{formatCurrency(item.price * item.qty)}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-[#555] mt-0.5">
              +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Date & Item Count */}
        <div className="mt-3 flex items-center justify-between text-[#ababab] text-xs">
          <p>{formatDateTime(order.createdAt)}</p>
          <p>{order.items.reduce((s, i) => s + i.qty, 0)} items</p>
        </div>

        <hr className="w-full mt-3 border-t border-[#383838]" />

        {/* Total & Actions */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[#ababab] text-xs">Total</p>
            <p className="text-[#f6b100] text-base font-bold">{formatCurrency(order.total)}</p>
          </div>
          <div className="flex gap-2">
            {order.paymentStatus !== 'Paid' && order.status !== 'Cancelled' && (
              <button onClick={() => setPaymentOpen(true)}
                className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg px-3 py-2 text-xs font-semibold transition-colors">
                <BsCashCoin size={14} /> Take Payment
              </button>
            )}
            {canAdvance && (
              <button
                onClick={() => updateStatus.mutate({ id: order._id, status: nextStatus[order.status] })}
                disabled={updateStatus.isPending}
                className="bg-[#f6b100] hover:bg-[#d49a00] text-black rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60">
                → {nextStatus[order.status]}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleteOrder.isPending}
                className="flex items-center gap-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60">
                <FaTrash size={12} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        orderId={order._id}
      />
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Order"
        message={`Are you sure you want to delete order ${order.orderId}?`}
        confirmLabel="Delete Order"
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        busy={deleteOrder.isPending}
      />
    </>
  );
};

export default OrderCard;
