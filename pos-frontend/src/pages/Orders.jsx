import React, { useState } from 'react';
import BottomNav from '../components/shared/BottomNav.jsx';
import OrderCard from '../components/orders/OrderCard.jsx';
import BackButton from '../components/shared/BackButton.jsx';
import { useOrders } from '../hooks/useApiHooks.js';
import { FaSearch } from 'react-icons/fa';

const filterButtons = ['All', 'In Progress', 'Ready', 'Completed'];

const Orders = () => {
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');

  const { data: orders = [], isLoading, error } = useOrders(
    status === 'All' ? undefined : status
  );

  const filtered = orders.filter((o) =>
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.orderId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="bg-[#1f1f1f] h-screen overflow-hidden flex flex-col pb-16">

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 mt-2">
        <BackButton />
        <div className="flex items-center justify-between w-full">
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">Orders</h1>
          <div className="flex items-center gap-3">
            {filterButtons.map((btn) => (
              <button key={btn} onClick={() => setStatus(btn)}
                className={`text-sm rounded-lg px-4 py-2 font-semibold transition-colors ${
                  status === btn
                    ? 'bg-[#383838] text-[#f5f5f5]'
                    : 'text-[#ababab] hover:text-[#f5f5f5]'
                }`}>
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 mb-4">
        <div className="flex items-center gap-3 bg-[#262626] rounded-xl px-4 py-3">
          <FaSearch className="text-[#ababab]" />
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or order ID..."
            className="bg-transparent flex-1 text-[#f5f5f5] text-sm focus:outline-none placeholder:text-[#555]" />
        </div>
      </div>

      {/* Order Cards */}
      <div className="flex-1 overflow-y-auto px-6 scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-[#ababab] text-sm">
            Loading orders...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-40 text-red-400 text-sm">
            Failed to load orders.
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-[#ababab] text-sm">
            No orders found.
          </div>
        ) : (
          <div className="flex flex-wrap gap-5 pb-4">
            {filtered.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </section>
  );
};

export default Orders;