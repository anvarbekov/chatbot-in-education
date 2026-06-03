'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, Play, ChevronRight, CheckCircle, Lock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/app/dashboard/layout';

export default function StudentCoursesPage() {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEnrolledCourses(); }, [userProfile]);

  const fetchEnrolledCourses = async () => {
    if (!userProfile?.enrolledCourses?.length) { setLoading(false); return; }
    try {
      const promises = userProfile.enrolledCourses.map(id => getDoc(doc(db, 'courses', id)));
      const snaps = await Promise.all(promises);
      setCourses(snaps.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Mening Kurslarim</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="bg-dark-card border border-dark-border rounded-xl h-64 skeleton" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-slate-400 font-semibold text-lg mb-2">Hali kursga yozilmagan</h3>
            <p className="text-slate-600 text-sm mb-6">Kurslarga yoziling va o'rganishni boshlang</p>
            <Link href="/courses" className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl transition-colors text-sm font-medium">
              Kurslarni Ko'rish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-brand-500/40 transition-all group"
              >
                <div className={`h-32 bg-gradient-to-br ${course.coverGradient || 'from-blue-700 to-blue-500'} relative`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-white/70 text-xs">{course.level}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-white font-semibold mb-2 group-hover:text-brand-400 transition-colors">{course.title}</h3>
                  <div className="progress-bar mb-2">
                    <div className="progress-fill" style={{ width: `${Math.floor(Math.random() * 80 + 10)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span>{course.lessonsCount || 0} dars</span>
                    <span>60% tugallangan</span>
                  </div>
                  <Link href={`/courses/${course.id}`}
                    className="flex items-center justify-center gap-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm py-2.5 rounded-xl hover:bg-brand-500/20 transition-colors font-medium"
                  >
                    <Play className="w-4 h-4" /> Davom ettirish
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
