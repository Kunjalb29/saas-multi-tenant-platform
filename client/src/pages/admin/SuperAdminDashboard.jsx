import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp, Globe, ArrowUpRight, Shield, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { analyticsApi, adminApi } from '../../api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

const PLAN_COLORS = { free: '#6366f1', starter: '#8b5cf6', professional: '#06b6d4', enterprise: '#10b981' };

const SuperAdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getPlatformAnalytics(),
      adminApi.getAllTenants({ limit: 10 }),
    ])
      .then(([analyticsRes, tenantsRes]) => {
        setAnalytics(analyticsRes.data.data);
        setTenants(tenantsRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await adminApi.toggleTenantStatus(id);
      setTenants(prev =>
        prev.map(t => t._id === id ? { ...t, isActive: !t.isActive } : t)
      );
      toast.success(`Tenant ${currentStatus ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to update tenant status');
    }
  };

  const overview = analytics?.overview;
  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="page-title">Platform Overview</h1>
            <p className="page-subtitle">Super Admin control center — all tenants and platform health</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tenants', value: overview?.totalTenants, icon: Building2, color: 'from-indigo-500 to-indigo-600' },
          { label: 'Active Tenants', value: overview?.activeTenants, icon: Globe, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Total Users', value: overview?.totalUsers, icon: Users, color: 'from-violet-500 to-violet-600' },
          { label: 'New This Month', value: overview?.newTenantsThisMonth, icon: TrendingUp, color: 'from-amber-500 to-amber-600' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value ?? '--'}</div>
            <div className="text-sm text-slate-400">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Plan Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-1">Plan Distribution</h3>
          <p className="text-xs text-slate-400 mb-6">Tenants by subscription plan</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics?.planDistribution || []} barSize={32}>
              <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0', fontSize: 12 }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(analytics?.planDistribution || []).map((entry, i) => (
                  <Cell key={i} fill={PLAN_COLORS[entry._id] || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Tenant Growth */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-1">Tenant Growth</h3>
          <p className="text-xs text-slate-400 mb-6">New tenants last 30 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics?.tenantGrowth || []} barSize={24}>
              <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0', fontSize: 12 }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tenants Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white">All Organisations</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tenants..."
              className="input-field py-2 pl-9 w-48 text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Organisation</th>
                <th>Plan</th>
                <th>Owner</th>
                <th>Users</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant._id}>
                  <td>
                    <div className="font-medium text-white">{tenant.name}</div>
                    <div className="text-xs text-slate-500">/{tenant.slug}</div>
                  </td>
                  <td>
                    <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">
                      {tenant.plan}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm">
                      {tenant.ownerId?.firstName} {tenant.ownerId?.lastName}
                    </div>
                    <div className="text-xs text-slate-500">{tenant.ownerId?.email}</div>
                  </td>
                  <td className="text-slate-300">{tenant.userCount}</td>
                  <td>
                    <span className={`badge border ${tenant.isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                      {tenant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(tenant._id, tenant.isActive)}
                      className="text-slate-400 hover:text-white transition-colors"
                      title={tenant.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {tenant.isActive
                        ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                        : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredTenants.length && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No tenants found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default SuperAdminDashboard;
