'use client';

import DashboardLayout from '@/app/dashboard/layout';
import { Bell, Check, BookOpen, MessageSquare, Award, Users } from 'lucide-react';

const NOTIFS = [
  { id: 1, icon: BookOpen, color: 'text-blue-400 bg-blue-500/10', title: "Yangi kurs qo'shildi", desc: 'RAG Advanced kursi platformaga qo\'shildi', time: '5 daqiqa oldin', read: false },
  { id: 2, icon: Award, color: 'text-amber-400 bg-amber-500/10', title: 'Kurs tugatildi', desc: "ChatBot Asoslari kursini tugatdingiz! Sertifikat tayyor.", time: '1 soat oldin', read: false },
  { id: 3, icon: MessageSquare, color: 'text-purple-400 bg-purple-500/10', title: 'Yangi fikr', desc: 'Kursga yangi fikr qoldirildi', time: '2 soat oldin', read: true },
  { id: 4, icon: Users, color: 'text-emerald-400 bg-emerald-500/10', title: "Yangi so'rov", desc: "Ali Karimov kursga yozilish so'rovi yubordi", time: '3 soat oldin', read: true },
];

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-400" /> Bildirishnomalar
          </h1>
          <button className="text-brand-400 hover:text-brand-300 text-sm transition-colors flex items-center gap-1">
            <Check className="w-4 h-4" /> Barchasini o'qildi
          </button>
        </div>
        <div className="space-y-3">
          {NOTIFS.map(n => (
            <div key={n.id} className={`bg-dark-card border rounded-xl p-5 flex gap-4 transition-all hover:border-brand-500/30 ${!n.read ? 'border-brand-500/20 bg-brand-500/5' : 'border-dark-border'}`}>
              <div className={`w-10 h-10 rounded-xl ${n.color} flex items-center justify-center flex-shrink-0`}>
                <n.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-medium text-sm ${!n.read ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                  {!n.read && <div className="w-2 h-2 bg-brand-400 rounded-full flex-shrink-0 mt-1" />}
                </div>
                <p className="text-slate-400 text-sm mt-1">{n.desc}</p>
                <p className="text-slate-600 text-xs mt-2">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
