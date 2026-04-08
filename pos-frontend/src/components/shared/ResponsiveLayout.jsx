import React from 'react';
import BottomNav from './BottomNav';
import DesktopNav from './DesktopNav';

/**
 * Responsive Layout Component
 * Shows DesktopNav on large screens and BottomNav on mobile
 */
const ResponsiveLayout = ({ children }) => {
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#1a1a1a]">
      {/* Desktop Sidebar */}
      <DesktopNav />

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-16 lg:pb-0">
        {children}
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
};

export default ResponsiveLayout;
