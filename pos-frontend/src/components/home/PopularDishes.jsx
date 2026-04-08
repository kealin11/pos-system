import React from 'react';
import { menuItems } from '../../data.js';

const PopularDishes = () => {
  const popular = menuItems.filter(item => item.popular);

  return (
    <div className="px-8 mt-5">
      <div className="bg-[#1a1a1a] w-full h-[550px] rounded-lg flex flex-col">
        <div className="px-6 py-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">Popular Dishes</h1>
        </div>

        <div className="px-6 overflow-y-auto flex-1 scrollbar-hide">
          {popular.map((dish) => (
            <div key={dish.id} className="flex items-center gap-4 mb-4">
              <img
                src={dish.image}
                alt={dish.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h1 className="text-[#f5f5f5] text-sm font-semibold">{dish.name}</h1>
                <p className="text-[#ababab] text-xs line-clamp-2">{dish.description}</p>
              </div>
              <div className="text-right">
                <p className="text-[#f6b100] font-semibold">R{dish.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;