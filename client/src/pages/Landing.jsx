import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, Users, BarChart3, ArrowRight, CheckCircle2, Building2, Lock, Globe } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Multi-Tenant Isolation', desc: 'Complete data isolation between organisations with tenant-scoped databases and middleware enforcement.' },
  { icon: Users, title: 'Role-Based Access Control', desc: 'Super Admin, Tenant Admin, and User roles with fine-grained permission middleware on every endpoint.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time insights into user growth, activity trends, and platform health across all tenants.' },
  { icon: Lock, title: 'JWT Security', desc: 'Access + refresh token rotation, bcrypt hashing, Helmet headers, and rate limiting out of the box.' },
  { icon: Building2, title: 'Organisation Management', desc: 'Each company gets its own isolated workspace with custom settings, branding, and subscription plans.' },
  { icon: Globe, title: 'Swagger API Docs', desc: 'Auto-generated, interactive API documentation for every endpoint at /api/docs.' },
];

const plans = [
  { name: 'Free', price: '$0', period: '/mo', features: ['Up to 10 users', 'Basic analytics', 'Audit logs', 'API access'], highlight: false },
  { name: 'Professional', price: '$49', period: '/mo', features: ['Unlimited users', 'Advanced analytics', 'Custom domain', 'Priority support'], highlight: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'SSO/SAML', 'Dedicated support', 'SLA guarantee'], highlight: false },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-16
                     bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">TenantStack</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-secondary text-sm px-4 py-2" id="nav-login">
            Sign in
          </button>
          <button onClick={() => navigate('/register')} className="btn-primary text-sm px-4 py-2" id="nav-register">
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center relative">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse-slow" />
            Production-ready Multi-Tenant SaaS Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            One Platform.<br />
            <span className="gradient-text">Infinite Workspaces.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Build, launch, and scale your SaaS business with enterprise-grade multi-tenancy,
            RBAC, and analytics — all in a single beautiful platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="btn-primary flex items-center gap-2 px-8 py-3.5 text-base"
              id="hero-cta"
            >
              Start for free <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary flex items-center gap-2 px-8 py-3.5 text-base"
            >
              View demo
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-xs text-slate-500">
            {['14-day free trial', 'No credit card required', 'Cancel anytime'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {t}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard preview card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 max-w-5xl mx-auto glass-card p-4 glow-indigo"
        >
          <div className="bg-slate-900 rounded-xl p-6 border border-white/5">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Users', value: '2,847', trend: '+12%', color: 'text-indigo-400' },
                { label: 'Active Tenants', value: '143', trend: '+5%', color: 'text-violet-400' },
                { label: 'Monthly Revenue', value: '$48.2K', trend: '+23%', color: 'text-emerald-400' },
                { label: 'Uptime SLA', value: '99.9%', trend: 'stable', color: 'text-amber-400' },
              ].map(({ label, value, trend, color }) => (
                <div key={label} className="glass-card p-4">
                  <div className="text-xs text-slate-400 mb-2">{label}</div>
                  <div className={`text-xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-emerald-400 mt-1">{trend}</div>
                </div>
              ))}
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '72%' }}
                transition={{ duration: 1.5, delay: 0.8 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Platform usage</span><span>72% capacity</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need to ship SaaS</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Production-ready architecture so you can focus on building product, not infrastructure.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 hover:border-indigo-500/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4
                               group-hover:bg-indigo-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400">Start free, scale as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(({ name, price, period, features: pf, highlight }) => (
              <motion.div
                key={name}
                whileHover={{ y: -4 }}
                className={`glass-card p-8 relative ${highlight ? 'border-indigo-500/50 glow-indigo' : ''}`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full
                                 bg-gradient-to-r from-indigo-600 to-violet-600 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-white text-lg">{name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{price}</span>
                    <span className="text-slate-400 text-sm">{period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {pf.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={highlight ? 'btn-primary w-full' : 'btn-secondary w-full'}
                >
                  Get started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-white">TenantStack</span>
          </div>
          <p className="text-xs text-slate-500">© 2024 TenantStack. Building the future of multi-tenant SaaS.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
