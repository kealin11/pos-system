import React from 'react';
import { MdChair } from 'react-icons/md';

const bgColors = [
  'bg-red-500', 'bg-blue-500', 'bg-green-600', 'bg-purple-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
];

const colorMap = {};
const getStableBG = (initial) => {
  if (!colorMap[initial]) {
    colorMap[initial] = bgColors[initial?.charCodeAt(0) % bgColors.length];
  }
  return colorMap[initial];
};

const TableCard = ({ name, status, initial, seats }) => {
  const isBooked = status === 'Booked';

  return (
    <div className="w-[280px] hover:bg-[#2a2a2a] bg-[#262626] p-4 rounded-xl cursor-pointer transition-colors">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">{name}</h1>
        <p className={`${
          isBooked
            ? 'text-green-400 bg-[#2e4a40]'
            : 'bg-[#664a04] text-[#f6b100]'
          } px-3 py-1 rounded-lg text-xs font-semibold`}>
          {status}
        </p>
      </div>
      <div className="flex items-center justify-center mt-5 mb-4">
        <div className={`${getStableBG(initial)} text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold shadow-lg`}>
          {initial}
        </div>
      </div>
      {seats && (
        <div className="flex items-center justify-center gap-1.5 text-[#ababab] text-xs mt-1">
          <MdChair size={14} />
          <span>{seats} seats</span>
        </div>
      )}
    </div>
  );
};

export default TableCard;