import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Package,
  Layers,
  Tag,
  Home,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navGroups = [
    {
      title: null,
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true }
      ]
    },
    {
      title: 'Content',
      items: [
        { label: 'Posts & Journal', path: '/admin/posts', icon: FileText },
        { label: 'Pages CMS', path: '/admin/pages', icon: FileText },
        { label: 'Materials', path: '/admin/materials', icon: Layers },
        { label: 'Categories', path: '/admin/categories', icon: Tag }
      ]
    },
    {
      title: 'Commerce',
      items: [
        { label: 'Products', path: '/admin/products', icon: Package }
      ]
    },
    {
      title: 'Website',
      items: [
        { label: 'Header CMS', path: '/admin/header', icon: Settings },
        { label: 'Footer CMS', path: '/admin/footer', icon: Settings },
        { label: 'Homepage CMS', path: '/admin/homepage', icon: Home }
      ]
    },
    {
      title: 'Marketing',
      items: [
        { label: 'Newsletter', path: '/admin/newsletter', icon: Mail },
        { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Site Settings', path: '/admin/settings', icon: Settings }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-lotus-forest text-lotus-ivory flex flex-col justify-between transition-transform duration-300 transform overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 sticky top-0 bg-lotus-forest z-10">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-lotus-sand flex items-center justify-center text-lotus-forest">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M12 2C10.5 6 7 9 4 10c3 1 6.5 4 8 8 1.5-4 5-7 8-8-3-1-6.5-4-8-8z" />
                </svg>
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                VietCraft
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-lotus-clay px-1.5 py-0.5 rounded text-white ml-1">
                CMS
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="p-4 space-y-4">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                {group.title && (
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-lotus-sand/60">
                    {group.title}
                  </div>
                )}
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={Boolean((item as any).exact)}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-lotus-clay text-white shadow-sm'
                          : 'text-lotus-ivory/70 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* User profile & actions */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-lotus-sand transition-colors"
          >
            <span>View Public Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-lotus-sand/30 flex items-center justify-center text-white">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate max-w-[100px]">{user?.name}</p>
                <p className="text-[10px] text-lotus-ivory/60 capitalize">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-lotus-ivory/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between lg:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="hidden sm:inline">Role: <strong className="text-gray-800 capitalize">{user?.role}</strong></span>
            <span>Logged in as: <strong className="text-gray-800">{user?.email}</strong></span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
