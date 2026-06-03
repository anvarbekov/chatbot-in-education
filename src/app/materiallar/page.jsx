'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Search, ChevronRight, Plus, Edit2, Trash2, Loader2, X, Save, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Barchasi', 'Python', 'JavaScript', 'LangChain', 'API', 'RAG', 'Deploy', 'NLP'];

const defaultMaterials = [
  { id: 'demo1', title: 'Python bilan Telegram Bot yaratish', category: 'Python', description: 'python-telegram-bot kutubxonasi yordamida bosqichma-bosqich bot yaratish.', content: `# Python bilan Telegram Bot Yaratish

## O'rnatish
\`\`\`bash
pip install python-telegram-bot
\`\`\`

## Asosiy Kod
\`\`\`python
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text('Salom! Men botman!')

app = Application.builder().token("YOUR_TOKEN").build()
app.add_handler(CommandHandler("start", start))
app.run_polling()
\`\`\`

## @BotFather orqali Token olish
1. Telegram da @BotFather ga yozing
2. /newbot buyrug'ini yuboring
3. Bot nomini kiriting
4. Token oling`, readTime: '10 daq', level: "Boshlang'ich", createdAt: { toDate: () => new Date() } },
  { id: 'demo2', title: 'Groq API bilan Chatbot', category: 'API', description: "Groq'ning tez LLM API'dan foydalanib chatbot yaratish.", content: `# Groq API bilan Chatbot

## O'rnatish
\`\`\`bash
pip install groq
\`\`\`

## Kod
\`\`\`python
from groq import Groq

client = Groq(api_key="YOUR_GROQ_API_KEY")

def chat(message):
    completion = client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[{"role": "user", "content": message}]
    )
    return completion.choices[0].message.content

print(chat("Salom, qandaysiz?"))
\`\`\``, readTime: '8 daq', level: "O'rta", createdAt: { toDate: () => new Date() } },
  { id: 'demo3', title: 'LangChain RAG Tizimi', category: 'RAG', description: "PDF fayllardan ma'lumot oluvchi RAG chatbot yaratish.", content: `# LangChain bilan RAG Chatbot

## O'rnatish
\`\`\`bash
pip install langchain chromadb sentence-transformers
\`\`\`

## RAG Pipeline
\`\`\`python
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 1. Hujjatni yuklash
from langchain.document_loaders import PyPDFLoader
loader = PyPDFLoader("document.pdf")
docs = loader.load()

# 2. Bo'laklash
splitter = RecursiveCharacterTextSplitter(chunk_size=500)
chunks = splitter.split_documents(docs)

# 3. Vector DB yaratish
embeddings = HuggingFaceEmbeddings()
vectordb = Chroma.from_documents(chunks, embeddings)

# 4. Qidirish
results = vectordb.similarity_search("savol")
\`\`\``, readTime: '15 daq', level: 'Yuqori', createdAt: { toDate: () => new Date() } },
];

function MaterialCard({ material, onEdit, onDelete, isAdmin }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-brand-500/40 transition-all"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs bg-brand-500/20 text-brand-400 border border-brand-500/30 px-2.5 py-0.5 rounded-full">{material.category}</span>
              <span className="text-xs bg-dark-surface text-slate-500 border border-dark-border px-2.5 py-0.5 rounded-full">{material.level}</span>
              <span className="text-xs text-slate-600">{material.readTime}</span>
            </div>
            <h3 className="text-white font-semibold text-lg">{material.title}</h3>
            <p className="text-slate-400 text-sm mt-1">{material.description}</p>
          </div>
          {isAdmin && (
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => onEdit(material)} className="p-2 text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(material.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        </div>
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors mt-3">
          {expanded ? 'Yopish' : "To'liq o'qish"}
          <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>
      {expanded && (
        <div className="border-t border-dark-border p-6 bg-dark-surface">
          <pre className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">{material.content}</pre>
        </div>
      )}
    </motion.div>
  );
}

