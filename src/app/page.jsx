'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, Award, ChevronRight, Code2, Brain, Layers,
  ArrowRight, Check, Clock, Shield, Bot, Globe
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const features = [
  { icon: Brain,    title: "AI bilan ta'lim",     desc: "Groq AI yordamida har bir savolingizga real vaqt javob oling",     color: "text-blue-400",    bg: "bg-blue-500/10"    },
  { icon: Code2,    title: "Amaliy loyihalar",     desc: "Real chatbotlar yarating va portfolio to'ldiring",                 color: "text-violet-400",  bg: "bg-violet-500/10"  },
  { icon: Users,    title: "Jamoa bilan",          desc: "O'qituvchilar va talabalar bilan hamkorlikda o'qing",              color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: Shield,   title: "Sertifikatlar",        desc: "Kursni tugatganda rasmiy sertifikat oling",                       color: "text-amber-400",   bg: "bg-amber-500/10"   },
  { icon: Globe,    title: "24/7 yordam",           desc: "AI assistant har doim mavjud — kech yoki erta bo'lsin",           color: "text-sky-400",     bg: "bg-sky-500/10"     },
  { icon: Layers,   title: "Tizimli dastur",       desc: "Asoslardan advanced darajagacha ketma-ket o'quv yo'li",            color: "text-rose-400",    bg: "bg-rose-500/10"    },
];

const NAV = [
  { label: 'Kurslar',     href: '/courses'    },
  { label: 'Materiallar', href: '/materiallar'},
  { label: 'Blog',        href: '/blog'       },
  { label: 'Haqimizda',  href: '/haqimizda'  },
];

const COVER_COLORS = [
  'from-blue-700 to-blue-500',
  'from-violet-700 to-purple-500',
  'from-teal-700 to-emerald-500',
];

export default function HomePage() {
  const { user } = useAuth();
  const [courses, setCourses]   = useState([]);
  const [stats, setStats]       = useState({ users: '—', courses: '—', teachers: '—' });
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [coursesSnap, uCount, cCount, usersSnap] = await Promise.all([
        getDocs(query(collection(db, 'courses'), orderBy('createdAt', 'desc'), limit(3))),
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(collection(db, 'courses')),
        getDocs(collection(db, 'users')),
      ]);
      setCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const teachers = usersSnap.docs.filter(d => ['teacher','admin'].includes(d.data().role)).length;
      setStats({ users: uCount.data().count + '+', courses: cCount.data().count.toString(), teachers: teachers + '+' });
    } catch {
      setStats({ users: '1 000+', courses: '50+', teachers: '20+' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-300">

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-dark-border bg-dark-card/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-white">
            <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            ChatBot Edu
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV.map(l => (
              <Link key={l.href} href={l.href}
                className="text-slate-400 hover:text-slate-100 transition-colors text-sm">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/dashboard"
                className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Dashboard <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/auth/login"
                  className="text-slate-400 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors hidden sm:block">
                  Kirish
                </Link>
                <Link href="/auth/register"
                  className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3 py-1 rounded-full mb-8">
              O'zbekistondagi #1 chatbot ta'lim platformasi
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="text-4xl md:text-5xl lg:text-4xl font-bold text-white leading-tight tracking-tight mb-6">
            Chatbot Yaratishni<br />
            <span className="text-brand-400">O'rgan</span> va Ishlat
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Groq AI, LangChain, RAG va boshqa zamonaviy texnologiyalar asosida chatbot yarating.
            Amaliy kurslar orqali ekspert bo'ling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-20">
            <Link href="/auth/register"
              className="group inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm">
              Bepul Boshlash
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/courses"
              className="inline-flex items-center gap-2 bg-dark-card border border-dark-border text-slate-300 hover:border-slate-600 hover:text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm">
              <BookOpen className="w-4 h-4" /> Kurslarni Ko'rish
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            {[
              { value: stats.users,   label: 'Talaba' },
              { value: stats.courses, label: 'Kurs'   },
              { value: stats.teachers,label: "O'qituvchi" },
              { value: '98%',         label: 'Muvaffaqiyat' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-white tabular-nums">{s.value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-dark-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">Nega ChatBot Edu?</h2>
            <p className="text-slate-400 text-sm">Eng yaxshi o'quv tajribasini ta'minlash uchun ishlab chiqilgan</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }} viewport={{ once: true }}
                className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-slate-600 transition-colors">
                <div className={`w-9 h-9 ${f.bg} rounded-lg flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses ───────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-dark-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Kurslar</h2>
              <p className="text-slate-500 text-sm">
                {loading ? 'Yuklanmoqda...' : courses.length > 0 ? `${courses.length} ta so'nggi kurs` : 'Tez orada qo\'shiladi'}
              </p>
            </div>
            <Link href="/courses" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1 transition-colors">
              Barchasi <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="skeleton h-56 rounded-xl" />)}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courses.map((course, i) => (
                <motion.div key={course.id}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} viewport={{ once: true }}>
                  <Link href={`/courses/${course.id}`}
                    className="block bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-slate-600 transition-colors group">
                    <div className={`h-32 bg-gradient-to-br ${course.coverGradient || COVER_COLORS[i % 3]} relative`}>
                      <div className="absolute top-3 left-3">
                        <span className="text-xs px-2 py-0.5 rounded bg-black/30 text-white/80 border border-white/10">
                          {course.isPublic ? 'Ochiq' : 'Yopiq'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-medium text-sm mb-1.5 group-hover:text-brand-400 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 text-xs mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {course.studentsCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {course.lessonsCount || 0} dars
                        </span>
                        {course.level && <span>{course.level}</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Hali kurs qo'shilmagan</p>
              <Link href="/auth/register" className="inline-block mt-4 text-brand-400 hover:text-brand-300 text-sm transition-colors">
                Ro'yxatdan o'ting →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-dark-border">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-snug">
            Bugun boshlang va kelajakni o'zgartiring
          </h2>
          <div className="flex flex-wrap justify-center gap-5 mb-8">
            {["Bepul ro'yxatdan o'tish", 'Sertifikat olish', '24/7 AI yordam'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> {item}
              </div>
            ))}
          </div>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-7 py-3.5 rounded-lg transition-colors">
            Hoziroq Boshlash <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-dark-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            ChatBot Edu
          </div>
          <div className="flex gap-5">
            {NAV.map(l => (
              <Link key={l.href} href={l.href}
                className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
          <p className="text-slate-600 text-xs">© 2024 ChatBot Edu</p>
        </div>
      </footer>
    </div>
  );
}
