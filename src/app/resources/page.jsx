'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Search, Trash2, Download, Eye, Plus, X,
  Loader2, ExternalLink, Calendar, ChevronDown, ChevronRight,
  BookOpen, FolderOpen, Folder
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  orderBy, query, serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '@/app/dashboard/layout';

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onUpload, courses }) {
  const [uploading, setUploading] = useState(false);
  const [dragFile, setDragFile] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('general');
  const [title, setTitle] = useState('');

  const onDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Fayl 10MB dan kichik bo\'lishi kerak'); return; }
    setDragFile(file);
    if (!title) setTitle(file.name.replace('.pdf', ''));
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!dragFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', dragFile);
      formData.append('folder', 'resources');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        const courseName = selectedCourse === 'general'
          ? 'Umumiy'
          : courses.find(c => c.id === selectedCourse)?.title || 'Umumiy';
        await onUpload({
          name: title || dragFile.name.replace('.pdf', ''),
          url: data.url,
          publicId: data.publicId || '',
          size: (dragFile.size / 1024 / 1024).toFixed(2) + ' MB',
          type: 'pdf',
          courseId: selectedCourse,
          courseName,
        });
        onClose();
      } else throw new Error(data.error || 'Upload failed');
    } catch (e) { toast.error('Xatolik: ' + e.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="bg-dark-card border border-dark-border rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h3 className="text-white font-semibold">PDF Yuklash</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Course selector */}
          <div>
            <label className="text-slate-400 text-xs mb-2 block">Kurs tanlash</label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full bg-dark-surface border border-dark-border text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="general">Umumiy (kurs bog'lanmagan)</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-slate-400 text-xs mb-2 block">Fayl nomi</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="PDF fayl nomi..."
              className="w-full bg-dark-surface border border-dark-border text-slate-300 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Dropzone */}
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-dark-border hover:border-brand-500/50 hover:bg-dark-surface'
          }`}>
            <input {...getInputProps()} />
            {dragFile ? (
              <div>
                <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7 text-red-400" />
                </div>
                <p className="text-white font-medium text-sm">{dragFile.name}</p>
                <p className="text-slate-500 text-xs mt-1">{(dragFile.size/1024/1024).toFixed(2)} MB</p>
                <button onClick={e => { e.stopPropagation(); setDragFile(null); }} className="mt-2 text-slate-500 hover:text-red-400 text-xs">Bekor</button>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-medium mb-1">{isDragActive ? 'Tashlang!' : 'PDF faylni tashlang yoki bosing'}</p>
                <p className="text-slate-600 text-sm">Maksimal: 10 MB</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border border-dark-border text-slate-400 hover:text-white py-3 rounded-xl text-sm transition-colors">Bekor</button>
            <button onClick={handleUpload} disabled={!dragFile || uploading}
              className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Yuklanmoqda...</> : <><Upload className="w-4 h-4" />Yuklash</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── PDF Card ──────────────────────────────────────────────────────────────────
function PdfCard({ file, canDelete, onDelete, onView }) {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-brand-500/40 transition-all group">
      <div className="h-36 bg-gradient-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center relative border-b border-dark-border">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
            <FileText className="w-7 h-7 text-red-400" />
          </div>
          <span className="text-red-400 text-xs font-bold bg-red-500/20 px-2 py-0.5 rounded-full">PDF</span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
          <button onClick={() => onView(file)} className="bg-white/90 text-dark-bg text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-white flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> Ko'rish
          </button>
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="bg-brand-500/90 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-brand-500 flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Yuklab
          </a>
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-white font-medium text-sm truncate mb-2" title={file.name}>{file.name}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
          <span>{file.size}</span>
          <span>•</span>
          <span>{file.uploadedAt?.toDate?.()?.toLocaleDateString('uz-UZ') || '—'}</span>
        </div>
        <div className="flex gap-2">
          <a href={file.url} download target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs py-1.5 rounded-lg hover:bg-brand-500/20 transition-colors">
            <Download className="w-3 h-3" /> Yuklab olish
          </a>
          {canDelete && (
            <button onClick={() => onDelete(file)} className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Course Group ──────────────────────────────────────────────────────────────
function CourseGroup({ courseId, courseName, files, canDelete, onDelete, onView }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-dark-surface/50 transition-colors"
      >
        <div className="w-8 h-8 bg-brand-500/10 border border-brand-500/20 rounded-lg flex items-center justify-center">
          {open ? <FolderOpen className="w-4 h-4 text-brand-400" /> : <Folder className="w-4 h-4 text-brand-400" />}
        </div>
        <div className="flex-1 text-left">
          <p className="text-white font-semibold text-sm">{courseName}</p>
          <p className="text-slate-500 text-xs">{files.length} ta PDF material</p>
        </div>
        {open
          ? <ChevronDown className="w-4 h-4 text-slate-500" />
          : <ChevronRight className="w-4 h-4 text-slate-500" />
        }
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-dark-border">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                {files.map(file => (
                  <PdfCard key={file.id} file={file} canDelete={canDelete(file)} onDelete={onDelete} onView={onView} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResourcesPage() {
  const [files, setFiles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [viewFile, setViewFile] = useState(null);
  const { userProfile, isAdmin, isTeacher } = useAuth();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [filesSnap, coursesSnap] = await Promise.all([
        getDocs(query(collection(db, 'resources'), orderBy('uploadedAt', 'desc'))),
        getDocs(collection(db, 'courses')),
      ]);
      setFiles(filesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleUpload = async (fileData) => {
    try {
      const docData = { ...fileData, uploaderId: userProfile.uid, uploaderName: userProfile.displayName, uploadedAt: serverTimestamp() };
      const ref = await addDoc(collection(db, 'resources'), docData);
      setFiles(prev => [{ id: ref.id, ...docData, uploadedAt: { toDate: () => new Date() } }, ...prev]);
      toast.success('PDF yuklandi!');
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (file) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      if (file.publicId) {
        await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId: file.publicId }) });
      }
      await deleteDoc(doc(db, 'resources', file.id));
      setFiles(prev => prev.filter(f => f.id !== file.id));
      toast.success("O'chirildi");
    } catch (e) { toast.error(e.message); }
  };

  const canDelete = (file) => isAdmin || file.uploaderId === userProfile?.uid;

  const filtered = files.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));

  // Group files by course
  const grouped = {};
  filtered.forEach(file => {
    const key = file.courseId || 'general';
    if (!grouped[key]) grouped[key] = { name: file.courseName || 'Umumiy', files: [] };
    grouped[key].files.push(file);
  });

  const totalCount = filtered.length;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">PDF Materiallar</h1>
            <p className="text-slate-400 text-sm mt-1">{totalCount} ta material, {Object.keys(grouped).length} ta bo'lim</p>
          </div>
          {(isAdmin || isTeacher) && (
            <button onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 bg-brand-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-all ">
              <Plus className="w-4 h-4" /> PDF Yuklash
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Material qidirish..."
            className="w-full bg-dark-card border border-dark-border text-slate-300 placeholder-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">{[1, 2].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>
        ) : totalCount === 0 ? (
          <div className="text-center py-24">
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-slate-400 text-lg font-medium mb-2">Material topilmadi</h3>
            {(isAdmin || isTeacher) && (
              <button onClick={() => setShowUpload(true)} className="mt-4 text-brand-400 hover:text-brand-300 text-sm">
                + PDF yuklash
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([courseId, group]) => (
              <CourseGroup
                key={courseId}
                courseId={courseId}
                courseName={group.name}
                files={group.files}
                canDelete={canDelete}
                onDelete={handleDelete}
                onView={setViewFile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onUpload={handleUpload}
            courses={courses}
          />
        )}
      </AnimatePresence>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {viewFile && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewFile(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-dark-card border border-dark-border rounded-xl w-full max-w-5xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-dark-border">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-red-400" />
                  <span className="text-white font-medium truncate">{viewFile.name}</span>
                  <span className="text-slate-500 text-xs">{viewFile.size}</span>
                  {viewFile.courseName && (
                    <span className="text-xs bg-brand-500/20 text-brand-400 border border-brand-500/30 px-2 py-0.5 rounded-full">
                      {viewFile.courseName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a href={viewFile.url} download target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs px-3 py-1.5 rounded-lg hover:bg-brand-500/20 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Yuklab olish
                  </a>
                  <a href={viewFile.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-dark-surface transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => setViewFile(null)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-dark-surface transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden bg-white rounded-b-2xl">
                <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewFile.url)}&embedded=true`}
                  className="w-full h-full" title={viewFile.name} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
