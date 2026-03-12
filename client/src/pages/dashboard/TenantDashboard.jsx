import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, Activity, Zap, ArrowUpRight,
  UserPlus, Settings, BarChart3, Clock, Shield
} from 'lucide-react';
import { analyticsApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="stat-card"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-1 rounded-full">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value ?? '--'}</div>
    <div className="text-sm text-slate-400">{title}</div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="text-slate-400">{label}</p>
        <p className="text-indigo-400 font-semibold">{payload[0].value} users</p>
      </div>
    );
  }
  return null;
};

const TenantDashboard = () => {
  const { user, tenant } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getTenantAnalytics()
      .then(({ data }) => setAnalytics(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const overview = analytics?.overview;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">
              Welcome back, {user?.firstName} 👋
            </h1>
            <p className="page-subtitle">
              Here's what's happening with <span className="text-indigo-400 font-medium">{tenant?.name}</span> today.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
              <span className="text-xs text-emerald-400 font-medium capitalize">{tenant?.plan} plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={overview?.totalUsers} icon={Users}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600" trend="+12%" delay={0} />
        <StatCard title="Active Users" value={overview?.activeUsers} icon={Activity}
          color="bg-gradient-to-br from-violet-500 to-violet-600" trend="+4%" delay={0.1} />
        <StatCard title="New This Month" value={overview?.newUsersThisMonth} icon={UserPlus}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600" trend="+8%" delay={0.2} />
        <StatCard title="New This Week" value={overview?.newUsersThisWeek} icon={TrendingUp}
          color="bg-gradient-to-br from-amber-500 to-amber-600" delay={0.3} />
      </div>

      {/* Charts + Activity */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* User growth chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="font-semibold text-white mb-1">User Growth</h3>
          <p className="text-xs text-slate-400 mb-6">Last 7 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={analytics?.userGrowth || []}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2}
                fill="url(#colorUsers)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Role Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold text-white mb-1">Role Distribution</h3>
          <p className="text-xs text-slate-400 mb-6">By user role</p>
          <div className="space-y-4">
            {(analytics?.roleDistribution || []).map(({ _id: role, count }) => {
              const total = overview?.totalUsers || 1;
              const pct = Math.round((count / total) * 100);
              const colors = {
                tenant_admin: { bar: 'from-indigo-500 to-indigo-600', text: 'text-indigo-400', label: 'Admins' },
                user: { bar: 'from-violet-500 to-violet-600', text: 'text-violet-400', label: 'Members' },
              };
              const c = colors[role] || { bar: 'from-slate-500 to-slate-600', text: 'text-slate-400', label: role };
              return (
                <div key={role}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-300 font-medium">{c.label}</span>
                    <span className={c.text}>{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className={`h-full bg-gradient-to-r ${c.bar} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white">Recent Activity</h3>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>
        <div className="space-y-4">
          {(analytics?.recentActivity || []).slice(0, 6).map((log, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-white">
                    {log.userId?.firstName} {log.userId?.lastName}
                  </span>{' '}
                  performed <span className="text-indigo-400 font-mono text-xs">{log.action}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : ''}
                </p>
              </div>
            </div>
          ))}
          {(!analytics?.recentActivity?.length) && (
            <p className="text-sm text-slate-500 text-center py-6">No activity yet</p>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
      >
        {[
          { icon: UserPlus, label: 'Invite User', href: '/users', color: 'hover:border-indigo-500/40' },
          { icon: BarChart3, label: 'View Analytics', href: '/analytics', color: 'hover:border-violet-500/40' },
          { icon: Settings, label: 'Org Settings', href: '/settings', color: 'hover:border-slate-500/40' },
        ].map(({ icon: Icon, label, href, color }) => (
          <a key={label} href={href}
            className={`glass-card p-4 flex items-center gap-3 transition-all duration-200 hover:bg-white/8 ${color} group`}>
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10">
              <Icon className="w-4 h-4 text-slate-300" />
            </div>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white">{label}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 ml-auto" />
          </a>
        ))}
      </motion.div>
    </div>
  );
};

export default TenantDashboard;
