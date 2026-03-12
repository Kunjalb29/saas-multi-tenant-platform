import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Search, MoreHorizontal, Shield, User,
  UserCheck, UserX, Loader2, X, CheckCircle2
} from 'lucide-react';
import { usersApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ROLE_STYLES = {
  tenant_admin: { cls: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', label: 'Admin' },
  user: { cls: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: 'Member' },
};

const InviteModal = ({ onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await usersApi.invite(data);
      toast.success(`${data.firstName} invited successfully!`);
      onSuccess(res.data.data.user);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invite failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white">Invite Team Member</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">First Name *</label>
              <input {...register('firstName', { required: 'Required' })} className="input-field py-2.5" placeholder="John" />
              {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Last Name *</label>
              <input {...register('lastName', { required: 'Required' })} className="input-field py-2.5" placeholder="Doe" />
              {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email *</label>
            <input {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
              type="email" className="input-field py-2.5" placeholder="john@company.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Role</label>
            <select {...register('role')} className="input-field py-2.5">
              <option value="user">Member</option>
              <option value="tenant_admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Inviting...</> : <><UserPlus className="w-4 h-4" />Invite</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const UserManagement = () => {
  const { isTenantAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchUsers = async () => {
    try {
      const { data } = await usersApi.getAll({ search, role: roleFilter, limit: 20 });
      setUsers(data.data);
      setPagination(data.pagination || {});
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const handleDeactivate = async (id) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await usersApi.deactivate(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: false } : u));
      toast.success('User deactivated');
    } catch {
      toast.error('Failed to deactivate user');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const { data } = await usersApi.update(id, { role });
      setUsers(prev => prev.map(u => u._id === id ? data.data.user : u));
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Manage your organisation's members and their roles</p>
          </div>
          {isTenantAdmin && (
            <button
              onClick={() => setShowInvite(true)}
              className="btn-primary flex items-center gap-2 self-start"
              id="invite-user-btn"
            >
              <UserPlus className="w-4 h-4" /> Invite User
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="input-field py-2.5 text-sm w-40"
        >
          <option value="">All roles</option>
          <option value="tenant_admin">Admins</option>
          <option value="user">Members</option>
        </select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: pagination.total || users.length, icon: User, color: 'text-indigo-400' },
          { label: 'Active', value: users.filter(u => u.isActive).length, icon: UserCheck, color: 'text-emerald-400' },
          { label: 'Inactive', value: users.filter(u => !u.isActive).length, icon: UserX, color: 'text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <div className="text-lg font-bold text-white">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const rs = ROLE_STYLES[u.role] || ROLE_STYLES.user;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600
                                         flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-white">{u.firstName} {u.lastName}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {isTenantAdmin ? (
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u._id, e.target.value)}
                            className={`badge border cursor-pointer bg-transparent ${rs.cls}`}
                          >
                            <option value="user">Member</option>
                            <option value="tenant_admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`badge border ${rs.cls}`}>{rs.label}</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge border ${u.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-slate-400 text-xs">
                        {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '--'}
                      </td>
                      <td className="text-slate-400 text-xs">
                        {u.lastLogin ? format(new Date(u.lastLogin), 'MMM d, yyyy') : 'Never'}
                      </td>
                      <td>
                        {isTenantAdmin && u.isActive && (
                          <button
                            onClick={() => handleDeactivate(u._id)}
                            className="text-red-400 hover:text-red-300 text-xs font-medium hover:underline"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!users.length && (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-500">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showInvite && (
          <InviteModal
            onClose={() => setShowInvite(false)}
            onSuccess={(user) => setUsers(prev => [user, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
