'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, Users, BookOpen, Award, Target, Zap, Heart, Mail, Globe, Github } from 'lucide-react';

const team = [
  { name: 'Muazzam Karimova', role: 'Asoschi & CEO', desc: 'AI va ML bo\'yicha 5 yillik tajriba', color: 'from-blue-500 to-cyan-500' },
  { name: 'Jasur Toshmatov', role: 'Bosh O\'qituvchi', desc: 'LangChain va RAG mutaxassisi', color: 'from-purple-500 to-pink-500' },
  { name: 'Nilufar Yusupova', role: 'Frontend Developer', desc: 'React va Next.js bo\'yicha ekspert', color: 'from-emerald-500 to-teal-500' },
];

const values = [
  { icon: Target, title: 'Maqsad', desc: "O'zbekistonda AI ta'limini rivojlantirish va hamma uchun ochiq qilish.", color: 'text-brand-400', bg: 'bg-brand-500/10' },
  { icon: Zap, title: 'Yondashuv', desc: 'Amaliy loyihalar orqali o\'rganish — nazariya emas, real tajriba.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Heart, title: 'Qadriyat', desc: 'Har bir talaba muvaffaqiyati bizning g\'ururumiz.', color: 'text-pink-400', bg: 'bg-pink-500/10' },
];

export default function HaqimzdaPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-card/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">ChatBot <span className="text-gradient">Edu</span></span>
          </Link>
          <div className="flex items-center gap-4">
            {['Kurslar', 'Materiallar', 'Blog', 'Haqimizda'].map(item => (
              <Link key={item} href={`/${item.toLowerCase()}`} className={`text-sm transition-colors ${item === 'Haqimizda' ? 'text-brand-400' : 'text-slate-400 hover:text-white'}`}>{item}</Link>
            ))}
            <Link href="/dashboard" className="bg-brand-500 hover:bg-brand-600 text-white text-sm px-4 py-2 rounded-xl transition-colors">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-6 text-center py-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 rounded-xl bg-brand-500 flex items-center justify-center mx-auto mb-6 ">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Biz <span className="text-gradient">Haqimizda</span>
            </h1>
            <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto">
              ChatBot Edu — O'zbekistondagi birinchi chatbot va AI ta'lim platformasi. 
              2024-yilda tashkil etilgan bo'lib, 5,000+ talabaga xizmat ko'rsatmoqda.
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: Users, value: '5,000+', label: 'Talabalar', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: BookOpen, value: '120+', label: 'Kurslar', color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { icon: Award, value: '3,000+', label: 'Sertifikatlar', color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { icon: Globe, value: '15+', label: "O'qituvchilar", color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-dark-card border border-dark-border rounded-xl p-6 text-center"
              >
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <div className="bg-gradient-to-r from-brand-900/50 to-dark-card rounded-xl border border-brand-500/20 p-10">
            <h2 className="text-3xl font-bold text-white mb-4">Bizning Missiyamiz</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              ChatBot Edu O'zbekistondagi yosh dasturchilar va tadbirkorlarga zamonaviy AI texnologiyalarini 
              o'rganish imkoniyatini berish uchun yaratilgan. Biz ishonaamizki, kelajak sun'iy intellektga asoslanadi 
              va har kim bu texnologiyadan foydalana olishi kerak.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Groq AI, LangChain, RAG va boshqa eng so'nggi texnologiyalar bo'yicha amaliy kurslar, 
              kod misollari va tajribali o'qituvchilar orqali siz ham chatbot mutaxassisiga aylanishingiz mumkin.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Qadriyatlarimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-brand-500/40 transition-all"
              >
                <div className={`w-12 h-12 ${v.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <v.icon className={`w-6 h-6 ${v.color}`} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{v.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Jamoamiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                className="bg-dark-card border border-dark-border rounded-xl p-6 text-center hover:border-brand-500/40 transition-all"
              >
                <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4`}>
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-white font-semibold text-lg">{member.name}</h3>
                <p className="text-brand-400 text-sm mb-2">{member.role}</p>
                <p className="text-slate-500 text-sm">{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-dark-card border border-dark-border rounded-xl p-10">
            <h2 className="text-3xl font-bold text-white mb-4">Bog'lanish</h2>
            <p className="text-slate-400 mb-8">Savollaringiz bormi? Biz bilan bog'laning!</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:info@chatbotedu.uz" className="flex items-center gap-2 bg-dark-surface border border-dark-border text-slate-300 hover:text-white px-6 py-3 rounded-xl transition-all hover:border-brand-500/50">
                <Mail className="w-5 h-5 text-brand-400" /> info@chatbotedu.uz
              </a>
              <a href="https://t.me/chatbotedu" className="flex items-center gap-2 bg-dark-surface border border-dark-border text-slate-300 hover:text-white px-6 py-3 rounded-xl transition-all hover:border-brand-500/50">
                <Globe className="w-5 h-5 text-brand-400" /> Telegram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
