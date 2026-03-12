import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Building2, User, ArrowRight, ArrowLeft, Zap, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = ['Organisation', 'Admin Account'];

const Register = () => {
  const { register: registerOrg } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm();

  const nextStep = async () => {
    const valid = await trigger(['orgName']);
    if (valid) setStep(1);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerOrg({
        orgName: data.orgName,
        industry: data.industry,
        size: data.size,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      toast.success('Organisation created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-grid flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600
                         flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/30">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your organisation</h1>
          <p className="text-slate-400 text-sm mt-1">Set up your workspace in 2 steps</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < step ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-indigo-600 text-white' :
                'bg-white/10 text-slate-500'
              }`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? 'text-white' : 'text-slate-500'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-white/10 mx-1" />}
            </div>
          ))}
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-semibold text-white">Organisation Details</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Organisation Name *</label>
                    <input
                      {...register('orgName', { required: 'Organisation name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
                      placeholder="Acme Corp"
                      className="input-field"
                    />
                    {errors.orgName && <p className="text-red-400 text-xs mt-1">{errors.orgName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
                    <select {...register('industry')} className="input-field">
                      <option value="">Select industry</option>
                      {['Technology','Finance','Healthcare','Education','E-commerce','Marketing','Other'].map(i => (
                        <option key={i} value={i.toLowerCase()}>{i}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Company Size</label>
                    <select {...register('size')} className="input-field">
                      <option value="">Select size</option>
                      {['1-10','11-50','51-200','201-500','500+'].map(s => (
                        <option key={s} value={s}>{s} employees</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                    id="register-next"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-semibold text-white">Admin Account</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
                      <input {...register('firstName', { required: 'Required' })} placeholder="John" className="input-field" />
                      {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
                      <input {...register('lastName', { required: 'Required' })} placeholder="Doe" className="input-field" />
                      {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                    <input
                      {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                      type="email" placeholder="john@acme.com" className="input-field"
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Password *</label>
                    <div className="relative">
                      <input
                        {...register('password', { required: 'Required', minLength: { value: 8, message: 'At least 8 characters' } })}
                        type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" className="input-field pr-11"
                      />
                      <button type="button" onClick={() => setShowPassword(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(0)} className="btn-secondary flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="submit" disabled={isLoading}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                      id="register-submit">
                      {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <>Create Workspace <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
