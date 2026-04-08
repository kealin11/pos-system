import React from 'react';
import { FaCheckDouble, FaCircle, FaClock, FaCheck } from 'react-icons/fa';
import { getInitials } from '../../utils.js';

const bgColors = [
  'bg-red-500', 'bg-blue-500', 'bg-green-600', 'bg-purple-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
];
const getAvatarBg = (name) => bgColors[(name?.charCodeAt(0) ?? 0) % bgColors.length];

const statusConfig = {
  Ready:         { icon: FaCheckDouble, color: 'text-green-500',  label: 'Ready',       sub: 'Ready to serve' },
  'In Progress': { icon: FaClock,       color: 'text-yellow-400', label: 'In Progress', sub: 'Being prepared' },
  Completed:     { icon: FaCheck,       color: 'text-blue-400',   label: 'Completed',   sub: 'Order fulfilled' },
};

const OrderList = ({ order }) => {
  const cfg      = statusConfig[order.status] || statusConfig['In Progress'];
  const Icon     = cfg.icon;
  const initials = getInitials(order.customerName);

  return (
    <div className="flex items-center gap-4 mb-3">
      <button className={`${getAvatarBg(order.customerName)} p-3 text-white text-sm font-bold rounded-lg flex-shrink-0`}>
        {initials}
      </button>
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start gap-0.5">
          <h1 className="text-[#f5f5f5] text-sm font-semibold">{order.customerName}</h1>
          <p className="text-[#ababab] text-xs">
            {order.items.reduce((s, i) => s + i.qty, 0)} Items
            {order.tableNo ? ` · ${order.tableNo}` : ' · Takeaway'}
          </p>
        </div>
        {order.tableNo && (
          <h1 className="text-[#f6b100] font-semibold border border-[#f6b100] rounded-lg p-1 text-xs">
            Table: {order.tableNo}
          </h1>
        )}
        <div className="flex flex-col items-start gap-1">
          <p className={`${cfg.color} text-sm`}>
            <Icon className="inline mr-1" size={12} />{cfg.label}
          </p>
          <p className="text-[#ababab] text-xs">
            <FaCircle className={`inline mr-1 ${cfg.color}`} size={8} />{cfg.sub}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderList;