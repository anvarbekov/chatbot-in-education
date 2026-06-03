'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Plus, Trash2, Upload, Globe, Lock,
  GripVertical, Save, Loader2, Image as ImageIcon, X, Check,
  FileText
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '@/app/dashboard/layout';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';

const LEVELS = ["Boshlang'ich", "O'rta", 'Yuqori'];
const CATEGORIES = ['Chatbot Asoslari', 'LangChain', 'RAG', 'API Integration', 'Deploy', 'Fine-tuning', 'Prompt Engineering'];
const GRADIENTS = [
  { label: 'Okean', value: 'from-blue-600 to-cyan-500' },
  { label: 'Binafsha', value: 'from-purple-600 to-pink-500' },
  { label: 'Yashil', value: 'from-emerald-600 to-teal-500' },
  { label: "Qizil-To'q", value: 'from-orange-600 to-red-500' },
  { label: 'Kechki', value: 'from-indigo-600 to-purple-600' },
  { label: 'Oltin', value: 'from-amber-500 to-orange-500' },
];

// ── PDF Upload Area ────────────────────────────────────────────────────────────
function PdfUploadSection({ pdfs, onAddPdf, onRemovePdf, uploading }) {
  const [dragFile, setDragFile] = useState(null);
  const [pdfTitle, setPdfTitle] = useState('');

  const onDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Fayl 10MB dan kichik bo\'lishi kerak'); return; }
    setDragFile(file);
    if (!pdfTitle) setPdfTitle(file.name.replace('.pdf', ''));
  }, [pdfTitle]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  const handleAdd = async () => {
    if (!dragFile) return;
    await onAddPdf(dragFile, pdfTitle || dragFile.name.replace('.pdf', ''));
    setDragFile(null);
    setPdfTitle('');
  };

  return (
    <div className="bg-dark-card rounded-xl border border-dark-border p-5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-4 h-4 text-brand-400" />
        PDF Materiallar
        <span className="text-slate-600 text-xs font-normal">(ixtiyoriy)</span>
      </h3>

      {/* Uploaded PDFs list */}
      {pdfs.length > 0 && (
        <div className="space-y-2 mb-4">
          {pdfs.map((pdf, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-dark-surface border border-dark-border rounded-xl">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-medium truncate">{pdf.name}</p>
                <p className="text-slate-600 text-xs">{pdf.size}</p>
              </div>
              {pdf.uploading ? (
                <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
              ) : (
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <button onClick={() => onRemovePdf(i)} className="p-1 text-slate-600 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all mb-3 ${
        isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-dark-border hover:border-brand-500/40 hover:bg-dark-surface'
      }`}>
        <input {...getInputProps()} />
        {dragFile ? (
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{dragFile.name}</p>
              <p className="text-slate-500 text-xs">{(dragFile.size/1024/1024).toFixed(2)} MB</p>
            </div>
            <button onClick={e => { e.stopPropagation(); setDragFile(null); setPdfTitle(''); }}
              className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">{isDragActive ? 'Tashlang!' : 'PDF faylni tashlang yoki bosing'}</p>
            <p className="text-slate-600 text-xs mt-1">Maksimal: 10 MB</p>
          </div>
        )}
      </div>

      {dragFile && (
        <div className="flex gap-2">
          <input
            value={pdfTitle}
            onChange={e => setPdfTitle(e.target.value)}
            placeholder="PDF nomi"
            className="flex-1 bg-dark-surface border border-dark-border text-slate-300 placeholder-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={handleAdd}
            disabled={uploading}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Qo'shish
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NewCoursePage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [coursePdfs, setCoursePdfs] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    level: "Boshlang'ich",
    category: 'Chatbot Asoslari',
    duration: '',
    isPublic: true,
    coverGradient: 'from-blue-600 to-cyan-500',
    coverImage: '',
    tags: [],
    requirements: [''],
    objectives: [''],
    resources: [],
  });

  const [lessons, setLessons] = useState([
    { id: 1, title: '', content: '', duration: '10 daq', videoUrl: '', order: 0 }
  ]);
  const [tagInput, setTagInput] = useState('');

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const addLesson = () => setLessons(prev => [...prev, { id: Date.now(), title: '', content: '', duration: '10 daq', videoUrl: '', order: prev.length }]);
  const removeLesson = (id) => setLessons(prev => prev.filter(l => l.id !== id));
  const updateLesson = (id, key, val) => setLessons(prev => prev.map(l => l.id === id ? { ...l, [key]: val } : l));
  const addTag = () => { if (tagInput.trim() && !form.tags.includes(tagInput.trim())) { update('tags', [...form.tags, tagInput.trim()]); setTagInput(''); } };
  const updateListItem = (key, index, val) => { const arr = [...form[key]]; arr[index] = val; update(key, arr); };
  const addListItem = (key) => update(key, [...form[key], '']);
  const removeListItem = (key, index) => update(key, form[key].filter((_, i) => i !== index));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'courses');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) { update('coverImage', data.url); toast.success('Rasm yuklandi!'); }
    } catch { toast.error('Rasm yuklashda xatolik'); }
    finally { setUploadingCover(false); }
  };

  const handleAddPdf = async (file, pdfTitle) => {
    // Add placeholder immediately
    const placeholder = { name: pdfTitle, size: (file.size/1024/1024).toFixed(2) + ' MB', uploading: true };
    setCoursePdfs(prev => [...prev, placeholder]);
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'course-pdfs');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setCoursePdfs(prev => prev.map((p, i) => i === prev.length - 1
          ? { name: pdfTitle, size: (file.size/1024/1024).toFixed(2) + ' MB', url: data.url, publicId: data.publicId || '', uploading: false }
          : p
        ));
        toast.success('PDF qo\'shildi!');
      } else throw new Error(data.error || 'Upload failed');
    } catch (e) {
      setCoursePdfs(prev => prev.slice(0, -1));
      toast.error('PDF yuklashda xatolik: ' + e.message);
    }
    finally { setUploadingPdf(false); }
  };

  const handleRemovePdf = (index) => {
    setCoursePdfs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Kurs nomini kiriting'); return; }
    if (!form.description.trim()) { toast.error('Tavsifni kiriting'); return; }
    if (lessons.some(l => !l.title.trim())) { toast.error("Barcha darslar uchun nom kiriting"); return; }

    setSaving(true);
    try {
      const courseData = {
        ...form,
        teacherId: userProfile.uid,
        teacherName: userProfile.displayName,
        teacherEmail: userProfile.email,
        lessonsCount: lessons.length,
        studentsCount: 0,
        rating: 0,
        isNew: true,
        requirements: form.requirements.filter(Boolean),
        objectives: form.objectives.filter(Boolean),
        pdfs: coursePdfs.filter(p => !p.uploading && p.url),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const courseRef = await addDoc(collection(db, 'courses'), courseData);

      // Add lessons
      const lessonPromises = lessons.map((lesson, i) =>
        addDoc(collection(db, 'lessons'), { ...lesson, courseId: courseRef.id, order: i, createdAt: serverTimestamp() })
      );
      await Promise.all(lessonPromises);

      // Save PDFs to resources collection
      const pdfPromises = coursePdfs
        .filter(p => !p.uploading && p.url)
        .map(pdf => addDoc(collection(db, 'resources'), {
          name: pdf.name,
          url: pdf.url,
          publicId: pdf.publicId || '',
          size: pdf.size,
          type: 'pdf',
          courseId: courseRef.id,
          courseName: form.title,
          uploaderId: userProfile.uid,
          uploaderName: userProfile.displayName,
          uploadedAt: serverTimestamp(),
        }));
      await Promise.all(pdfPromises);

      // Update user's created courses
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', userProfile.uid), { createdCourses: arrayUnion(courseRef.id) });

      toast.success('Kurs muvaffaqiyatli yaratildi!');
      router.push(`/courses/${courseRef.id}`);
    } catch (e) {
      toast.error('Xatolik: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/teacher/courses" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-surface transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Yangi Kurs Yaratish</h1>
              <p className="text-slate-500 text-sm">Kurs ma'lumotlarini to'ldiring</p>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 bg-brand-500 text-white font-medium px-6 py-3 rounded-xl hover:opacity-90 transition-all  disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Saqlash
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic info */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6 space-y-4">
              <h2 className="text-white font-semibold">Asosiy Ma'lumotlar</h2>
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Kurs nomi *</label>
                <input value={form.title} onChange={e => update('title', e.target.value)}
                  placeholder="Masalan: ChatBot Asoslari bilan Python" className="edu-input" />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Tavsif *</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)}
                  placeholder="Kurs haqida batafsil yozing..." rows={4} className="edu-input resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Daraja</label>
                  <select value={form.level} onChange={e => update('level', e.target.value)} className="edu-input">
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Kategoriya</label>
                  <select value={form.category} onChange={e => update('category', e.target.value)} className="edu-input">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Davomiylik (masalan: 20 soat)</label>
                <input value={form.duration} onChange={e => update('duration', e.target.value)}
                  placeholder="20 soat" className="edu-input" />
              </div>
              {/* Tags */}
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Teglar</label>
                <div className="flex gap-2 mb-2">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Teg kiriting va Enter bosing" className="edu-input flex-1" />
                  <button onClick={addTag} className="px-4 py-2 bg-brand-500/20 border border-brand-500/30 text-brand-400 rounded-xl hover:bg-brand-500/30 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-dark-surface border border-dark-border text-slate-300 text-sm px-3 py-1 rounded-full">
                      {tag}
                      <button onClick={() => update('tags', form.tags.filter((_, j) => j !== i))}><X className="w-3 h-3 text-slate-500 hover:text-white" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Objectives & Requirements */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">O'quv Maqsadlari</h3>
                  <button onClick={() => addListItem('objectives')} className="text-brand-400 text-xs hover:text-brand-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Qo'shish</button>
                </div>
                {form.objectives.map((obj, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={obj} onChange={e => updateListItem('objectives', i, e.target.value)} placeholder={`Maqsad ${i + 1}`} className="edu-input flex-1 text-sm" />
                    {form.objectives.length > 1 && (<button onClick={() => removeListItem('objectives', i)} className="text-slate-600 hover:text-red-400 p-2"><Trash2 className="w-4 h-4" /></button>)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Talablar</h3>
                  <button onClick={() => addListItem('requirements')} className="text-brand-400 text-xs hover:text-brand-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Qo'shish</button>
                </div>
                {form.requirements.map((req, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={req} onChange={e => updateListItem('requirements', i, e.target.value)} placeholder={`Talab ${i + 1}`} className="edu-input flex-1 text-sm" />
                    {form.requirements.length > 1 && (<button onClick={() => removeListItem('requirements', i)} className="text-slate-600 hover:text-red-400 p-2"><Trash2 className="w-4 h-4" /></button>)}
                  </div>
                ))}
              </div>
            </div>

            {/* Lessons */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Darslar ({lessons.length})</h2>
                <button onClick={addLesson}
                  className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm px-4 py-2 rounded-xl hover:bg-brand-500/20 transition-colors">
                  <Plus className="w-4 h-4" /> Dars qo'shish
                </button>
              </div>
              <div className="space-y-4">
                {lessons.map((lesson, i) => (
                  <div key={lesson.id} className="bg-dark-surface border border-dark-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <GripVertical className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-400 text-sm font-medium">Dars {i + 1}</span>
                      <div className="flex-1" />
                      {lessons.length > 1 && (
                        <button onClick={() => removeLesson(lesson.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <input value={lesson.title} onChange={e => updateLesson(lesson.id, 'title', e.target.value)} placeholder="Dars nomi" className="edu-input text-sm" />
                      <div className="grid grid-cols-2 gap-3">
                        <input value={lesson.duration} onChange={e => updateLesson(lesson.id, 'duration', e.target.value)} placeholder="Davomiyligi (10 daq)" className="edu-input text-sm" />
                        <input value={lesson.videoUrl} onChange={e => updateLesson(lesson.id, 'videoUrl', e.target.value)} placeholder="Video URL (YouTube embed)" className="edu-input text-sm" />
                      </div>
                      <textarea value={lesson.content} onChange={e => updateLesson(lesson.id, 'content', e.target.value)}
                        placeholder="Dars mazmuni (Markdown qo'llab-quvvatlanadi)" rows={3} className="edu-input text-sm resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PDF Upload */}
            <PdfUploadSection
              pdfs={coursePdfs}
              onAddPdf={handleAddPdf}
              onRemovePdf={handleRemovePdf}
              uploading={uploadingPdf}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Access type */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <h3 className="text-white font-semibold mb-4">Kirish Turi</h3>
              <div className="space-y-2">
                {[
                  { val: true, icon: Globe, label: 'Ochiq Kurs', desc: 'Hamma yozila oladi', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/40' },
                  { val: false, icon: Lock, label: 'Yopiq Kurs', desc: "Faqat tasdiqlangan talabalar", color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/40' },
                ].map(opt => (
                  <button key={String(opt.val)} onClick={() => update('isPublic', opt.val)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${form.isPublic === opt.val ? opt.bg : 'border-dark-border hover:border-slate-600'}`}>
                    <opt.icon className={`w-5 h-5 ${opt.color}`} />
                    <div className="text-left">
                      <p className="text-white text-sm font-medium">{opt.label}</p>
                      <p className="text-slate-500 text-xs">{opt.desc}</p>
                    </div>
                    {form.isPublic === opt.val && <Check className="w-4 h-4 text-emerald-400 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <h3 className="text-white font-semibold mb-4">Muqova</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {GRADIENTS.map(g => (
                  <button key={g.value} onClick={() => update('coverGradient', g.value)}
                    className={`h-12 rounded-xl bg-gradient-to-br ${g.value} relative ${form.coverGradient === g.value ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-card' : ''}`}>
                    {form.coverGradient === g.value && <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />}
                  </button>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-dark-border rounded-xl p-4 cursor-pointer hover:border-brand-500/50 transition-colors">
                {uploadingCover ? <Loader2 className="w-5 h-5 text-brand-400 animate-spin" /> : <ImageIcon className="w-5 h-5 text-slate-500" />}
                <span className="text-slate-500 text-sm">{form.coverImage ? 'Rasm yuklandi ✓' : 'Rasm yuklash (ixtiyoriy)'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            {/* PDF summary */}
            {coursePdfs.length > 0 && (
              <div className="bg-dark-card rounded-xl border border-dark-border p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-400" />
                  Yuklangan PDFlar
                </h3>
                <div className="space-y-2">
                  {coursePdfs.map((pdf, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${pdf.uploading ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400'}`} />
                      <span className="text-slate-300 truncate flex-1">{pdf.name}</span>
                      <span className="text-slate-600 text-xs">{pdf.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
              <div className={`h-28 bg-gradient-to-br ${form.coverGradient} flex items-end p-4`}>
                <div>
                  <p className="text-white/70 text-xs mb-1">{form.level}</p>
                  <p className="text-white font-semibold text-sm line-clamp-1">{form.title || 'Kurs nomi...'}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-slate-500 text-xs mb-2 line-clamp-2">{form.description || 'Tavsif...'}</p>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{lessons.length} dars</span>
                  <span>{coursePdfs.filter(p => !p.uploading).length} PDF</span>
                  <span>{form.isPublic ? '🌐 Ochiq' : '🔒 Yopiq'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
