'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Globe, Lock, Check, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '@/app/dashboard/layout';

const LEVELS = ["Boshlang'ich", "O'rta", 'Yuqori'];
const CATEGORIES = ['Chatbot Asoslari', 'LangChain', 'RAG', 'API Integration', 'Deploy', 'Fine-tuning', 'Prompt Engineering'];
const GRADIENTS = [
  { label: 'Okean', value: 'from-blue-600 to-cyan-500' },
  { label: 'Binafsha', value: 'from-purple-600 to-pink-500' },
  { label: 'Yashil', value: 'from-emerald-600 to-teal-500' },
  { label: "Qizil", value: 'from-orange-600 to-red-500' },
  { label: 'Indigo', value: 'from-indigo-600 to-purple-600' },
  { label: 'Oltin', value: 'from-amber-500 to-orange-500' },
];

export default function EditCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const { userProfile, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', level: "Boshlang'ich",
    category: 'Chatbot Asoslari', duration: '',
    isPublic: true, coverGradient: 'from-blue-600 to-cyan-500',
  });

  useEffect(() => { if (id) fetchCourse(); }, [id]);

  const fetchCourse = async () => {
    try {
      const snap = await getDoc(doc(db, 'courses', id));
      if (!snap.exists()) { router.push('/courses'); return; }
      const data = snap.data();
      // Access check
      if (!isAdmin && data.teacherId !== userProfile?.uid) {
        toast.error('Ruxsat yo\'q'); router.push('/courses'); return;
      }
      setForm({
        title: data.title || '',
        description: data.description || '',
        level: data.level || "Boshlang'ich",
        category: data.category || 'Chatbot Asoslari',
        duration: data.duration || '',
        isPublic: data.isPublic !== false,
        coverGradient: data.coverGradient || 'from-blue-600 to-cyan-500',
      });
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Sarlavha kiriting'); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'courses', id), { ...form, updatedAt: serverTimestamp() });
      toast.success('Kurs yangilandi!');
      router.push(`/courses/${id}`);
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Kursni o'chirishni tasdiqlaysizmi? Barcha darslar ham o'chadi.")) return;
    try {
      await deleteDoc(doc(db, 'courses', id));
      toast.success("Kurs o'chirildi");
      router.push('/courses');
    } catch (e) { toast.error(e.message); }
  };

  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto"><div className="skeleton h-96 rounded-xl" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href={`/courses/${id}`} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-surface transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Kursni Tahrirlash</h1>
              <p className="text-slate-500 text-sm">O'zgarishlarni saqlang</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDelete}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2.5 rounded-xl hover:bg-red-500/20 transition-all">
              <Trash2 className="w-4 h-4" /> O'chirish
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-brand-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 ">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Saqlash
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {/* Basic info */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
            <h2 className="text-white font-semibold">Asosiy Ma'lumotlar</h2>
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Kurs nomi *</label>
              <input value={form.title} onChange={e => up('title', e.target.value)} placeholder="Kurs nomi"
                className="w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Tavsif</label>
              <textarea value={form.description} onChange={e => up('description', e.target.value)} rows={4} placeholder="Kurs haqida..."
                className="w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Daraja</label>
                <select value={form.level} onChange={e => up('level', e.target.value)}
                  className="w-full bg-dark-surface border border-dark-border text-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500">
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Kategoriya</label>
                <select value={form.category} onChange={e => up('category', e.target.value)}
                  className="w-full bg-dark-surface border border-dark-border text-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Davomiylik</label>
                <input value={form.duration} onChange={e => up('duration', e.target.value)} placeholder="20 soat"
                  className="w-full bg-dark-surface border border-dark-border text-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
              </div>
            </div>
          </div>

          {/* Access */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">Kirish Turi</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: true, icon: Globe, label: 'Ochiq Kurs', desc: 'Hamma yozila oladi', col: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/50' },
                { val: false, icon: Lock, label: 'Yopiq Kurs', desc: "Faqat tasdiqlangan", col: 'text-red-400', bg: 'bg-red-500/10 border-red-500/50' },
              ].map(opt => (
                <button key={String(opt.val)} onClick={() => up('isPublic', opt.val)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${form.isPublic === opt.val ? opt.bg : 'border-dark-border hover:border-slate-600'}`}>
                  <opt.icon className={`w-5 h-5 ${opt.col}`} />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{opt.label}</p>
                    <p className="text-slate-500 text-xs">{opt.desc}</p>
                  </div>
                  {form.isPublic === opt.val && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Cover gradient */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">Muqova Rangi</h2>
            <div className="grid grid-cols-6 gap-3">
              {GRADIENTS.map(g => (
                <button key={g.value} onClick={() => up('coverGradient', g.value)}
                  className={`h-14 rounded-xl bg-gradient-to-br ${g.value} relative transition-all ${form.coverGradient === g.value ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-card scale-105' : 'hover:scale-105'}`}>
                  {form.coverGradient === g.value && <Check className="w-5 h-5 text-white absolute inset-0 m-auto" />}
                </button>
              ))}
            </div>
            {/* Preview */}
            <div className={`mt-4 h-24 rounded-xl bg-gradient-to-br ${form.coverGradient} flex items-end p-4`}>
              <p className="text-white font-semibold truncate">{form.title || 'Kurs nomi'}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
