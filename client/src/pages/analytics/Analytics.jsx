import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { analyticsApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs shadow-xl">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const { isSuperAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFn = isSuperAdmin ? analyticsApi.getPlatformAnalytics : analyticsApi.getTenantAnalytics;
    fetchFn().then(({ data: res }) => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [isSuperAdmin]);

  const chartData = isSuperAdmin ? data?.tenantGrowth : data?.userGrowth;
  const overview = data?.overview;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">{isSuperAdmin ? 'Platform-wide metrics and trends' : 'Organisation insights and growth metrics'}</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isSuperAdmin ? [
          { label: 'Total Tenants', value: overview?.totalTenants, icon: BarChart3 },
          { label: 'Active Tenants', value: overview?.activeTenants, icon: Activity },
          { label: 'Total Users', value: overview?.totalUsers, icon: Users },
          { label: 'New This Month', value: overview?.newTenantsThisMonth, icon: TrendingUp },
        ] : [
          { label: 'Total Users', value: overview?.totalUsers, icon: Users },
          { label: 'Active Users', value: overview?.activeUsers, icon: Activity },
          { label: 'New This Month', value: overview?.newUsersThisMonth, icon: TrendingUp },
          { label: 'New This Week', value: overview?.newUsersThisWeek, icon: BarChart3 },
        ].map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
                           flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value ?? '--'}</div>
            <div className="text-sm text-slate-400">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 mb-6"
      >
        <h3 className="font-semibold text-white mb-1">
          {isSuperAdmin ? 'Tenant Growth' : 'User Growth'}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {isSuperAdmin ? 'New organisations over the last 30 days' : 'New users over the last 7 days'}
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData || []}>
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5}
              fill="url(#colorGrowth)" name={isSuperAdmin ? 'Tenants' : 'Users'}
              dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Distribution Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Role / Plan distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold text-white mb-1">
            {isSuperAdmin ? 'Plan Distribution' : 'Role Distribution'}
          </h3>
          <p className="text-xs text-slate-400 mb-6">By {isSuperAdmin ? 'subscription plan' : 'user role'}</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={(isSuperAdmin ? data?.planDistribution : data?.roleDistribution) || []}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={3}
              >
                {((isSuperAdmin ? data?.planDistribution : data?.roleDistribution) || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0', fontSize: 12 }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold text-white mb-1">Performance Overview</h3>
          <p className="text-xs text-slate-400 mb-6">Key metrics summary</p>
          <div className="space-y-5">
            {isSuperAdmin ? [
              { label: 'Active Rate', value: overview?.activeTenants, total: overview?.totalTenants, color: 'from-emerald-500 to-emerald-600' },
              { label: 'Free Plans', value: (data?.planDistribution?.find(p => p._id === 'free')?.count || 0), total: overview?.totalTenants, color: 'from-indigo-500 to-indigo-600' },
              { label: 'Paid Plans', value: overview?.totalTenants - (data?.planDistribution?.find(p => p._id === 'free')?.count || 0), total: overview?.totalTenants, color: 'from-violet-500 to-violet-600' },
            ] : [
              { label: 'Active Rate', value: overview?.activeUsers, total: overview?.totalUsers, color: 'from-emerald-500 to-emerald-600' },
              { label: 'Weekly Growth', value: overview?.newUsersThisWeek, total: overview?.totalUsers, color: 'from-indigo-500 to-indigo-600' },
              { label: 'Monthly New', value: overview?.newUsersThisMonth, total: overview?.totalUsers, color: 'from-violet-500 to-violet-600' },
            ].map(({ label, value, total, color }) => {
              const pct = total ? Math.min(Math.round(((value || 0) / total) * 100), 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-300 font-medium">{label}</span>
                    <span className="text-slate-400">{value ?? 0} / {total ?? 0} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className={`h-full bg-gradient-to-r ${color} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
