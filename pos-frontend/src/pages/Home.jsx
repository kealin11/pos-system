import React from 'react';
import BottomNav from '../components/shared/BottomNav.jsx';
import Greetings from '../components/home/Greetings.jsx';
import { BsCashCoin } from 'react-icons/bs';
import { GrInProgress } from 'react-icons/gr';
import MiniCard from '../components/home/MiniCard.jsx';
import RecentOrders from '../components/home/RecentOrders.jsx';
import { useDashboardStats } from '../hooks/useApiHooks.js';

const Home = () => {
  const { data: stats } = useDashboardStats();

  return (
    <section className="bg-[#1f1f1f] h-screen overflow-hidden flex gap-3 pb-20">

      {/* Left Section */}
      <div className="flex-[3] flex flex-col min-w-0">
        <Greetings />
        <div className="flex items-center w-full gap-3 px-8 mt-8">
          <MiniCard
            title="Total Earnings"
            icon={<BsCashCoin />}
            number={stats?.totalEarnings ?? 0}
            footerNum={stats?.earningsChange ?? 0}
          />
          <MiniCard
            title="In Progress"
            icon={<GrInProgress />}
            number={stats?.inProgress ?? 0}
            footerNum={0}
          />
        </div>
        <RecentOrders />
      </div>

      <BottomNav />
    </section>
  );
};

export default Home;