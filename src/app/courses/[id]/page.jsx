'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Clock, Users, Lock, Globe, Play, FileText,
  MessageSquare, ArrowLeft, Award, Send, Check, Download,
  Loader2, ThumbsUp, Plus, Trash2, Edit2, X, Save,
  GripVertical, Link as LinkIcon, Upload, Eye, Video
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  doc, getDoc, collection, query, where, orderBy,
  getDocs, addDoc, updateDoc, deleteDoc, arrayUnion,
  serverTimestamp, increment, onSnapshot
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import DashboardLayout from '@/app/dashboard/layout';

// ── helpers ──────────────────────────────────────────────
function embedUrl(url) {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) return url;
  const m1 = url.match(/youtu\.be\/([^?&]+)/);
  if (m1) return `https://www.youtube.com/embed/${m1[1]}`;
  const m2 = url.match(/[?&]v=([^&]+)/);
  if (m2) return `https://www.youtube.com/embed/${m2[1]}`;
  const m3 = url.match(/shorts\/([^?&]+)/);
  if (m3) return `https://www.youtube.com/embed/${m3[1]}`;
  return null;
}

// ── LessonForm ────────────────────────────────────────────
function LessonForm({ lesson, onSave, onCancel }) {
  const [form, setForm] = useState(lesson || { title: '', content: '', videoUrl: '', duration: '10 daq' });
  const [saving, setSaving] = useState(false);
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handle = async () => {
    if (!form.title.trim()) { toast.error('Dars nomini kiriting'); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="bg-dark-surface border border-brand-500/30 rounded-xl p-4 space-y-3">
      <input value={form.title} onChange={e => up('title', e.target.value)} placeholder="Dars nomi *"
        className="w-full bg-dark-bg border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
      <div className="grid grid-cols-2 gap-3">
        <input value={form.videoUrl} onChange={e => up('videoUrl', e.target.value)} placeholder="YouTube URL (ixtiyoriy)"
          className="w-full bg-dark-bg border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
        <input value={form.duration} onChange={e => up('duration', e.target.value)} placeholder="Davomiyligi (10 daq)"
          className="w-full bg-dark-bg border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
      </div>
      <textarea value={form.content} onChange={e => up('content', e.target.value)} placeholder="Dars mazmuni (ixtiyoriy)" rows={3}
        className="w-full bg-dark-bg border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 resize-none" />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 border border-dark-border text-slate-400 hover:text-white rounded-xl text-sm transition-colors">Bekor</button>
        <button onClick={handle} disabled={saving}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-xl text-sm disabled:opacity-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Saqlash
        </button>
      </div>
    </div>
  );
}

// ── ResourceForm ──────────────────────────────────────────
function ResourceUpload({ courseId, onDone }) {
  const [type, setType] = useState('link');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const onDrop = useCallback(files => setFile(files[0]), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });

  const save = async () => {
    if (!name.trim()) { toast.error('Nom kiriting'); return; }
    setUploading(true);
    try {
      let finalUrl = url;
      if (type === 'file' && file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'course-resources');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!data.url) throw new Error(data.error || 'Upload failed');
        finalUrl = data.url;
      }
      if (!finalUrl.trim()) { toast.error("URL yoki fayl kiriting"); return; }
      await addDoc(collection(db, 'courseResources'), {
        courseId, name: name.trim(), url: finalUrl,
        type: file ? (file.type.includes('pdf') ? 'pdf' : 'file') : 'link',
        size: file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : '',
        createdAt: serverTimestamp(),
      });
      toast.success("Material qo'shildi!");
      setName(''); setUrl(''); setFile(null);
      onDone();
    } catch (e) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="bg-dark-surface border border-brand-500/30 rounded-xl p-4 space-y-3">
      <div className="flex gap-2">
        {['link', 'file'].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${type === t ? 'bg-brand-500/20 border-brand-500/50 text-brand-400' : 'border-dark-border text-slate-500 hover:text-slate-300'}`}>
            {t === 'link' ? '🔗 URL Link' : '📁 Fayl Yuklash'}
          </button>
        ))}
      </div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Material nomi *"
        className="w-full bg-dark-bg border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
      {type === 'link' ? (
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://... (YouTube, PDF, boshqa)"
          className="w-full bg-dark-bg border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
      ) : (
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-dark-border hover:border-brand-500/50'}`}>
          <input {...getInputProps()} />
          {file ? (
            <p className="text-slate-300 text-sm">{file.name} <span className="text-slate-500">({(file.size/1024/1024).toFixed(2)} MB)</span></p>
          ) : (
            <p className="text-slate-500 text-sm">{isDragActive ? 'Tashlang!' : 'Fayl tanlang yoki tashlang (PDF, video, rasm)'}</p>
          )}
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <button onClick={onDone} className="px-4 py-2 border border-dark-border text-slate-400 hover:text-white rounded-xl text-sm transition-colors">Bekor</button>
        <button onClick={save} disabled={uploading}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-xl text-sm disabled:opacity-50">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Qo'shish
        </button>
      </div>
    </div>
  );
}

