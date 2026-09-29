import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  LogOut,
  ExternalLink,
  Coffee,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children, title = 'Admin Dashboard' }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Products Management', path: '/admin/products', icon: <Package className="w-5 h-5" /> },
    { name: 'Orders Management', path: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Customer Messages', path: '/admin/messages', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-brand-coffee-50 flex flex-col lg:flex-row font-sans">
      {/* Mobile Header */}
      <header className="lg:hidden bg-brand-coffee-950 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-brand-pink-600">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-brand-coffee-900 text-white"
            aria-label="Toggle admin menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-black text-brand-pink-500">Nathan</span>
            <span className="text-xs bg-brand-yellow-400 text-brand-coffee-950 font-bold px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-brand-coffee-950 text-white flex flex-col justify-between border-r-2 border-brand-pink-600/30 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div>
          {/* Logo & Portal Branding */}
          <div className="p-6 border-b border-brand-coffee-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/images/logo.jpeg"
                alt="Nathan Coffee Logo"
                className="h-10 w-auto bg-white rounded-lg p-0.5 border border-brand-pink-500"
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-lg text-brand-pink-400">Nathan</span>
                  <span className="font-bold text-lg text-white">COFFEE</span>
                </div>
                <span className="text-[10px] text-brand-yellow-400 font-semibold tracking-wider uppercase block">
                  Admin Control Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-extrabold text-brand-coffee-400 uppercase tracking-wider">
              Management Menu
            </div>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                      ? 'bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 text-white shadow-md shadow-brand-pink-600/20'
                      : 'text-brand-coffee-300 hover:bg-brand-coffee-900 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-brand-yellow-300' : 'text-brand-coffee-400'}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-brand-yellow-300" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Footer Actions */}
        <div className="p-4 border-t border-brand-coffee-800 bg-brand-coffee-900/50 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-full bg-brand-pink-600 border-2 border-brand-yellow-400 flex items-center justify-center font-black text-sm text-white shadow">
              {admin?.name ? admin.name[0].toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{admin?.name || 'Administrator'}</h4>
              <p className="text-[11px] text-brand-yellow-300 truncate">{admin?.email || 'admin@Nathancoffee.com'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              to="/"
              target="_blank"
              className="px-3 py-2 bg-brand-coffee-800 hover:bg-brand-coffee-700 text-brand-coffee-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Public Site
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Desktop Bar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-brand-coffee-200/80 sticky top-0 z-30 shadow-xs">
          <div>
            <h1 className="text-xl font-extrabold text-brand-coffee-950">{title}</h1>
            <p className="text-xs text-brand-coffee-600">
              Live Store Manager •Nathan Coffee Mart (Thanjavur & Thanjavur)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Store Online & Sync Active
            </span>
            <Link
              to="/shop"
              target="_blank"
              className="text-xs font-bold text-brand-pink-600 hover:text-brand-pink-700 bg-brand-pink-50 px-3.5 py-1.5 rounded-xl border border-brand-pink-200 flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Shop Live
            </Link>
          </div>
        </div>

        {/* Page Children Container */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
