'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, BookOpen, Award, TrendingUp, BarChart3, Shield, Activity, Trash2, Edit, Check, X, Loader2, RefreshCw, UserCheck, UserX, Plus, Eye, ToggleLeft, ToggleRight, FileText, MessageSquare } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, limit, where, doc, updateDoc, deleteDoc, getCountFromServer, serverTimestamp, addDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import DashboardLayout from '@/app/dashboard/layout';

const CHART_DATA = [
  { date: '1-Apr', users: 12, courses: 2, sessions: 34 },
  { date: '5-Apr', users: 25, courses: 4, sessions: 68 },
  { date: '10-Apr', users: 38, courses: 7, sessions: 95 },
  { date: '15-Apr', users: 52, courses: 10, sessions: 130 },
  { date: '20-Apr', users: 71, courses: 15, sessions: 180 },
  { date: '25-Apr', users: 89, courses: 20, sessions: 230 },
  { date: '30-Apr', users: 112, courses: 27, sessions: 290 },
];

const TIP = ({ active, payload, label }) => active && payload?.length ? (
  <div className="bg-dark-card border border-dark-border rounded-xl p-3 text-xs shadow-card">
    <p className="text-slate-400 mb-1">{label}</p>
    {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>)}
  </div>
) : null;

export default function AdminPage() {
  const { isAdmin, userProfile } = useAuth();
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ users: 0, courses: 0, comments: 0, resources: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (isAdmin) fetchAll(); }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersSnap, coursesSnap, reqSnap, uCount, cCount, comCount, resCount] = await Promise.all([
        getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(20))),
        getDocs(query(collection(db, 'courses'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'enrollmentRequests'), where('status', '==', 'pending'))),
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(collection(db, 'courses')),
        getCountFromServer(collection(db, 'comments')),
        getCountFromServer(collection(db, 'resources')),
      ]);
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setStats({ users: uCount.data().count, courses: cCount.data().count, comments: comCount.data().count, resources: resCount.data().count });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const changeRole = async (user, role) => {
    try {
      await updateDoc(doc(db, 'users', user.id), { role, updatedAt: serverTimestamp() });
      setUsers(p => p.map(u => u.id === user.id ? { ...u, role } : u));
      toast.success(`${user.displayName} → ${role}`);
    } catch (e) { toast.error(e.message); }
  };

  const toggleBlock = async (user) => {
    try {
      await updateDoc(doc(db, 'users', user.id), { isActive: !user.isActive, updatedAt: serverTimestamp() });
      setUsers(p => p.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
      toast.success(user.isActive ? 'Bloklandi' : 'Faollashtirildi');
    } catch (e) { toast.error(e.message); }
  };

  const deleteUser = async (id) => {
    if (!confirm("Foydalanuvchini o'chirmoqchimisiz?")) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      setUsers(p => p.filter(u => u.id !== id));
      toast.success("O'chirildi");
    } catch (e) { toast.error(e.message); }
  };

  const toggleCoursePublic = async (course) => {
    try {
      await updateDoc(doc(db, 'courses', course.id), { isPublic: !course.isPublic, updatedAt: serverTimestamp() });
      setCourses(p => p.map(c => c.id === course.id ? { ...c, isPublic: !c.isPublic } : c));
      toast.success(course.isPublic ? 'Yopiq qilindi' : 'Ochiq qilindi');
    } catch (e) { toast.error(e.message); }
  };

  const deleteCourse = async (id) => {
    if (!confirm("Kursni o'chirmoqchimisiz?")) return;
    try {
      await deleteDoc(doc(db, 'courses', id));
      setCourses(p => p.filter(c => c.id !== id));
      toast.success("O'chirildi");
    } catch (e) { toast.error(e.message); }
  };

  const approveRequest = async (req) => {
    try {
      const { arrayUnion } = await import('firebase/firestore');
      await Promise.all([
        updateDoc(doc(db, 'enrollmentRequests', req.id), { status: 'approved', updatedAt: serverTimestamp() }),
        updateDoc(doc(db, 'users', req.userId), { enrolledCourses: arrayUnion(req.courseId) }),
      ]);
      setRequests(p => p.filter(r => r.id !== req.id));
      toast.success('Tasdiqlandi!');
    } catch (e) { toast.error(e.message); }
  };

  const rejectRequest = async (req) => {
    try {
      await updateDoc(doc(db, 'enrollmentRequests', req.id), { status: 'rejected', updatedAt: serverTimestamp() });
      setRequests(p => p.filter(r => r.id !== req.id));
      toast.success('Rad etildi');
    } catch (e) { toast.error(e.message); }
  };

  if (!isAdmin) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64 flex-col gap-4">
        <Shield className="w-12 h-12 text-slate-700" />
        <p className="text-slate-400">Faqat adminlar uchun</p>
      </div>
    </DashboardLayout>
  );

  const STAT_CARDS = [
    { label: 'Jami Foydalanuvchilar', value: stats.users, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Faol Kurslar', value: stats.courses, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Fikrlar', value: stats.comments, icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'PDF Materiallar', value: stats.resources, icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const TABS = [
    { id: 'overview', label: 'Ko\'rinish', icon: BarChart3 },
    { id: 'users', label: `Foydalanuvchilar (${users.length})`, icon: Users },
    { id: 'courses', label: `Kurslar (${courses.length})`, icon: BookOpen },
    { id: 'requests', label: `So'rovlar (${requests.length})`, icon: Activity },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-400" /> Admin Panel
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Barcha tizim boshqaruvlari</p>
          </div>
          <button onClick={fetchAll} disabled={loading} className="flex items-center gap-2 bg-dark-surface border border-dark-border text-slate-400 hover:text-white text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Yangilash
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-dark-card border border-dark-border rounded-xl p-5 relative overflow-hidden">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              <div className="text-2xl font-bold text-white">{loading ? '...' : s.value}</div>
              <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-card border border-dark-border rounded-xl p-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40' : 'text-slate-500 hover:text-slate-300'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h3 className="text-white font-semibold mb-5">Foydalanuvchilar O'sishi</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} /><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis hide /><Tooltip content={<TIP />} />
                  <Area type="monotone" dataKey="users" name="Foydalanuvchilar" stroke="#0ea5e9" strokeWidth={2} fill="url(#gu)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h3 className="text-white font-semibold mb-5">Sessiyalar</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={CHART_DATA}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis hide /><Tooltip content={<TIP />} />
                  <Bar dataKey="sessions" name="Sessiyalar" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* System status */}
            <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Tizim Holati</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[['Firebase DB', '12ms'], ['Groq AI', '340ms'], ['Cloudinary', '89ms'], ['Next.js', '5ms']].map(([name, lat]) => (
                  <div key={name} className="bg-dark-surface border border-dark-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-xs font-medium">Online</span>
                    </div>
                    <p className="text-white font-medium text-sm">{name}</p>
                    <p className="text-slate-600 text-xs mt-1">Kechikish: {lat}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="text-white font-semibold">Foydalanuvchilar</h3>
              <span className="text-slate-500 text-sm">{users.length} ta</span>
            </div>
            {loading ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 text-brand-400 animate-spin mx-auto" /></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-border">
                      <th className="text-slate-400 font-medium px-4 py-3 text-left">Foydalanuvchi</th>
                      <th className="text-slate-400 font-medium px-4 py-3 text-left">Email</th>
                      <th className="text-slate-400 font-medium px-4 py-3 text-left">Rol</th>
                      <th className="text-slate-400 font-medium px-4 py-3 text-left">Status</th>
                      <th className="text-slate-400 font-medium px-4 py-3 text-left">Kurslar</th>
                      <th className="text-slate-400 font-medium px-4 py-3 text-left">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {u.displayName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-white font-medium">{u.displayName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{u.email}</td>
                        <td className="px-4 py-3">
                          <select value={u.role || 'student'} onChange={e => changeRole(u, e.target.value)}
                            className="bg-dark-surface border border-dark-border text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-500">
                            <option value="student">Talaba</option>
                            <option value="teacher">O'qituvchi</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.isActive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {u.isActive !== false ? 'Faol' : 'Bloklangan'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{u.enrolledCourses?.length || 0}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => toggleBlock(u)} title={u.isActive !== false ? 'Bloklash' : 'Faollashtirish'}
                              className={`p-1.5 rounded-lg transition-colors ${u.isActive !== false ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'}`}>
                              {u.isActive !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Courses */}
        {tab === 'courses' && (
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="text-white font-semibold">Barcha Kurslar</h3>
              <Link href="/teacher/courses/new" className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs px-3 py-1.5 rounded-xl hover:bg-brand-500/20 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Yangi Kurs
              </Link>
            </div>
            {loading ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 text-brand-400 animate-spin mx-auto" /></div> : (
              <div className="divide-y divide-dark-border">
                {courses.length === 0 ? (
                  <div className="text-center py-12"><BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" /><p className="text-slate-500">Kurs yo'q</p></div>
                ) : courses.map(c => (
                  <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-dark-surface/50 transition-colors">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.coverGradient || 'from-blue-700 to-blue-500'} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{c.title}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span>{c.teacherName}</span>
                        <span>{c.studentsCount || 0} talaba</span>
                        <span>{c.lessonsCount || 0} dars</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${c.isPublic ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {c.isPublic ? 'Ochiq' : 'Yopiq'}
                      </span>
                      <button onClick={() => toggleCoursePublic(c)} title="Status o'zgartirish" className="p-1.5 text-slate-500 hover:text-brand-400 rounded-lg hover:bg-brand-500/10 transition-colors">
                        {c.isPublic ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <Link href={`/courses/${c.id}`} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-dark-surface transition-colors"><Eye className="w-4 h-4" /></Link>
                      <button onClick={() => deleteCourse(c.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests */}
        {tab === 'requests' && (
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-dark-border">
              <h3 className="text-white font-semibold">Yozilish So'rovlari</h3>
            </div>
            {requests.length === 0 ? (
              <div className="text-center py-16">
                <Check className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
                <p className="text-slate-500">Barcha so'rovlar ko'rib chiqildi</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-border">
                {requests.map(req => (
                  <div key={req.id} className="flex items-center gap-4 p-5 hover:bg-dark-surface/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {req.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{req.userName}</p>
                      <p className="text-slate-500 text-xs">{req.userEmail}</p>
                      <p className="text-brand-400 text-xs mt-0.5">📚 {req.courseTitle}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveRequest(req)} className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-xl hover:bg-emerald-500/30 transition-colors">
                        <Check className="w-3.5 h-3.5" /> Tasdiqlash
                      </button>
                      <button onClick={() => rejectRequest(req)} className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-xl hover:bg-red-500/30 transition-colors">
                        <X className="w-3.5 h-3.5" /> Rad etish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
