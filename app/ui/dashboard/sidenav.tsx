import React from 'react';

const SideNav: React.FC = () => {
  return (
    <div className="sidenav">
      <h2>Dashboard</h2>
      <nav>
        <ul>
          <li><a href="/dashboard">Overview</a></li>
          <li><a href="/dashboard/events">Events</a></li>
          <li><a href="/dashboard/venues">Venues</a></li>
          <li><a href="/dashboard/tasks">Tasks</a></li>
          <li><a href="/dashboard/settings">Settings</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default SideNav;