'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Search, Plus, Edit2, Trash2, Calendar, User, Clock, X, Save, Loader2, ChevronRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const defaultPosts = [
  { id: 'b1', title: "ChatGPT va Groq: Qaysi biri tezroq?", excerpt: "AI modellarni tezlik bo'yicha taqqoslash va har birining afzalliklari.", category: 'Taqqoslash', readTime: '5 daq', author: 'Admin', createdAt: { toDate: () => new Date('2024-11-01') } },
  { id: 'b2', title: "LangChain 0.3 yangiliklari", excerpt: "LangChain ning so'nggi versiyasidagi muhim o'zgarishlar va yangi funksiyalar.", category: 'Yangiliklar', readTime: '7 daq', author: 'Admin', createdAt: { toDate: () => new Date('2024-11-05') } },
  { id: 'b3', title: "RAG tizimini optimallashtirish", excerpt: "Vector search samaradorligini oshirish bo'yicha amaliy maslahatlar.", category: "Qo'llanma", readTime: '10 daq', author: 'Admin', createdAt: { toDate: () => new Date('2024-11-10') } },
  { id: 'b4', title: "Chatbot uchun Prompt Engineering", excerpt: "LLM modellardan eng yaxshi natija olish uchun prompt yozish texnikalari.", category: "Qo'llanma", readTime: '12 daq', author: 'Admin', createdAt: { toDate: () => new Date('2024-11-15') } },
];

const COLORS = ['from-blue-600 to-cyan-500', 'from-purple-600 to-pink-500', 'from-emerald-600 to-teal-500', 'from-orange-600 to-red-500', 'from-indigo-600 to-purple-600', 'from-amber-500 to-orange-500'];

function BlogModal({ post, onClose, onSave }) {
  const [form, setForm] = useState(post || { title: '', excerpt: '', content: '', category: "Qo'llanma", readTime: '5 daq', author: 'Admin' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title || !form.excerpt) { toast.error('Sarlavha va qisqa tavsifni kiriting'); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-card border border-dark-border rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h3 className="text-white font-semibold">{post?.id ? 'Maqolani tahrirlash' : 'Yangi Maqola'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Maqola sarlavhasi" className="w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
          <input value={form.excerpt} onChange={e => setForm(p => ({...p, excerpt: e.target.value}))} placeholder="Qisqa tavsif" className="w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
          <div className="grid grid-cols-3 gap-3">
            <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="bg-dark-surface border border-dark-border text-slate-300 rounded-xl px-3 py-3 text-sm focus:outline-none">
              {["Qo'llanma", 'Yangiliklar', 'Taqqoslash', 'Intervyu', 'Loyiha'].map(c => <option key={c}>{c}</option>)}
            </select>
            <input value={form.readTime} onChange={e => setForm(p => ({...p, readTime: e.target.value}))} placeholder="5 daq" className="bg-dark-surface border border-dark-border text-slate-300 rounded-xl px-3 py-3 text-sm focus:outline-none" />
            <input value={form.author} onChange={e => setForm(p => ({...p, author: e.target.value}))} placeholder="Muallif" className="bg-dark-surface border border-dark-border text-slate-300 rounded-xl px-3 py-3 text-sm focus:outline-none" />
          </div>
          <textarea value={form.content || ''} onChange={e => setForm(p => ({...p, content: e.target.value}))} placeholder="Maqola matni (Markdown)..." rows={10}
            className="w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 resize-none" />
        </div>
        <div className="p-5 border-t border-dark-border flex gap-3">
          <button onClick={onClose} className="flex-1 border border-dark-border text-slate-400 py-3 rounded-xl text-sm hover:text-white transition-colors">Bekor</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Saqlash
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function BlogPage() {
  const { isAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState(null);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(data.length > 0 ? data : defaultPosts);
    } catch { setPosts(defaultPosts); }
    finally { setLoading(false); }
  };

  const handleSave = async (form) => {
    try {
      if (form.id && !form.id.startsWith('b')) {
        await updateDoc(doc(db, 'blog', form.id), { ...form, updatedAt: serverTimestamp() });
        setPosts(prev => prev.map(p => p.id === form.id ? { ...form } : p));
        toast.success('Yangilandi!');
      } else {
        const ref = await addDoc(collection(db, 'blog'), { ...form, createdAt: serverTimestamp() });
        setPosts(prev => [{ id: ref.id, ...form, createdAt: { toDate: () => new Date() } }, ...prev.filter(p => !p.id.startsWith('b'))]);
        toast.success("Qo'shildi!");
      }
    } catch (e) { toast.error(e.message); }
    setShowModal(false); setEditPost(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      if (!id.startsWith('b')) await deleteDoc(doc(db, 'blog', id));
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success("O'chirildi");
    } catch (e) { toast.error(e.message); }
  };

  const filtered = posts.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.excerpt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-card/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">ChatBot <span className="text-gradient">Edu</span></span>
          </Link>
          <div className="flex items-center gap-4">
            {['Kurslar', 'Materiallar', 'Blog', 'Haqimizda'].map(item => (
              <Link key={item} href={`/${item.toLowerCase()}`} className={`text-sm transition-colors ${item === 'Blog' ? 'text-brand-400' : 'text-slate-400 hover:text-white'}`}>{item}</Link>
            ))}
            <Link href="/dashboard" className="bg-brand-500 hover:bg-brand-600 text-white text-sm px-4 py-2 rounded-xl transition-colors">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">AI <span className="text-gradient">Blog</span></h1>
            <p className="text-slate-400">Chatbot va AI dunyo yangiliklari, qo'llanmalar</p>
          </div>
          {isAdmin && (
            <button onClick={() => { setEditPost(null); setShowModal(true); }}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm px-5 py-2.5 rounded-xl transition-colors font-medium">
              <Plus className="w-4 h-4" /> Maqola qo'shish
            </button>
          )}
        </div>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Maqola qidirish..." className="w-full bg-dark-card border border-dark-border text-slate-300 placeholder-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-56 rounded-xl" />)}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-brand-500/40 transition-all group"
              >
                <div className={`h-36 bg-gradient-to-br ${COLORS[i % COLORS.length]} relative`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-3 left-3">
                    <span className="text-xs bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-full border border-white/20">{post.category}</span>
                  </div>
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditPost(post); setShowModal(true); }} className="p-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-red-500/70 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-white font-semibold mb-2 group-hover:text-brand-400 transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                    </div>
                    <span>{post.createdAt?.toDate?.()?.toLocaleDateString('uz-UZ') || ''}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showModal && <BlogModal post={editPost} onClose={() => { setShowModal(false); setEditPost(null); }} onSave={handleSave} />}
    </div>
  );
}
