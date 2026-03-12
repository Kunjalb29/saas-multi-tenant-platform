import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, Settings, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ sidebarWidth }) => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleBadge = {
    super_admin: { label: 'Super Admin', cls: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
    tenant_admin: { label: 'Admin', cls: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    user: { label: 'Member', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  };
  const badge = roleBadge[user?.role] || roleBadge.user;

  return (
    <header
      className="fixed top-0 right-0 h-16 z-30 flex items-center px-6 gap-4
                 bg-slate-900/80 backdrop-blur-xl border-b border-white/10"
      style={{ left: sidebarWidth }}
    >
      {/* Page breadcrumb placeholder */}
      <div className="flex-1" />

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setNotifOpen(o => !o); setDropdownOpen(false); }}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center
                     bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                     text-slate-400 hover:text-white transition-all duration-200"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 glass-card p-4 shadow-2xl shadow-black/50"
            >
              <h4 className="text-sm font-semibold text-white mb-3">Notifications</h4>
              <div className="space-y-3">
                {[
                  { msg: 'New user joined your organisation', time: '2 min ago', dot: 'bg-indigo-500' },
                  { msg: 'Your trial expires in 7 days', time: '1 hour ago', dot: 'bg-amber-500' },
                  { msg: 'Monthly report is ready', time: '3 hours ago', dot: 'bg-emerald-500' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                    <div>
                      <p className="text-xs text-slate-300">{n.msg}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => { setDropdownOpen(o => !o); setNotifOpen(false); }}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl
                     bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                     transition-all duration-200"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600
                         flex items-center justify-center text-xs font-bold text-white">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-white leading-tight">
              {user?.firstName} {user?.lastName}
            </div>
            <div className={`text-xs font-medium badge border px-1.5 py-0 mt-0.5 ${badge.cls}`}>
              {badge.label}
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-12 w-52 glass-card py-2 shadow-2xl shadow-black/50"
            >
              <div className="px-4 py-2 border-b border-white/10 mb-1">
                <p className="text-xs font-semibold text-white">{user?.email}</p>
              </div>
              {[
                { icon: User, label: 'Your Profile', onClick: () => { navigate('/settings'); setDropdownOpen(false); } },
                { icon: Settings, label: 'Settings', onClick: () => { navigate('/settings'); setDropdownOpen(false); } },
              ].map(({ icon: Icon, label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300
                             hover:bg-white/8 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  {label}
                </button>
              ))}
              <div className="border-t border-white/10 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400
                             hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
