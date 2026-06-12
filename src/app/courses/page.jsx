'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, Filter, BookOpen, Star, Users, Clock, Lock, Globe,
  ChevronRight, Plus, SlidersHorizontal, Zap, Award
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '@/app/dashboard/layout';

const LEVELS = ['Barchasi', "Boshlang'ich", "O'rta", 'Yuqori'];
const CATEGORIES = ['Barchasi', 'Chatbot Asoslari', 'LangChain', 'RAG', 'API Integration', 'Deploy', 'Fine-tuning'];

function CourseCard({ course, onEnroll, enrolled }) {
  const { isAdmin, isTeacher } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="course-card group"
    >
      {/* Thumbnail */}
      <div className={`h-44 bg-gradient-to-br ${course.coverGradient || 'from-blue-700 to-blue-500'} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm ${
            course.isPublic ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/30 text-red-300 border border-red-500/40'
          }`}>
            {course.isPublic ? <><Globe className="w-3 h-3 inline mr-1" />Ochiq</> : <><Lock className="w-3 h-3 inline mr-1" />Yopiq</>}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/10">
            {course.level}
          </span>
        </div>
        {course.isNew && (
          <div className="absolute top-3 right-3 bg-brand-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            Yangi
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs text-white font-bold border border-white/20">
              {course.teacherName?.charAt(0) || 'T'}
            </div>
            <span className="text-white/80 text-xs">{course.teacherName}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-semibold mb-2 group-hover:text-brand-400 transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {course.lessonsCount || 0} dars
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.duration || '—'}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {course.studentsCount || 0}
          </span>
          {course.rating && (
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              {course.rating}
            </span>
          )}
        </div>

        {/* Tags */}
        {course.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {course.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs bg-dark-surface border border-dark-border text-slate-400 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action */}
        <div className="flex gap-2">
          <Link
            href={`/courses/${course.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-400 text-sm py-2.5 rounded-xl transition-all font-medium"
          >
            Ko'rish <ChevronRight className="w-4 h-4" />
          </Link>
          {!enrolled && !isTeacher && !isAdmin && (
            <button
              onClick={() => onEnroll(course)}
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded-xl transition-colors font-medium"
            >
              {course.isPublic ? "Yozil" : "So'rov"}
            </button>
          )}
          {enrolled && (
            <span className="px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-medium flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Yozilgan
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('Barchasi');
  const [category, setCategory] = useState('Barchasi');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const { userProfile, isAdmin, isTeacher } = useAuth();

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    let result = courses;
    if (search) result = result.filter(c =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );
    if (level !== 'Barchasi') result = result.filter(c => c.level === level);
    if (category !== 'Barchasi') result = result.filter(c => c.category === category);
    if (showPublicOnly) result = result.filter(c => c.isPublic);
    setFiltered(result);
  }, [courses, search, level, category, showPublicOnly]);

  const fetchCourses = async () => {
    try {
      const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (course) => {
    if (!userProfile) { toast.error('Avval tizimga kiring'); return; }
    if (userProfile.role === 'teacher' || userProfile.role === 'admin') {
      toast.error("O'qituvchilar va adminlar kursga yozila olmaydi");
      return;
    }
    try {
      const { doc, updateDoc, arrayUnion, setDoc, serverTimestamp, increment } = await import('firebase/firestore');
      if (course.isPublic) {
        await updateDoc(doc(db, 'users', userProfile.uid), {
          enrolledCourses: arrayUnion(course.id),
        });
        await updateDoc(doc(db, 'courses', course.id), {
          studentsCount: increment(1),
        });
        toast.success(`"${course.title}" kursiga yozildingiz!`);
      } else {
        await setDoc(doc(db, 'enrollmentRequests', `${userProfile.uid}_${course.id}`), {
          userId: userProfile.uid,
          userName: userProfile.displayName || '',
          userEmail: userProfile.email || '',
          courseId: course.id,
          courseTitle: course.title,
          status: 'pending',
          createdAt: serverTimestamp(),
        });
        toast.success("So'rov yuborildi! O'qituvchi tasdiqlaydi.");
      }
    } catch (e) {
      console.error('Enroll error:', e);
      if (e.code === 'permission-denied') {
        toast.error("Ruxsat yo'q. Tizimga qayta kiring.");
      } else {
        toast.error('Xatolik: ' + (e.message || "Qayta urinib ko'ring"));
      }
    }
  };

  const isEnrolled = (courseId) => userProfile?.enrolledCourses?.includes(courseId);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Kurslar</h1>
            <p className="text-slate-400 text-sm mt-1">{filtered.length} ta kurs topildi</p>
          </div>
          {(isAdmin || isTeacher) && (
            <Link
              href="/teacher/courses/new"
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm px-5 py-2.5 rounded-xl transition-colors font-medium"
            >
              <Plus className="w-4 h-4" /> Kurs qo'shish
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Kurs qidirish..."
              className="edu-input pl-10 py-2.5"
            />
          </div>

          <select value={level} onChange={e => setLevel(e.target.value)}
            className="bg-dark-surface border border-dark-border text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
          >
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>

          <select value={category} onChange={e => setCategory(e.target.value)}
            className="bg-dark-surface border border-dark-border text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>

          <button
            onClick={() => setShowPublicOnly(!showPublicOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all ${
              showPublicOnly ? 'bg-brand-500/20 border-brand-500/50 text-brand-400' : 'bg-dark-surface border-dark-border text-slate-400 hover:border-slate-600'
            }`}
          >
            <Globe className="w-4 h-4" /> Faqat ochiq
          </button>
        </div>

        {/* Courses grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
                <div className="skeleton h-44" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-slate-400 text-lg font-medium mb-2">Kurs topilmadi</h3>
            <p className="text-slate-600 text-sm">Qidiruv shartlarini o'zgartiring</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(course => (
              <CourseCard key={course.id} course={course} onEnroll={handleEnroll} enrolled={isEnrolled(course.id)} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}