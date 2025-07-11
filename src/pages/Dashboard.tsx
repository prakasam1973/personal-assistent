import React from "react";
import { Link, Outlet } from "react-router-dom";

const Dashboard: React.FC = () => (
  <div className="max-w-3xl mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6 text-blue-900">Dashboard</h1>
    <nav className="mb-6 flex gap-4">
      <Link to="notepad" className="hover:text-blue-600 font-medium transition">Notepad</Link>
      <Link to="excel-upload" className="hover:text-blue-600 font-medium transition">Excel Upload</Link>
      {/* Add more dashboard tools here */}
    </nav>
    <Outlet />
  </div>
);

export default Dashboard;