function MaterialModal({ material, onClose, onSave }) {
  const [form, setForm] = useState(material || { title: '', category: 'Python', description: '', content: '', readTime: '10 daq', level: "Boshlang'ich" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title || !form.content) { toast.error("Sarlavha va mazmunni kiriting"); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-card border border-dark-border rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h3 className="text-white font-semibold">{material?.id ? 'Tahrirlash' : "Yangi Material"}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Sarlavha" className="w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
          <input value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Qisqa tavsif" className="w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
          <div className="grid grid-cols-3 gap-3">
            <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="bg-dark-surface border border-dark-border text-slate-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-brand-500">
              {['Python','JavaScript','LangChain','API','RAG','Deploy','NLP','Boshqa'].map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={form.level} onChange={e => setForm(p => ({...p, level: e.target.value}))} className="bg-dark-surface border border-dark-border text-slate-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-brand-500">
              {["Boshlang'ich","O'rta","Yuqori"].map(l => <option key={l}>{l}</option>)}
            </select>
            <input value={form.readTime} onChange={e => setForm(p => ({...p, readTime: e.target.value}))} placeholder="10 daq" className="bg-dark-surface border border-dark-border text-slate-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-brand-500" />
          </div>
          <textarea value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} placeholder="Mazmun (Markdown, kod bloklari qo'llab-quvvatlanadi)..." rows={12}
            className="w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 resize-none font-mono" />
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

export default function MateriallarPage() {
  const { isAdmin } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Barchasi');
  const [editMaterial, setEditMaterial] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchMaterials(); }, []);

  const fetchMaterials = async () => {
    try {
      const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMaterials(data.length > 0 ? data : defaultMaterials);
    } catch { setMaterials(defaultMaterials); }
    finally { setLoading(false); }
  };

  const handleSave = async (form) => {
    try {
      if (form.id && !form.id.startsWith('demo')) {
        await updateDoc(doc(db, 'materials', form.id), { ...form, updatedAt: serverTimestamp() });
        setMaterials(prev => prev.map(m => m.id === form.id ? { ...form } : m));
        toast.success('Yangilandi!');
      } else {
        const ref = await addDoc(collection(db, 'materials'), { ...form, createdAt: serverTimestamp() });
        setMaterials(prev => [{ id: ref.id, ...form, createdAt: { toDate: () => new Date() } }, ...prev.filter(m => !m.id.startsWith('demo'))]);
        toast.success("Qo'shildi!");
      }
    } catch (e) { toast.error(e.message); }
    setShowModal(false); setEditMaterial(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      if (!id.startsWith('demo')) await deleteDoc(doc(db, 'materials', id));
      setMaterials(prev => prev.filter(m => m.id !== id));
      toast.success("O'chirildi");
    } catch (e) { toast.error(e.message); }
  };

  const filtered = materials.filter(m => {
    const matchSearch = m.title?.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Barchasi' || m.category === category;
    return matchSearch && matchCat;
  });

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
              <Link key={item} href={`/${item.toLowerCase()}`} className={`text-sm transition-colors ${item === 'Materiallar' ? 'text-brand-400' : 'text-slate-400 hover:text-white'}`}>{item}</Link>
            ))}
            <Link href="/dashboard" className="bg-brand-500 hover:bg-brand-600 text-white text-sm px-4 py-2 rounded-xl transition-colors">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">O'quv <span className="text-gradient">Materiallar</span></h1>
            <p className="text-slate-400">Chatbot yaratish bo'yicha kod misollari va qo'llanmalar</p>
          </div>
          {isAdmin && (
            <button onClick={() => { setEditMaterial(null); setShowModal(true); }}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm px-5 py-2.5 rounded-xl transition-colors font-medium">
              <Plus className="w-4 h-4" /> Material qo'shish
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Material qidirish..." className="w-full bg-dark-card border border-dark-border text-slate-300 placeholder-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${category === cat ? 'bg-brand-500/20 border border-brand-500/50 text-brand-400' : 'bg-dark-card border border-dark-border text-slate-400 hover:border-slate-600'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filtered.map((m, i) => (
              <MaterialCard key={m.id} material={m} onEdit={mat => { setEditMaterial(mat); setShowModal(true); }} onDelete={handleDelete} isAdmin={isAdmin} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-20"><BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" /><p className="text-slate-400">Material topilmadi</p></div>
            )}
          </div>
        )}
      </div>

      {showModal && <MaterialModal material={editMaterial} onClose={() => { setShowModal(false); setEditMaterial(null); }} onSave={handleSave} />}
    </div>
  );
}
