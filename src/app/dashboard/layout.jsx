'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, LayoutDashboard, BookOpen, Users, BarChart3, Bell,
  MessageSquare, FileText, Award, LogOut, Menu, X,
  Shield, GraduationCap, BookMarked, Layers, Search, Plus,
  ChevronRight, Zap, ClipboardList, Home, Settings
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const getNavItems = (role) => {
  const base = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/courses', icon: BookOpen, label: 'Kurslar' },
    { href: '/chat', icon: MessageSquare, label: 'AI Yordamchi' },
    { href: '/resources', icon: FileText, label: 'PDF Materiallar' },
    { href: '/profile', icon: GraduationCap, label: 'Profil' },
    { href: '/settings', icon: Settings, label: 'Sozlamalar' },
  ];
  if (role === 'admin') return [
    ...base,
    { href: '/admin', icon: Shield, label: 'Admin Panel' },
    { href: '/teacher/courses', icon: BookMarked, label: 'Kurslar (CRUD)' },
    { href: '/quiz', icon: ClipboardList, label: "So'rovnomalar" },
  ];
  if (role === 'teacher') return [
    ...base,
    { href: '/teacher/courses', icon: BookMarked, label: 'Mening Kurslarim' },
    { href: '/teacher/students', icon: Users, label: 'Talabalar' },
    { href: '/quiz', icon: ClipboardList, label: "So'rovnomalar" },
  ];
  return [
    ...base,
    { href: '/student/courses', icon: GraduationCap, label: 'Mening Kurslarim' },
    { href: '/student/certificates', icon: Award, label: 'Sertifikatlar' },
    { href: '/quiz', icon: ClipboardList, label: "So'rovnomalar" },
  ];
};

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Yangi kurs qo'shildi: RAG Advanced", time: '5 daq', read: false, href: '/courses' },
    { id: 2, text: 'ChatBot Asoslari kursiga talaba yozildi', time: '1 soat', read: false, href: '/teacher/courses' },
    { id: 3, text: "Yangi so'rov: Ali Karimov", time: '2 soat', read: true, href: '/admin' },
  ]);
  const notifRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, logout, loading } = useAuth();

  const navItems = getNavItems(userProfile?.role);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notif on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Redirect if not logged in — router added to deps
  useEffect(() => {
    if (!loading && !userProfile) {
      router.replace('/auth/login');
    }
  }, [loading, userProfile, router]);

  const handleLogout = async () => {
    setSidebarOpen(false);
    try { await logout(); } catch {}
    router.push('/');
  };

  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));

  const handleNotifClick = (notif) => {
    setNotifications(p => p.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setNotifOpen(false);
    if (notif.href) router.push(notif.href);
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <p className="text-slate-400 text-sm">Yuklanmoqda...</p>
      </div>
    </div>
  );

  if (!userProfile) return null;

  return (
    <div className="h-screen bg-dark-bg flex overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-dark-card border-r border-dark-border z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:flex lg:h-full ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-dark-border flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center ">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">ChatBot Edu</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User chip */}
        <div className="px-4 py-3 border-b border-dark-border flex-shrink-0">
          <div className="flex items-center gap-3 p-2.5 bg-dark-surface rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
              {userProfile.avatar
                ? <img src={userProfile.avatar} alt="" className="w-full h-full object-cover" />
                : userProfile.displayName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium text-sm truncate">{userProfile.displayName}</p>
              <span className={userProfile.role === 'admin' ? 'badge-admin' : userProfile.role === 'teacher' ? 'badge-teacher' : 'badge-student'}>
                {userProfile.role === 'admin' ? 'Admin' : userProfile.role === 'teacher' ? "O'qituvchi" : 'Talaba'}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* AI quick chat + Logout */}
        <div className="px-4 py-3 border-t border-dark-border flex-shrink-0">
          <Link href="/chat" className="flex items-center gap-2.5 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl hover:bg-brand-500/20 transition-all group mb-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-brand-400 text-xs font-medium">AI Yordamchi</p>
              <p className="text-slate-600 text-xs truncate">Savol bering...</p>
            </div>
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-sm">
            <LogOut className="w-4 h-4 flex-shrink-0" /> Tizimdan Chiqish
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-dark-card/80 backdrop-blur-xl border-b border-dark-border flex-shrink-0">
          <div className="flex items-center gap-3 px-4 h-16">
            {/* Mobile menu */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white p-2 rounded-xl transition-colors">
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-sm hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Qidirish..."
                  className="w-full bg-dark-surface border border-dark-border text-slate-300 placeholder-slate-600 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors" />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Add course btn */}
              {(userProfile?.role === 'teacher' || userProfile?.role === 'admin') && (
                <Link href="/teacher/courses/new"
                  className="hidden md:flex items-center gap-2 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-400 text-sm px-3 py-2 rounded-xl transition-all">
                  <Plus className="w-4 h-4" /> Kurs
                </Link>
              )}

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(v => !v)}
                  className="relative w-10 h-10 bg-dark-surface border border-dark-border rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-12 w-80 bg-dark-card border border-dark-border rounded-xl shadow-card overflow-hidden z-50">
                      <div className="p-4 border-b border-dark-border flex items-center justify-between">
                        <span className="text-white font-semibold text-sm">Bildirishnomalar</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-brand-400 text-xs hover:text-brand-300 transition-colors">
                            Barchasini o'qilgan deb belgilash
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-dark-border/50">
                        {notifications.length === 0 ? (
                          <p className="text-slate-500 text-sm text-center py-8">Bildirishnoma yo'q</p>
                        ) : notifications.map(n => (
                          <button key={n.id} onClick={() => handleNotifClick(n)}
                            className={`w-full p-4 text-left hover:bg-dark-surface transition-colors flex gap-3 ${!n.read ? 'bg-brand-500/5' : ''}`}>
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-brand-400' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-snug ${!n.read ? 'text-slate-200' : 'text-slate-400'}`}>{n.text}</p>
                              <p className="text-slate-600 text-xs mt-1">{n.time} oldin</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="p-3 border-t border-dark-border">
                        <Link href="/notifications" onClick={() => setNotifOpen(false)}
                          className="block text-center text-brand-400 text-sm hover:text-brand-300 transition-colors py-1">
                          Barchasini ko'rish →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar */}
              <Link href="/profile" className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {userProfile?.avatar
                  ? <img src={userProfile.avatar} alt="" className="w-full h-full object-cover" />
                  : userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}