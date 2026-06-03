'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, Eye, EyeOff, Mail, Lock, User, ArrowLeft, AlertCircle, GraduationCap, BookOpen, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const roles = [
  { id: 'student', label: 'Talaba', desc: 'Kurslarni o\'rganing', icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  { id: 'teacher', label: 'O\'qituvchi', desc: 'Kurslar yarating', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Barcha maydonlarni to\'ldiring');
      return;
    }
    if (form.password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Parollar mos kelmaydi');
      return;
    }

    setLoading(true);
    try {
      const result = await register(form.email, form.password, form.name, role);
      if (result.success) {
        toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
        router.push('/dashboard');
      } else {
        setError(getErrorMessage(result.error));
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (err) => {
    if (err?.includes('email-already-in-use')) return 'Bu email allaqachon ro\'yxatdan o\'tgan';
    if (err?.includes('weak-password')) return 'Parol juda oddiy';
    if (err?.includes('invalid-email')) return 'Email manzil noto\'g\'ri';
    return 'Xatolik yuz berdi. Qaytadan urinib ko\'ring';
  };

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Left - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md py-8"
        >
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Bosh sahifaga qaytish
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Ro'yxatdan o'tish</h1>
            <p className="text-slate-400">Bepul hisob yarating va o'rganishni boshlang</p>
          </div>

          {/* Role selection */}
          <div className="mb-6">
            <label className="text-slate-400 text-sm mb-3 block">Rolni tanlang</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    role === r.id
                      ? `${r.bg} border-opacity-100`
                      : 'bg-dark-surface border-dark-border hover:border-slate-600'
                  }`}
                >
                  <r.icon className={`w-5 h-5 ${r.color} mb-2`} />
                  <div className="text-white font-medium text-sm">{r.label}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm mb-2 block">To'liq ism</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ism Familiya"
                  className="edu-input pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Email manzil</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="edu-input pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Parol</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Kamida 6 ta belgi"
                  className="edu-input pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Parolni tasdiqlang</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Parolni qayta kiriting"
                  className="edu-input pl-11"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input type="checkbox" className="mt-1 rounded" required />
              <p className="text-slate-400 text-sm">
                <Link href="/terms" className="text-brand-400 hover:text-brand-300">Foydalanish shartlari</Link>
                {' '}va{' '}
                <Link href="/privacy" className="text-brand-400 hover:text-brand-300">Maxfiylik siyosati</Link>
                {' '}bilan roziman
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 text-white font-semibold py-3 rounded-lg hover:bg-brand-600 transition-all duration-200  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ro'yxatdan o'tilmoqda...
                </>
              ) : 'Ro\'yxatdan o\'tish'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Hisobingiz bormi?{' '}
            <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Kirish
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-bl from-accent-purple/20 via-dark-bg to-brand-900/30">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent-purple/20 rounded-full blur-2xl opacity-40" />
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-brand-500/20 rounded-full blur-2xl opacity-40" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="w-full max-w-sm space-y-4">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Nima o'rganasiz?
            </h3>
            {[
              { title: 'Chatbot asoslari', desc: 'API, webhook, NLP', done: true },
              { title: 'LangChain Framework', desc: 'Chain, Memory, Agents', done: true },
              { title: 'RAG Tizimi', desc: 'Vector DB, Embedding', done: false },
              { title: 'Production Deploy', desc: 'Docker, Cloud, CI/CD', done: false },
              { title: 'Fine-tuning', desc: 'Custom model yaratish', done: false },
            ].map((item, i) => (
              <div key={i} className={`glass rounded-xl p-4 border flex items-center gap-4 ${item.done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-dark-border'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-emerald-500 text-white' : 'bg-dark-surface text-slate-500 border border-dark-border'}`}>
                  {item.done ? '✓' : (i + 1)}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{item.title}</div>
                  <div className="text-slate-500 text-xs">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
