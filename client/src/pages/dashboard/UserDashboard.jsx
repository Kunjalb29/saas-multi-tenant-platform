import { motion } from 'framer-motion';
import { User, Building2, Calendar, Mail, Briefcase, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const UserDashboard = () => {
  const { user, tenant } = useAuth();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Dashboard</h1>
        <p className="page-subtitle">Your personal workspace overview</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 lg:col-span-1"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600
                           flex items-center justify-center text-2xl font-bold text-white mb-4
                           shadow-lg shadow-indigo-500/30">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <h2 className="text-lg font-bold text-white">{user?.firstName} {user?.lastName}</h2>
            <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
            <div className="mt-3">
              <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Member
              </span>
            </div>
          </div>

          <div className="divider" />

          <div className="space-y-4">
            {[
              { icon: Briefcase, label: 'Job Title', value: user?.profile?.jobTitle || 'Not set' },
              { icon: Building2, label: 'Department', value: user?.profile?.department || 'Not set' },
              { icon: Mail, label: 'Email', value: user?.email },
              { icon: Clock, label: 'Timezone', value: user?.profile?.timezone || 'UTC' },
              { icon: Calendar, label: 'Member since', value: user?.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '--' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">{label}</div>
                  <div className="text-sm text-slate-200 font-medium truncate">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Organisation Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="font-semibold text-white mb-5">Your Organisation</h3>
          {tenant ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Organisation', value: tenant.name, highlight: true },
                  { label: 'Plan', value: tenant.plan?.toUpperCase(), highlight: false },
                  { label: 'Workspace', value: `/${tenant.slug}`, highlight: false },
                  { label: 'Status', value: tenant.isActive ? 'Active' : 'Inactive', highlight: false },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="p-4 rounded-xl bg-white/3 border border-white/8">
                    <div className="text-xs text-slate-400 mb-1">{label}</div>
                    <div className={`font-semibold ${highlight ? 'text-white' : 'text-indigo-300'}`}>{value}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/8 border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-300">Organisation Features</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tenant.settings?.features && Object.entries(tenant.settings.features)
                    .filter(([, v]) => v)
                    .map(([key]) => (
                      <span key={key} className="badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 capitalize text-xs py-1 px-2">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-sm">No organisation information available.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
