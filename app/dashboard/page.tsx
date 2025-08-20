import React from 'react';
import SideNav from '../ui/dashboard/sidenav';

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <SideNav />
      <div className="dashboard-content">
        {/* Add other dashboard components here */}
      </div>
    </div>
  );
};

export default DashboardPage;