import React, { useState } from 'react';
import { FaHome } from 'react-icons/fa';
import { MdOutlineReorder, MdTableBar, MdInventory2 } from 'react-icons/md';
import { CiCircleMore } from 'react-icons/ci';
import { BiSolidDish } from 'react-icons/bi';
import { FiClipboard, FiFileText, FiTruck } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartCount } from '../../redux/slices/cartSlice';
import { logout, selectIsCashier } from '../../redux/slices/authSlice';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartCount);
  const isCashier = useSelector(selectIsCashier);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  const navBtn = (path, Icon, label) => (
    <button
      onClick={() => {
        navigate(path);
        setShowMoreMenu(false);
      }}
      className={`flex items-center justify-center w-full px-3 py-2 transition-colors rounded text-sm ${
        isActive(path)
          ? 'text-[#f5f5f5] bg-[#343434]'
          : 'text-[#ababab] hover:text-[#f5f5f5]'
      }`}
    >
      <Icon className="inline mr-1" size={16} />
      <p className="truncate">{label}</p>
    </button>
  );

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#262626] border-t border-[#3a3a3a] h-16 flex justify-around items-center z-40">
        {navBtn('/', FaHome, 'Home')}
        {navBtn('/orders', MdOutlineReorder, 'Orders')}
        {navBtn('/tables', MdTableBar, 'Tables')}

        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex items-center justify-center text-[#ababab] hover:text-[#f5f5f5] px-3 py-2 transition-colors ${
              showMoreMenu ? 'bg-[#343434] text-[#f5f5f5]' : ''
            }`}
          >
            <CiCircleMore className="inline" size={20} />
          </button>

          {showMoreMenu && (
            <div className="absolute bottom-full right-0 bg-[#262626] border border-[#3a3a3a] rounded-lg shadow-lg mb-2 w-48">
              <div className="p-2 space-y-1">
                {navBtn('/menu', BiSolidDish, 'Menu')}
                {!isCashier && navBtn('/inventory', MdInventory2, 'Stock')}
                {!isCashier && navBtn('/suppliers', FiTruck, 'Suppliers')}
                {!isCashier && navBtn('/grv', FiClipboard, 'GRV')}
                {!isCashier && navBtn('/reports', FiFileText, 'Reports')}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full px-3 py-2 rounded text-sm text-[#ababab] hover:text-red-400 hover:bg-red-900 transition-colors"
                >
                  <CiCircleMore className="inline mr-1" size={16} />
                  <p>Logout</p>
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/menu')}
          className="absolute bottom-6 bg-[#F6B100] hover:bg-[#d49a00] text-white rounded-full p-3 transition-colors shadow-lg z-50"
        >
          <BiSolidDish size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default BottomNav;
