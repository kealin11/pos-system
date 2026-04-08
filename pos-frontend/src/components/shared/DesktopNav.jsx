import React from 'react';
import { FaHome, FaSignOutAlt } from 'react-icons/fa';
import { MdOutlineReorder, MdTableBar, MdInventory2 } from 'react-icons/md';
import { BiSolidDish } from 'react-icons/bi';
import { FiClipboard, FiFileText, FiTruck } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartCount } from '../../redux/slices/cartSlice';
import { logout, selectIsCashier } from '../../redux/slices/authSlice';

const DesktopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartCount);
  const isCashier = useSelector(selectIsCashier);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/orders', label: 'Orders', icon: MdOutlineReorder },
    { path: '/tables', label: 'Tables', icon: MdTableBar },
    { path: '/menu', label: 'Menu', icon: BiSolidDish },
    { path: '/inventory', label: 'Stock', icon: MdInventory2 },
    { path: '/suppliers', label: 'Suppliers', icon: FiTruck },
    { path: '/grv', label: 'GRV', icon: FiClipboard },
    { path: '/reports', label: 'Reports', icon: FiFileText },
  ].filter((item) => !isCashier || ['/', '/orders', '/tables', '/menu'].includes(item.path));

  return (
    <div className="hidden lg:flex h-screen">
      <div className="w-64 bg-[#262626] border-r border-[#3a3a3a] flex flex-col">
        <div className="p-6 border-b border-[#3a3a3a]">
          <h1 className="text-2xl font-bold text-[#f6b100]">POS</h1>
          <p className="text-xs text-[#888] mt-1">Point of Sale System</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(path)
                  ? 'bg-[#f6b100] text-black font-semibold'
                  : 'text-[#888] hover:text-white hover:bg-[#3a3a3a]'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
              {label === 'Menu' && cartCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#3a3a3a] space-y-2">
          <button
            onClick={() => navigate('/menu')}
            className="w-full bg-[#f6b100] hover:bg-[#d49a00] text-black font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <BiSolidDish size={20} />
            New Order
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-[#888] hover:bg-red-900 hover:text-red-400 transition-colors"
          >
            <FaSignOutAlt size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesktopNav;
