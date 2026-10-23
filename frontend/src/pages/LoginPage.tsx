import React, { useState } from 'react';
import {
  Car,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Cpu,
  Layers,
  Wrench,
  Search
} from 'lucide-react';
import { User as UserType } from '../types';
import { api } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: UserType, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both operator ID / username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const auth = await api.login(username.trim(), password.trim());
      if (rememberMe) {
        localStorage.setItem('autoqc_token', auth.token);
        localStorage.setItem('autoqc_user', JSON.stringify(auth.user));
      } else {
        sessionStorage.setItem('autoqc_token', auth.token);
        sessionStorage.setItem('autoqc_user', JSON.stringify(auth.user));
      }
      onLoginSuccess(auth.user, auth.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userRole: 'admin' | 'inspector' | 'tech') => {
    let u = 'admin';
    let p = 'password123';
    if (userRole === 'inspector') {
      u = 'inspector';
      p = 'password123';
    } else if (userRole === 'tech') {
      u = 'tech';
      p = 'password123';
    }
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const auth = await api.login(u, p);
      if (rememberMe) {
        localStorage.setItem('autoqc_token', auth.token);
        localStorage.setItem('autoqc_user', JSON.stringify(auth.user));
      } else {
        sessionStorage.setItem('autoqc_token', auth.token);
        sessionStorage.setItem('autoqc_user', JSON.stringify(auth.user));
      }
      onLoginSuccess(auth.user, auth.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9FE] flex flex-col justify-between font-sans selection:bg-[#1685F8] selection:text-white">
      {/* Top Navbar */}
      <nav className="h-16 px-6 sm:px-10 border-b border-[#E2E8F0] bg-white flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] border border-[#DBEAFE] flex items-center justify-center text-[#1685F8]">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1685F8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#1685F8]">
            Auto<span className="text-[#18345F]">QC</span>
          </span>
          <span className="hidden sm:inline-block text-[11px] font-bold text-[#64748B] bg-slate-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Plant 4 Telemetry
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#D1FAE5] text-[#10B981] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Telemetry Online</span>
          </span>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Hero / Brand Card (Desktop 5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#18345F] to-[#0E203B] rounded-2xl p-8 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1685F8]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#1685F8]" />
                <span>Industry 4.0 Standard</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                Real-Time Defect Monitoring & Quality Analytics
              </h2>

              <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Connect directly to body, paint, assembly, and final inspection stations. Monitor FPY, log micro-defects, and track rework resolution in real time.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="relative z-10 my-8 space-y-3.5 text-xs text-slate-200">
              <div className="flex items-center space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-[#1685F8]/20 flex items-center justify-center text-[#1685F8]">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">4 Automated Stages</p>
                  <p className="text-[11px] text-slate-400">Body • Paint • Assembly • QC</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">Interactive 3D Blueprint</p>
                  <p className="text-[11px] text-slate-400">Spatial multi-zone defect pinning</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">Persistent Localhost Database</p>
                  <p className="text-[11px] text-slate-400">Audit-ready records stored locally</p>
                </div>
              </div>
            </div>

            {/* Plant Tag */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>SYSTEM: AUTOQC-v2.6</span>
              <span>PORT: 5000</span>
            </div>
          </div>

          {/* Right Form Card (Desktop 7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-[#18345F] tracking-tight">
                  Operator Sign In
                </h1>
                <p className="text-xs text-[#64748B] mt-1">
                  Enter your plant credentials to access the assembly quality dashboard
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                  <div>
                    <p className="font-bold">Authentication Error</p>
                    <p className="text-[11px] text-rose-600 mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-[#18345F] mb-1.5 uppercase tracking-wider">
                    Operator ID / Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin, inspector, tech"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#18345F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1685F8] focus:border-transparent transition-all placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#18345F] uppercase tracking-wider">
                      Access PIN / Password
                    </label>
                    <span className="text-[11px] text-[#1685F8] font-semibold">
                      Default: password123
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter access password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#18345F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1685F8] focus:border-transparent transition-all placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-[#1685F8] border-slate-300 rounded focus:ring-[#1685F8]"
                    />
                    <span className="text-xs text-[#64748B] font-medium">Keep session logged in</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Auto-synced</span>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-[#1685F8] hover:bg-[#116ecf] active:bg-[#0c59a8] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Operator...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Quality Dashboard</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2E8F0]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-white px-3 text-[#64748B] font-bold">
                    Or 1-Click Fast Switch Demo Account
                  </span>
                </div>
              </div>

              {/* Demo Accounts Quick Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 hover:border-blue-400 text-left transition-all group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center space-x-1.5 text-[#1685F8] font-bold text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Plant Director</span>
                  </div>
                  <p className="text-[11px] text-[#18345F] font-bold mt-1">Adithya</p>
                  <p className="text-[10px] text-slate-500 font-mono">admin / pass123</p>
                </button>

                {/* Inspector */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('inspector')}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 hover:border-emerald-400 text-left transition-all group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center space-x-1.5 text-emerald-600 font-bold text-xs">
                    <Search className="w-3.5 h-3.5" />
                    <span>QA Inspector</span>
                  </div>
                  <p className="text-[11px] text-[#18345F] font-bold mt-1">Sarah Chen</p>
                  <p className="text-[10px] text-slate-500 font-mono">inspector / pass123</p>
                </button>

                {/* Tech */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('tech')}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 hover:border-amber-400 text-left transition-all group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center space-x-1.5 text-amber-600 font-bold text-xs">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Rework Tech</span>
                  </div>
                  <p className="text-[11px] text-[#18345F] font-bold mt-1">Kenji Sato</p>
                  <p className="text-[10px] text-slate-500 font-mono">tech / pass123</p>
                </button>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-[#64748B]">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Single localhost:5000 unified architecture</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">AutoQC Security Gateway</span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="h-12 border-t border-[#E2E8F0] bg-white px-6 sm:px-10 flex items-center justify-between text-xs text-[#64748B]">
        <p>© 2026 AutoQC Platform. Real-Time Assembly Quality & Telemetry.</p>
        <p className="hidden sm:block">Automotive Assembly Lines 01–04 • Operational</p>
      </footer>
    </div>
  );
};
