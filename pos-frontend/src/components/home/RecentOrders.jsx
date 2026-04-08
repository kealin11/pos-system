import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import OrderList from './OrderList.jsx';
import { useOrders } from '../../hooks/useApiHooks.js';

const RecentOrders = () => {
  const [search, setSearch] = useState('');
  const { data: orders = [], isLoading } = useOrders();

  const filtered = orders.filter((o) =>
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.orderId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-8 mt-6">
      <div className="bg-[#1a1a1a] w-full h-[450px] rounded-lg flex flex-col">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">Recent Orders</h1>
          <a href="/orders" className="text-[#025cca] text-sm font-semibold hover:underline">
            View All
          </a>
        </div>

        <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-6 py-3 mx-6">
          <FaSearch className="text-[#ababab]" />
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Recent Orders"
            className="bg-[#1f1f1f] outline-none text-[#f5f5f5] flex-1 text-sm placeholder:text-[#555]" />
        </div>

        <div className="mt-4 px-6 overflow-y-auto flex-1 scrollbar-hide pb-4">
          {isLoading ? (
            <p className="text-[#ababab] text-sm text-center mt-6">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-[#ababab] text-sm text-center mt-6">No orders found.</p>
          ) : (
            filtered.map((order) => <OrderList key={order._id} order={order} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;