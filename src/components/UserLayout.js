import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function UserLayout() {
  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
