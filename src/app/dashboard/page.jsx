'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, Users, Award, TrendingUp, Clock, Play, ArrowRight,
  Zap, Star, CheckCircle, BarChart2, Bot, FileText, ChevronRight,
  Flame, Target, Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const activityData = [
  { day: 'Dush', hours: 2 },
  { day: 'Sesh', hours: 4 },
  { day: 'Chor', hours: 3 },
  { day: 'Pay', hours: 5 },
  { day: 'Jum', hours: 2 },
  { day: 'Shan', hours: 6 },
  { day: 'Yak', hours: 4 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function DashboardPage() {
  const { userProfile, isAdmin, isTeacher } = useAuth();
  const [recentCourses, setRecentCourses] = useState([]);
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, hours: 0, streak: 7 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userProfile]);

  const fetchData = async () => {
    if (!userProfile) return;
    try {
      const coursesQ = query(collection(db, 'courses'), orderBy('createdAt', 'desc'), limit(3));
      const snap = await getDocs(coursesQ);
      setRecentCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setStats({
        enrolled: userProfile.enrolledCourses?.length || 0,
        completed: userProfile.stats?.coursesCompleted || 0,
        hours: userProfile.stats?.totalHours || 0,
        streak: 7,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Xayrli tong";
    if (h < 17) return "Xayrli kun";
    return "Xayrli kech";
  };

  const statsCards = isAdmin ? [
    { label: 'Jami Foydalanuvchilar', value: '5,234', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', change: '+12%' },
    { label: 'Faol Kurslar', value: '127', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', change: '+5%' },
    { label: "Bugungi Faollar", value: '834', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: '+8%' },
    { label: "Sertifikatlar", value: '3,021', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10', change: '+15%' },
  ] : isTeacher ? [
    { label: "Mening Kurslarim", value: userProfile?.createdCourses?.length || '0', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', change: '' },
    { label: 'Talabalar', value: '248', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', change: '+3' },
    { label: "Baholash", value: '4.8 ⭐', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10', change: '' },
    { label: "Daromad", value: 'Bepul', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: '' },
  ] : [
    { label: "Yozilgan Kurslar", value: stats.enrolled, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10', change: '' },
    { label: "Tugallangan", value: stats.completed, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: '' },
    { label: "O'quv Soatlari", value: stats.hours, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10', change: '' },
    { label: "Ketma-ketlik", value: `${stats.streak} kun`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', change: '🔥' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-brand-900/80 via-dark-card to-dark-card border border-dark-border p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-2xl opacity-40 -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-slate-400 text-sm mb-1">{greeting()},</p>
          <h1 className="text-3xl font-bold text-white mb-2">
            {userProfile?.displayName || 'Foydalanuvchi'} 👋
          </h1>
          <p className="text-slate-400 max-w-lg">
            {isAdmin ? "Platforma statistikasi va boshqaruvni kuzating." :
             isTeacher ? "Kurslaringizni boshqaring va talabalar bilan ishlang." :
             "Bugun ham o'rganishni davom eting! Chatbot yaratish yo'lingizda muvaffaqiyatlar."}
          </p>
          <div className="flex gap-3 mt-5">
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-xl hover:bg-red-500/30 transition-colors">
                <BarChart2 className="w-4 h-4" /> Admin Panel
              </Link>
            )}
            {isTeacher && (
              <Link href="/teacher/courses/new" className="flex items-center gap-2 bg-brand-500/20 border border-brand-500/30 text-brand-400 text-sm px-4 py-2 rounded-xl hover:bg-brand-500/30 transition-colors">
                <BookOpen className="w-4 h-4" /> Yangi Kurs
              </Link>
            )}
            <Link href="/chat" className="flex items-center gap-2 bg-accent-purple/20 border border-accent-purple/30 text-purple-400 text-sm px-4 py-2 rounded-xl hover:bg-accent-purple/30 transition-colors">
              <Bot className="w-4 h-4" /> AI Yordam
            </Link>
            <Link href="/courses" className="flex items-center gap-2 bg-white/5 border border-dark-border text-slate-300 text-sm px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">
              <BookOpen className="w-4 h-4" /> Kurslar
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <motion.div key={i} custom={i + 1} initial="hidden" animate="visible" variants={fadeUp}
            className="stats-card"
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20"
              style={{ background: stat.color.replace('text-', '').replace('-400', '') }} />
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
            {stat.change && <div className="text-emerald-400 text-xs mt-2 font-medium">{stat.change}</div>}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}
          className="lg:col-span-2 chart-container"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Haftalik Faollik</h3>
              <p className="text-slate-500 text-sm">O'quv soatlari</p>
            </div>
            <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +24% bu hafta
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={activityData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#0F1629', border: '1px solid #1E2D4A', borderRadius: '10px', color: '#E2E8F0' }}
                labelStyle={{ color: '#94A3B8' }}
              />
              <Line type="monotone" dataKey="hours" stroke="#0ea5e9" strokeWidth={2.5}
                dot={{ fill: '#0ea5e9', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#0c4a6e', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick actions */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}
          className="bg-dark-card rounded-xl border border-dark-border p-6"
        >
          <h3 className="text-white font-semibold mb-4">Tezkor Harakatlar</h3>
          <div className="space-y-2">
            {[
              { label: 'AI bilan chat', href: '/chat', icon: Bot, color: 'text-brand-400' },
              { label: 'PDF yuklash', href: '/resources', icon: FileText, color: 'text-purple-400' },
              { label: 'Kurslarni ko\'rish', href: '/courses', icon: BookOpen, color: 'text-emerald-400' },
              { label: 'Sertifikatlar', href: '/student/certificates', icon: Award, color: 'text-amber-400' },
              { label: 'Mening profilim', href: '/profile', icon: Target, color: 'text-pink-400' },
            ].map((item, i) => (
              <Link key={i} href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-surface border border-transparent hover:border-dark-border transition-all group"
              >
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-slate-300 text-sm group-hover:text-white transition-colors">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-slate-400 transition-colors" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Courses */}
      <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Oxirgi Kurslar</h3>
          <Link href="/courses" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1 transition-colors">
            Barchasi <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentCourses.length > 0 ? recentCourses.map((course, i) => (
            <Link key={course.id} href={`/courses/${course.id}`}
              className="course-card p-5 block"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm line-clamp-2">{course.title}</h4>
                  <p className="text-slate-500 text-xs mt-1">{course.teacherName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full ${course.isPublic ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {course.isPublic ? 'Ochiq' : 'Yopiq'}
                </span>
                <span className="text-slate-500 text-xs">{course.studentsCount || 0} talaba</span>
              </div>
            </Link>
          )) : [1, 2, 3].map(i => (
            <div key={i} className="course-card p-5">
              <div className="skeleton h-10 w-10 rounded-xl mb-4" />
              <div className="skeleton h-4 w-3/4 rounded mb-2" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Today's plan */}
      <motion.div custom={8} initial="hidden" animate="visible" variants={fadeUp}
        className="bg-dark-card rounded-xl border border-dark-border p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-brand-400" />
          <h3 className="text-white font-semibold">Bugungi Reja</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { time: '09:00', task: 'ChatBot Asoslari - 3-dars', done: true, color: 'border-emerald-500/40 bg-emerald-500/5', href: '/courses' },
            { time: '14:00', task: 'LangChain Amaliyot', done: false, color: 'border-brand-500/40 bg-brand-500/5', href: '/courses' },
            { time: '18:00', task: "So'rovnoma va Sinov", done: false, color: 'border-purple-500/40 bg-purple-500/5', href: '/quiz' },
          ].map((item, i) => (
            <div key={i} className={`rounded-xl border p-4 ${item.color}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs">{item.time}</span>
                {item.done && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className={`text-sm font-medium ${item.done ? 'text-slate-500 line-through' : 'text-white'}`}>
                {item.task}
              </p>
              {!item.done && (
                <Link href={item.href} className="mt-3 flex items-center gap-1 text-brand-400 text-xs hover:text-brand-300 transition-colors">
                  <Play className="w-3 h-3" /> Boshlash
                </Link>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
