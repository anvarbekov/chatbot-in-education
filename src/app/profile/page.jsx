'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User, Mail, Edit2, Save, Camera, Award, BookOpen,
  Clock, Star, Bell, Lock, LogOut, Loader2, Check, Shield
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '@/app/dashboard/layout';

export default function ProfilePage() {
  const { userProfile, refreshProfile, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [form, setForm] = useState({ displayName: '', bio: '', phone: '', location: '', website: '' });

  useEffect(() => {
    if (!authLoading && !userProfile) {
      router.replace('/auth/login');
      return;
    }
    if (userProfile) {
      setForm({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
      });
    }
  }, [userProfile, authLoading]);

  const handleSave = async () => {
    if (!form.displayName.trim()) { toast.error('Ismni kiriting'); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), {
        ...form,
        updatedAt: serverTimestamp(),
      });
      await refreshProfile();
      setEditing(false);
      toast.success('Profil yangilandi!');
    } catch (e) { toast.error('Xatolik: ' + e.message); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Rasm 5MB dan kichik bo\'lsin'); return; }
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'avatars');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        await updateDoc(doc(db, 'users', userProfile.uid), { avatar: data.url, updatedAt: serverTimestamp() });
        await refreshProfile();
        toast.success('Avatar yangilandi!');
      }
    } catch { toast.error('Xatolik'); }
    finally { setAvatarUploading(false); }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    window.location.href = '/';
  };

  // Loading state
  if (authLoading) return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="skeleton h-64 rounded-xl" />
          <div className="lg:col-span-2 skeleton h-64 rounded-xl" />
        </div>
      </div>
    </DashboardLayout>
  );

  if (!userProfile) return null;

  const roleLabel = userProfile.role === 'admin' ? 'Admin' : userProfile.role === 'teacher' ? "O'qituvchi" : 'Talaba';
  const roleBadge = userProfile.role === 'admin' ? 'badge-admin' : userProfile.role === 'teacher' ? 'badge-teacher' : 'badge-student';

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Mening Profilim</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="space-y-5">
            {/* Avatar */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-16 h-16 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-3xl mx-auto overflow-hidden">
                  {userProfile.avatar
                    ? <img src={userProfile.avatar} alt="avatar" className="w-full h-full object-cover" />
                    : userProfile.displayName?.charAt(0)?.toUpperCase()
                  }
                </div>
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center cursor-pointer hover:bg-brand-600 transition-colors ">
                  {avatarUploading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <h2 className="text-white font-semibold text-lg">{userProfile.displayName}</h2>
              <p className="text-slate-400 text-sm mb-3">{userProfile.email}</p>
              <span className={roleBadge}>{roleLabel}</span>
              {userProfile.bio && <p className="text-slate-400 text-sm mt-4 leading-relaxed">{userProfile.bio}</p>}
            </div>

            {/* Stats */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Statistika</h3>
              <div className="space-y-3">
                {[
                  { icon: BookOpen, label: 'Yozilgan kurslar', value: userProfile.enrolledCourses?.length || 0, color: 'text-blue-400' },
                  { icon: Award, label: 'Sertifikatlar', value: userProfile.stats?.certificates || 0, color: 'text-amber-400' },
                  { icon: Clock, label: "O'quv soatlari", value: userProfile.stats?.totalHours || 0, color: 'text-purple-400' },
                  { icon: Star, label: 'Tugallangan', value: userProfile.stats?.coursesCompleted || 0, color: 'text-emerald-400' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <s.icon className={`w-4 h-4 ${s.color}`} /> {s.label}
                    </div>
                    <span className="text-white font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Logout */}
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 py-3 rounded-xl text-sm font-medium transition-all">
              <LogOut className="w-4 h-4" /> Tizimdan Chiqish
            </button>
          </div>

          {/* Right */}
          <div className="lg:col-span-2 space-y-5">
            {/* Edit form */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">Shaxsiy Ma'lumotlar</h3>
                {!editing ? (
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-2 text-brand-400 border border-brand-500/30 px-3 py-1.5 rounded-xl hover:bg-brand-500/10 text-sm transition-all">
                    <Edit2 className="w-3.5 h-3.5" /> Tahrirlash
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-xl transition-colors">Bekor</button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm px-4 py-1.5 rounded-xl disabled:opacity-50">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Saqlash
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {[
                  { key: 'displayName', label: "To'liq ism *", placeholder: 'Ism Familiya' },
                  { key: 'phone', label: 'Telefon', placeholder: '+998 90 123 45 67' },
                  { key: 'location', label: 'Shahar', placeholder: "Toshkent, O'zbekiston" },
                  { key: 'website', label: 'Vebsayt', placeholder: 'https://example.com' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-slate-400 text-sm mb-2 block">{f.label}</label>
                    <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder} disabled={!editing}
                      className={`w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-all ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`} />
                  </div>
                ))}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Bio</label>
                  <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="O'zingiz haqingizda..." rows={3} disabled={!editing}
                    className={`w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 resize-none transition-all ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`} />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dark-border">
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Email (o'zgartirib bo'lmaydi)</label>
                    <p className="text-slate-300 text-sm">{userProfile.email}</p>
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Rol</label>
                    <span className={roleBadge}>{roleLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" /> Xavfsizlik
              </h3>
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-400 text-sm">Hisob xavfsiz holda</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
