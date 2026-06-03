'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, Eye, EyeOff, Mail, Lock, Chrome, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email va parolni kiriting');
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Xush kelibsiz!');
        router.push('/dashboard');
      } else {
        setError(getErrorMessage(result.error));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        toast.success('Google orqali kirdingiz!');
        router.push('/dashboard');
      } else {
        setError(getErrorMessage(result.error));
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    if (error?.includes('user-not-found')) return 'Bu email bilan foydalanuvchi topilmadi';
    if (error?.includes('wrong-password')) return 'Parol noto\'g\'ri';
    if (error?.includes('too-many-requests')) return 'Juda ko\'p urinish. Keyinroq urinib ko\'ring';
    return 'Xatolik yuz berdi. Qaytadan urinib ko\'ring';
  };

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark-surface">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/20 rounded-full blur-2xl opacity-40" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent-purple/20 rounded-full blur-2xl opacity-40" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-xl bg-brand-500 flex items-center justify-center mx-auto mb-8 ">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              ChatBot Edu
            </h2>
            <p className="text-slate-400 text-lg max-w-sm mx-auto">
              AI va chatbot yaratishni o'rganishning eng zamonaviy platformasi
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 w-full max-w-md">
            {[
              { label: "Talabalar", value: "5,000+" },
              { label: "Kurslar", value: "120+" },
              { label: "O'qituvchilar", value: "50+" },
              { label: "Sertifikatlar", value: "3,000+" },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-xl p-4 text-center border border-dark-border">
                <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Bosh sahifaga qaytish
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Kirish</h1>
            <p className="text-slate-400">Hisobingizga kiring va o'rganishni davom eting</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Email manzil</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="edu-input pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-400 text-sm">Parol</label>
                <Link href="/auth/forgot-password" className="text-brand-400 hover:text-brand-300 text-sm transition-colors">
                  Parolni unutdingizmi?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="edu-input pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 text-white font-semibold py-3 rounded-lg hover:bg-brand-600 transition-all duration-200  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Kirish...
                </>
              ) : 'Kirish'}
            </button>
          </form>

          <div className="relative flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-slate-500 text-sm">yoki</span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full glass border border-dark-border hover:border-brand-500/50 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Chrome className="w-5 h-5 text-blue-400" />
            Google orqali kirish
          </button>

          <p className="text-center text-slate-400 text-sm mt-8">
            Hisobingiz yo'qmi?{' '}
            <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Ro'yxatdan o'ting
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 p-4 bg-dark-surface rounded-xl border border-dark-border">
            <p className="text-slate-500 text-xs mb-3 font-medium uppercase tracking-wide">Demo hisoblar</p>
            <div className="space-y-2">
              {[
                { role: 'Admin', email: 'admin@chatbotedu.uz', badge: 'badge-admin' },
                { role: 'Teacher', email: 'teacher@chatbotedu.uz', badge: 'badge-teacher' },
                { role: 'Student', email: 'student@chatbotedu.uz', badge: 'badge-student' },
              ].map((demo, i) => (
                <button
                  key={i}
                  onClick={() => { setEmail(demo.email); setPassword('demo123456'); }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-card transition-colors"
                >
                  <span className={demo.badge}>{demo.role}</span>
                  <span className="text-slate-400 text-sm">{demo.email}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