// ── CommentSection ────────────────────────────────────────
function CommentSection({ courseId, userProfile }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    // realtime listener — izohlar o'chib ketmasligi uchun
    const q = query(
      collection(db, 'comments'),
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => {
      // index yo'q bo'lsa createdAt bo'lmagan izohlarni ko'rsatamiz
      console.warn('Comments index needed:', err.message);
      getDocs(collection(db, 'comments')).then(s => {
        const all = s.docs.map(d => ({ id: d.id, ...d.data() }))
          .filter(c => c.courseId === courseId)
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setComments(all);
      });
    });
    return () => unsub();
  }, [courseId]);

  const submit = async () => {
    if (!text.trim()) return;
    if (!userProfile) { toast.error('Tizimga kiring'); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, 'comments'), {
        courseId,
        userId: userProfile.uid,
        userName: userProfile.displayName || 'Foydalanuvchi',
        userRole: userProfile.role || 'student',
        text: text.trim(),
        likes: 0,
        createdAt: serverTimestamp(),
      });
      setText('');
      toast.success('Fikr qoldirildi!');
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const deleteComment = async (id) => {
    try {
      await deleteDoc(doc(db, 'comments', id));
      toast.success("O'chirildi");
    } catch (e) { toast.error(e.message); }
  };

  const isAdminOrTeacher = ['admin', 'teacher'].includes(userProfile?.role);

  return (
    <div className="space-y-4">
      {userProfile ? (
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {userProfile.displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <textarea value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) submit(); }}
              placeholder="Fikringizni yozing... (Ctrl+Enter yuborish)" rows={3}
              className="w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 resize-none transition-all" />
            <div className="flex justify-end mt-2">
              <button onClick={submit} disabled={loading || !text.trim()}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm px-5 py-2 rounded-xl disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Yuborish
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-slate-500 text-sm">Fikr qoldirish uchun <Link href="/auth/login" className="text-brand-400 hover:underline">tizimga kiring</Link></p>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Hali fikr yo'q. Birinchi bo'ling!</p>
        </div>
      ) : (
        comments.map(c => (
          <div key={c.id} className="flex gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {c.userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 bg-dark-surface border border-dark-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-medium text-sm">{c.userName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    c.userRole === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    c.userRole === 'teacher' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {c.userRole === 'admin' ? 'Admin' : c.userRole === 'teacher' ? "O'qituvchi" : 'Talaba'}
                  </span>
                  <span className="text-slate-600 text-xs">{c.createdAt?.toDate?.()?.toLocaleDateString('uz-UZ') || 'Hozir'}</span>
                </div>
                {(isAdminOrTeacher || c.userId === userProfile?.uid) && (
                  <button onClick={() => deleteComment(c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">{c.text}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { userProfile, isAdmin, isTeacher } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [tab, setTab] = useState('content');
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);

  // Editor states
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [showResourceForm, setShowResourceForm] = useState(false);

  const isEnrolled = userProfile?.enrolledCourses?.includes(id);
  const isOwner = course?.teacherId === userProfile?.uid;
  const canEdit = isAdmin || isOwner;
  const hasAccess = isEnrolled || canEdit;

  useEffect(() => { if (id) { fetchCourse(); fetchLessons(); fetchResources(); } }, [id]);

  const fetchCourse = async () => {
    try {
      const snap = await getDoc(doc(db, 'courses', id));
      if (snap.exists()) setCourse({ id: snap.id, ...snap.data() });
      else router.push('/courses');
    } catch { router.push('/courses'); }
    finally { setLoading(false); }
  };

  const fetchLessons = async () => {
    try {
      // index talab qilmaydigan sodda query
      const snap = await getDocs(collection(db, 'lessons'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(l => l.courseId === id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setLessons(data);
      if (data.length > 0 && !activeLesson) setActiveLesson(data[0]);
    } catch (e) { console.error(e); }
  };

  const fetchResources = async () => {
    try {
      const snap = await getDocs(collection(db, 'courseResources'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(r => r.courseId === id)
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setResources(data);
    } catch (e) { console.error(e); }
  };

  // ── Lesson CRUD ──
  const saveLesson = async (form) => {
    try {
      if (editLesson) {
        await updateDoc(doc(db, 'lessons', editLesson.id), { ...form, updatedAt: serverTimestamp() });
        toast.success('Dars yangilandi!');
      } else {
        await addDoc(collection(db, 'lessons'), {
          ...form, courseId: id, order: lessons.length, createdAt: serverTimestamp(),
        });
        // update lessonsCount
        await updateDoc(doc(db, 'courses', id), { lessonsCount: increment(1) });
        toast.success('Dars qo\'shildi!');
      }
      setShowLessonForm(false);
      setEditLesson(null);
      fetchLessons();
    } catch (e) { toast.error(e.message); }
  };

  const deleteLesson = async (lessonId) => {
    if (!confirm("Darsni o'chirmoqchimisiz?")) return;
    try {
      await deleteDoc(doc(db, 'lessons', lessonId));
      await updateDoc(doc(db, 'courses', id), { lessonsCount: increment(-1) });
      setLessons(p => p.filter(l => l.id !== lessonId));
      if (activeLesson?.id === lessonId) setActiveLesson(null);
      toast.success("O'chirildi");
    } catch (e) { toast.error(e.message); }
  };

  // ── Resource CRUD ──
  const deleteResource = async (resId) => {
    if (!confirm("O'chirmoqchimisiz?")) return;
    try {
      await deleteDoc(doc(db, 'courseResources', resId));
      setResources(p => p.filter(r => r.id !== resId));
      toast.success("O'chirildi");
    } catch (e) { toast.error(e.message); }
  };

  // ── Enroll ──
  const handleEnroll = async () => {
    if (!userProfile) { toast.error('Avval tizimga kiring'); return; }
    setEnrollLoading(true);
    try {
      if (course.isPublic) {
        await updateDoc(doc(db, 'users', userProfile.uid), { enrolledCourses: arrayUnion(id) });
        await updateDoc(doc(db, 'courses', id), { studentsCount: increment(1) });
        toast.success('Kursga muvaffaqiyatli yozildingiz!');
        window.location.reload();
      } else {
        await addDoc(collection(db, 'enrollmentRequests'), {
          userId: userProfile.uid, userName: userProfile.displayName,
          userEmail: userProfile.email, courseId: id, courseTitle: course.title,
          status: 'pending', createdAt: serverTimestamp(),
        });
        toast.success("So'rov yuborildi!");
      }
    } catch (e) { toast.error(e.message); }
    finally { setEnrollLoading(false); }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="skeleton h-8 w-40 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 skeleton h-80 rounded-xl" />
          <div className="skeleton h-80 rounded-xl" />
        </div>
      </div>
    </DashboardLayout>
  );

  if (!course) return null;

  const videoUrl = activeLesson ? embedUrl(activeLesson.videoUrl) : null;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/courses" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kurslarga qaytish
          </Link>
          {canEdit && (
            <Link href={`/teacher/courses/${id}/edit`}
              className="ml-auto flex items-center gap-2 bg-dark-surface border border-dark-border text-slate-300 hover:text-white text-sm px-4 py-2 rounded-xl transition-all hover:border-brand-500/50">
              <Edit2 className="w-4 h-4" /> Kursni Tahrirlash
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Course banner */}
            <div className={`rounded-xl bg-gradient-to-br ${course.coverGradient || 'from-brand-800 to-dark-card'} p-8 relative overflow-hidden border border-dark-border`}>
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium border ${course.isPublic ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                    {course.isPublic ? '🌐 Ochiq' : '🔒 Yopiq'}
                  </span>
                  {course.level && <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">{course.level}</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{course.title}</h1>
                <p className="text-white/70 mb-5">{course.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{course.studentsCount || 0} talaba</span>
                  <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{lessons.length} dars</span>
                  {course.duration && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{course.duration}</span>}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-dark-card border border-dark-border rounded-xl p-1">
              {[
                { id: 'content', label: 'Kurs Kontenti', icon: BookOpen },
                { id: 'comments', label: 'Fikrlar', icon: MessageSquare },
                { id: 'resources', label: 'Materiallar', icon: FileText },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40' : 'text-slate-500 hover:text-slate-300'}`}>
                  <t.icon className="w-4 h-4" />{t.label}
                </button>
              ))}
            </div>

            {/* ── TAB: Content ── */}
            {tab === 'content' && (
              <div className="bg-dark-card rounded-xl border border-dark-border p-6 space-y-5">
                {/* Add lesson (canEdit) */}
                {canEdit && (
                  <div>
                    {!showLessonForm ? (
                      <button onClick={() => { setShowLessonForm(true); setEditLesson(null); }}
                        className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm px-4 py-2.5 rounded-xl hover:bg-brand-500/20 transition-all w-full justify-center">
                        <Plus className="w-4 h-4" /> Yangi Dars Qo'shish
                      </button>
                    ) : (
                      <LessonForm lesson={null} onSave={saveLesson} onCancel={() => setShowLessonForm(false)} />
                    )}
                  </div>
                )}

                {/* Active lesson video */}
                {activeLesson && hasAccess ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold text-lg">{activeLesson.title}</h3>
                      {canEdit && (
                        <div className="flex gap-1">
                          <button onClick={() => { setEditLesson(activeLesson); setShowLessonForm(false); }}
                            className="p-2 text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-xl transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteLesson(activeLesson.id)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Edit form inline */}
                    {editLesson?.id === activeLesson.id && (
                      <div className="mb-4">
                        <LessonForm lesson={editLesson} onSave={saveLesson} onCancel={() => setEditLesson(null)} />
                      </div>
                    )}

                    {/* Video */}
                    {videoUrl ? (
                      <div className="aspect-video bg-black rounded-xl overflow-hidden mb-5 border border-dark-border">
                        <iframe src={videoUrl} title={activeLesson.title} className="w-full h-full"
                          allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-dark-surface rounded-xl flex items-center justify-center mb-5 border-2 border-dashed border-dark-border">
                        <div className="text-center">
                          <Video className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                          <p className="text-slate-500 text-sm">
                            {canEdit ? 'Darsni tahrirlash orqali YouTube URL qo\'shing' : 'Bu darsda video yo\'q'}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeLesson.content && (
                      <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-dark-surface rounded-xl p-4 border border-dark-border">
                        {activeLesson.content}
                      </div>
                    )}
                  </div>
                ) : !hasAccess ? (
                  <div className="text-center py-16">
                    <Lock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-slate-300 font-semibold mb-2">Kursga yoziling</h3>
                    <p className="text-slate-500 text-sm">Darslarni ko'rish uchun yoziling</p>
                  </div>
                ) : lessons.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">{canEdit ? "Yuqoridagi tugma orqali dars qo'shing" : 'Dars hali qo\'shilmagan'}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">Chap tomondagi darslardan birini tanlang</p>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Comments ── */}
            {tab === 'comments' && (
              <div className="bg-dark-card rounded-xl border border-dark-border p-6">
                <CommentSection courseId={id} userProfile={userProfile} />
              </div>
            )}

            {/* ── TAB: Resources ── */}
            {tab === 'resources' && (
              <div className="bg-dark-card rounded-xl border border-dark-border p-6 space-y-4">
                {canEdit && (
                  !showResourceForm ? (
                    <button onClick={() => setShowResourceForm(true)}
                      className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm px-4 py-2.5 rounded-xl hover:bg-brand-500/20 transition-all w-full justify-center">
                      <Plus className="w-4 h-4" /> Material / PDF / Video Qo'shish
                    </button>
                  ) : (
                    <ResourceUpload courseId={id} onDone={() => { setShowResourceForm(false); fetchResources(); }} />
                  )
                )}

                {resources.length === 0 ? (
                  <div className="text-center py-10">
                    <FileText className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">{canEdit ? 'Hali material qo\'shilmagan' : 'Material yo\'q'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resources.map(r => {
                      const isVideo = r.url && (r.url.includes('youtube') || r.url.includes('youtu.be'));
                      const isPDF = r.type === 'pdf' || r.url?.toLowerCase().includes('.pdf');
                      return (
                        <div key={r.id} className="flex items-center gap-3 p-4 bg-dark-surface border border-dark-border rounded-xl hover:border-brand-500/40 transition-all group">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isVideo ? 'bg-red-500/20' : isPDF ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                            {isVideo ? <Video className="w-5 h-5 text-red-400" /> : isPDF ? <FileText className="w-5 h-5 text-orange-400" /> : <LinkIcon className="w-5 h-5 text-blue-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 font-medium text-sm truncate">{r.name}</p>
                            <p className="text-slate-600 text-xs mt-0.5">{r.size || (isVideo ? 'YouTube Video' : isPDF ? 'PDF' : 'Link')}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={r.url} target="_blank" rel="noopener noreferrer"
                              className="p-2 text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-xl transition-colors">
                              <Eye className="w-4 h-4" />
                            </a>
                            <a href={r.url} download target="_blank" rel="noopener noreferrer"
                              className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors">
                              <Download className="w-4 h-4" />
                            </a>
                            {canEdit && (
                              <button onClick={() => deleteResource(r.id)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-4">
            {/* Enroll card */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              {hasAccess ? (
                <div className="text-center py-2">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-emerald-400 font-semibold">Kursga yozilgansiz!</p>
                  <p className="text-slate-500 text-sm mt-1">O'rganishni davom eting</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-400 text-sm mb-4">{course.isPublic ? '🌐 Ochiq kurs — bepul kirish' : "🔒 Yopiq kurs — so'rov kerak"}</p>
                  <button onClick={handleEnroll} disabled={enrollLoading}
                    className="w-full bg-brand-500 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all  disabled:opacity-50 flex items-center justify-center gap-2">
                    {enrollLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {course.isPublic ? 'Kursga Yozilish' : "So'rov Yuborish"}
                  </button>
                </>
              )}
            </div>

            {/* Lessons list */}
            <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
              <div className="p-4 border-b border-dark-border flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Darslar</h3>
                <span className="text-slate-500 text-xs">{lessons.length} ta</span>
              </div>
              <div className="p-3 space-y-1 max-h-96 overflow-y-auto">
                {lessons.length === 0 ? (
                  <p className="text-slate-600 text-sm text-center py-6">
                    {canEdit ? (
                      <button onClick={() => { setTab('content'); setShowLessonForm(true); }}
                        className="text-brand-400 hover:text-brand-300">+ Dars qo'shing</button>
                    ) : 'Dars qo\'shilmagan'}
                  </p>
                ) : (
                  lessons.map((lesson, i) => (
                    <div key={lesson.id} className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border ${activeLesson?.id === lesson.id ? 'bg-brand-500/15 border-brand-500/40' : (!hasAccess && i > 0) ? 'opacity-40 cursor-not-allowed border-transparent' : 'hover:bg-dark-surface border-transparent hover:border-dark-border'}`}
                      onClick={() => { if (hasAccess || i === 0) setActiveLesson(lesson); }}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${activeLesson?.id === lesson.id ? 'bg-brand-500 text-white' : 'bg-dark-surface border border-dark-border text-slate-400'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${activeLesson?.id === lesson.id ? 'text-white' : 'text-slate-300'}`}>{lesson.title}</p>
                        <p className="text-slate-600 text-xs">{lesson.duration || '—'}</p>
                      </div>
                      {!hasAccess && i > 0 ? <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" /> : <Play className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Teacher */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <h3 className="text-white font-semibold text-sm mb-4">O'qituvchi</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {course.teacherName?.charAt(0)?.toUpperCase() || 'T'}
                </div>
                <div>
                  <p className="text-white font-medium">{course.teacherName}</p>
                  <p className="text-slate-500 text-xs">Chatbot Mutaxassisi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
