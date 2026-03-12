import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, Building2, Shield, Zap,
  Bell, Moon, Sun,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = {
  super_admin: [
    { label: 'Platform', icon: Shield, path: '/admin' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ],
  tenant_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Users', icon: Users, path: '/users' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ],
  user: [
    { label: 'My Dashboard', icon: LayoutDashboard, path: '/my-dashboard' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ],
};

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, tenant, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'user';
  const items = navItems[role] || navItems.user;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen flex flex-col z-40
                 bg-slate-900/95 backdrop-blur-xl border-r border-white/10"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600
                         flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-white text-sm truncate"
              >
                SaaS Platform
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded-lg text-slate-400 hover:text-white
                     hover:bg-white/10 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Tenant Info */}
      {!collapsed && tenant && !isSuperAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-3 mt-3 p-3 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center">
              <Building2 className="w-3 h-3 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{tenant.name}</div>
              <div className="text-xs text-slate-500 capitalize">{tenant.plan} plan</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Super Admin Badge */}
      {!collapsed && isSuperAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-3 mt-3 p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-violet-300">Super Admin</span>
          </div>
        </motion.div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto">
        {items.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="truncate"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: User + Logout */}
      <div className="p-3 border-t border-white/10 space-y-1 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600
                           flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10
                     ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
