import React, { useState } from 'react';
import BottomNav from '../components/shared/BottomNav.jsx';
import BackButton from '../components/shared/BackButton.jsx';
import TableCard from '../components/tables/TableCard.jsx';
import { useTables } from '../hooks/useApiHooks.js';

const filterButtons = ['All', 'Booked', 'Available'];

const Tables = () => {
  const [status, setStatus] = useState('All');

  const { data: tables = [], isLoading, error } = useTables(
    status === 'All' ? undefined : status
  );

  const bookedCount    = tables.filter((t) => t.status === 'Booked').length;
  const availableCount = tables.filter((t) => t.status === 'Available').length;

  return (
    <section className="bg-[#1f1f1f] h-screen overflow-hidden flex flex-col pb-16">

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 mt-2">
        <BackButton />
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">Tables</h1>
            <p className="text-[#ababab] text-xs mt-0.5">
              {bookedCount} booked · {availableCount} available
            </p>
          </div>
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

      {/* Table Cards */}
      <div className="flex-1 overflow-y-auto px-8 scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-[#ababab] text-sm">
            Loading tables...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-40 text-red-400 text-sm">
            Failed to load tables.
          </div>
        ) : tables.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-[#ababab] text-sm">
            No tables found.
          </div>
        ) : (
          <div className="flex flex-wrap gap-5 pb-4 pt-2">
            {tables.map((table) => (
              <TableCard
                key={table._id}
                name={table.name}
                status={table.status}
                initial={table.initial}
                seats={table.seats}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;