'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen, Plus, Edit2, Trash2, Eye, Users, Globe, Lock,
  BarChart2, ChevronRight, Loader2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '@/app/dashboard/layout';

export default function TeacherCoursesPage() {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (userProfile) fetchCourses(); }, [userProfile]);

  const fetchCourses = async () => {
    try {
      const q = query(collection(db, 'courses'), where('teacherId', '==', userProfile.uid));
      const snap = await getDocs(q);
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const togglePublic = async (course) => {
    try {
      await updateDoc(doc(db, 'courses', course.id), {
        isPublic: !course.isPublic, updatedAt: serverTimestamp(),
      });
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, isPublic: !c.isPublic } : c));
      toast.success(course.isPublic ? 'Yopiq qilindi' : 'Ochiq qilindi');
    } catch { toast.error('Xatolik'); }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Kursni o\'chirmoqchimisiz?')) return;
    try {
      await deleteDoc(doc(db, 'courses', id));
      setCourses(prev => prev.filter(c => c.id !== id));
      toast.success("O'chirildi");
    } catch { toast.error('Xatolik'); }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Mening Kurslarim</h1>
            <p className="text-slate-400 text-sm mt-1">{courses.length} ta kurs</p>
          </div>
          <Link href="/teacher/courses/new"
            className="flex items-center gap-2 bg-brand-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-all "
          >
            <Plus className="w-4 h-4" /> Yangi Kurs
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="bg-dark-card border border-dark-border rounded-xl h-24 skeleton" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-slate-400 font-semibold text-lg mb-2">Hali kurs yaratmadingiz</h3>
            <Link href="/teacher/courses/new" className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl transition-colors text-sm font-medium inline-block mt-4">
              Birinchi Kursni Yaratish
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center gap-4 hover:border-brand-500/30 transition-all"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${course.coverGradient || 'from-blue-700 to-blue-500'} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{course.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.studentsCount || 0} talaba</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessonsCount || 0} dars</span>
                    <span>{course.level}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                    course.isPublic ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {course.isPublic ? 'Ochiq' : 'Yopiq'}
                  </span>
                  <button onClick={() => togglePublic(course)} className="p-2 text-slate-500 hover:text-brand-400 rounded-xl hover:bg-brand-500/10 transition-all" title="Statusni o'zgartirish">
                    {course.isPublic ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <Link href={`/courses/${course.id}`} className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-dark-surface transition-all">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link href={`/teacher/courses/${course.id}/edit`} className="p-2 text-slate-500 hover:text-brand-400 rounded-xl hover:bg-brand-500/10 transition-all">
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button onClick={() => deleteCourse(course.id)} className="p-2 text-slate-500 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
