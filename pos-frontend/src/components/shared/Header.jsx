import React from 'react';
import { FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 px-8 bg-[#1a1a1a]">
      
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        {/* Logo from public folder */}
        <img src="/EOM-Site-Logo.png" alt="EOM logo" className="h-8 w-8" />
        <h1 className="text-lg font-semibold text-[#f5f5f5]">EOM</h1>
      </div>

      {/* Search Section */}
      <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-5 py-2 w-[400px] max-w-full">
        <FaSearch className="text-[#f5f5f5]" />
        <input
          type="text"
          placeholder="Search"
          className="bg-[#1f1f1f] outline-none text-[#f5f5f5] flex-1"
        />
      </div>

      {/* User Section */}
      <div className="flex items-center gap-4">
        <div className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer">
          <FaBell className="text-[#f5f5f5] text-2xl" />
        </div>
        <div className="flex items-center gap-3 cursor-pointer">
          <FaUserCircle className="text-[#f5f5f5] text-4xl" />
          <div className="flex flex-col items-start">
            <h1 className="text-md font-semibold text-[#f5f5f5]">John Doe</h1>
            <p className="text-xs text-[#a0a0a0]">Admin</p>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
