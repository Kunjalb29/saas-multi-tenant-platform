import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Building2, Key, Bell, Trash2, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { usersApi, tenantApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SettingsSection = ({ title, description, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 mb-5"
  >
    <div className="flex items-start gap-4 mb-5">
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="border-t border-white/8 pt-5">{children}</div>
  </motion.div>
);

const Settings = () => {
  const { user, tenant, isTenantAdmin, updateUser } = useAuth();
  const [saving, setSaving] = useState('');
  const [saved, setSaved] = useState('');

  const profileForm = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      jobTitle: user?.profile?.jobTitle || '',
      department: user?.profile?.department || '',
      phone: user?.profile?.phone || '',
      timezone: user?.profile?.timezone || 'UTC',
    },
  });

  const orgForm = useForm({
    defaultValues: { name: tenant?.name || '' },
  });

  const showSaved = (key) => {
    setSaved(key);
    setTimeout(() => setSaved(''), 2500);
  };

  const saveProfile = async (data) => {
    setSaving('profile');
    try {
      await usersApi.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        profile: { jobTitle: data.jobTitle, department: data.department, phone: data.phone, timezone: data.timezone },
      });
      updateUser({ firstName: data.firstName, lastName: data.lastName });
      toast.success('Profile saved');
      showSaved('profile');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving('');
    }
  };

  const saveOrg = async (data) => {
    setSaving('org');
    try {
      await tenantApi.update({ name: data.name });
      toast.success('Organisation updated');
      showSaved('org');
    } catch {
      toast.error('Failed to update organisation');
    } finally {
      setSaving('');
    }
  };

  const SaveButton = ({ id }) => (
    <button
      type="submit"
      disabled={!!saving}
      className="btn-primary flex items-center gap-2 min-w-[100px] justify-center"
    >
      {saving === id ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
      ) : saved === id ? (
        <><CheckCircle2 className="w-4 h-4" /> Saved!</>
      ) : (
        <><Save className="w-4 h-4" /> Save</>
      )}
    </button>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile, organisation, and preferences</p>
      </div>

      <div className="max-w-2xl">
        {/* Profile Settings */}
        <SettingsSection title="Profile" description="Update your personal information and preferences" icon={User}>
          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">First Name</label>
                <input {...profileForm.register('firstName', { required: true })} className="input-field py-2.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Last Name</label>
                <input {...profileForm.register('lastName', { required: true })} className="input-field py-2.5" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
              <input value={user?.email} disabled className="input-field py-2.5 opacity-50 cursor-not-allowed" />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Job Title</label>
                <input {...profileForm.register('jobTitle')} placeholder="e.g. Senior Engineer" className="input-field py-2.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Department</label>
                <input {...profileForm.register('department')} placeholder="e.g. Engineering" className="input-field py-2.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone</label>
                <input {...profileForm.register('phone')} placeholder="+1 555 000 0000" className="input-field py-2.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Timezone</label>
                <select {...profileForm.register('timezone')} className="input-field py-2.5">
                  {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo'].map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <SaveButton id="profile" />
            </div>
          </form>
        </SettingsSection>

        {/* Organisation Settings (Admins only) */}
        {isTenantAdmin && tenant && (
          <SettingsSection title="Organisation" description="Update your organisation's details and settings" icon={Building2}>
            <form onSubmit={orgForm.handleSubmit(saveOrg)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Organisation Name</label>
                <input {...orgForm.register('name', { required: true })} className="input-field py-2.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Workspace URL</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm">app.tenantstack.com/</span>
                  <input value={tenant.slug} disabled className="input-field py-2.5 flex-1 opacity-50 cursor-not-allowed" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Workspace URL cannot be changed.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Current Plan</label>
                <div className="flex items-center gap-2">
                  <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize text-sm py-1.5 px-3">
                    {tenant.plan}
                  </span>
                  <span className="text-xs text-slate-400">— Contact support to upgrade</span>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <SaveButton id="org" />
              </div>
            </form>
          </SettingsSection>
        )}

        {/* Security */}
        <SettingsSection title="Security" description="Manage your account security settings" icon={Key}>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/3 border border-white/8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Two-Factor Authentication</div>
                  <div className="text-xs text-slate-400 mt-0.5">Add an extra layer of security</div>
                </div>
                <span className="badge bg-amber-500/20 text-amber-300 border border-amber-500/30">Coming soon</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/3 border border-white/8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Active Sessions</div>
                  <div className="text-xs text-slate-400 mt-0.5">Manage where you're logged in</div>
                </div>
                <button className="btn-secondary text-xs px-3 py-1.5">View sessions</button>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" description="Control what emails and alerts you receive" icon={Bell}>
          <div className="space-y-4">
            {[
              { label: 'New user joins your org', desc: 'Get notified when someone accepts an invite', enabled: true },
              { label: 'Weekly digest', desc: 'Receive a weekly summary of org activity', enabled: true },
              { label: 'Security alerts', desc: 'Get alerted about suspicious sign-in activity', enabled: true },
              { label: 'Product updates', desc: 'Learn about new features and improvements', enabled: false },
            ].map(({ label, desc, enabled }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/3 transition-colors">
                <div>
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
                <div className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </div>
            ))}
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        {isTenantAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border-red-500/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Danger Zone</h3>
                <p className="text-xs text-slate-400 mt-0.5">Irreversible actions — proceed with caution</p>
              </div>
            </div>
            <div className="border-t border-red-500/10 mt-5 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Delete Organisation</div>
                  <div className="text-xs text-slate-400 mt-0.5">Permanently delete your workspace and all data</div>
                </div>
                <button
                  onClick={() => toast.error('Contact support to delete your organisation')}
                  className="px-4 py-2 rounded-xl border border-red-500/40 text-red-400 text-sm font-medium
                             hover:bg-red-500/10 hover:border-red-500/60 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Settings;
