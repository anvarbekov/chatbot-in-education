'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun, Moon, Monitor, Type, Globe, Bell, Volume2,
  Layout, RotateCcw, Check, Shield,
  Palette, Sliders, Save, Loader2
} from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';
import { useTheme } from '@/context/ThemeContext';
import toast from 'react-hot-toast';

// ── helpers ──────────────────────────────────────────────────────────────────

function SettingSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-dark-border bg-dark-surface/50">
        <div className="w-8 h-8 bg-brand-500/10 border border-brand-500/20 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-400" />
        </div>
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function ToggleSwitch({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-slate-200 text-sm font-medium">{label}</p>
        {description && <p className="text-slate-500 text-xs mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          enabled ? 'bg-brand-500' : 'bg-dark-surface border border-dark-border'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}

function OptionGroup({ options, selected, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            selected === opt.value
              ? 'bg-brand-500/15 border-brand-500/50 text-brand-400'
              : 'bg-dark-surface border-dark-border text-slate-400 hover:border-slate-500 hover:text-slate-200'
          }`}
        >
          {opt.icon && <opt.icon className="w-4 h-4" />}
          {opt.label}
          {selected === opt.value && <Check className="w-3.5 h-3.5" />}
        </button>
      ))}
    </div>
  );
}

// ── Email notifications — state hoisted out of map ────────────────────────────
const EMAIL_ITEMS = [
  { label: "Yangi kurs qo'shilganda",  desc: "Admin yangi kurs e'lon qilganda email oling",     key: 'newCourse'  },
  { label: 'Kurs yangilanishlar',       desc: 'Yozilgan kurslaringiz yangilanganda xabar oling',  key: 'updates'    },
  { label: 'Haftalik hisobot',          desc: "O'quv progress hisoboti har hafta yuboriladi",      key: 'weekly'     },
  { label: 'Yangi xabarlar',            desc: 'Boshqa foydalanuvchilardan xabar kelganda',         key: 'messages'   },
];
const EMAIL_DEFAULTS = { newCourse: true, updates: true, weekly: false, messages: true };

const PRIVACY_ITEMS = [
  { label: "Profilni ommaviy ko'rsatish", desc: 'Boshqa foydalanuvchilar profilingizni ko\'ra oladi', key: 'publicProfile' },
  { label: "O'quv progress",               desc: "Progressingiz boshqalarga ko'rinadi",                key: 'progress'      },
  { label: 'Online holat',                 desc: "Online ekanligingiz ko'rinadi",                      key: 'onlineStatus'  },
];
const PRIVACY_DEFAULTS = { publicProfile: true, progress: false, onlineStatus: true };

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const {
    theme, setTheme,
    fontSize, setFontSize,
    language, setLanguage,
    sidebarCollapsed, setSidebarCollapsed,
    notificationsEnabled, setNotificationsEnabled,
    soundEnabled, setSoundEnabled,
    autoPlay, setAutoPlay,
    resetSettings,
  } = useTheme();

  const [activeTab, setActiveTab]       = useState('appearance');
  const [saving, setSaving]             = useState(false);
  const [emailToggles, setEmailToggles] = useState(EMAIL_DEFAULTS);
  const [privacyToggles, setPrivacyToggles] = useState(PRIVACY_DEFAULTS);

  const tabs = [
    { id: 'appearance',    label: "Ko'rinish",       icon: Palette  },
    { id: 'notifications', label: 'Bildirishnomalar', icon: Bell     },
    { id: 'accessibility', label: 'Qulaylik',         icon: Sliders  },
    { id: 'privacy',       label: 'Maxfiylik',        icon: Shield   },
  ];

  const handleReset = () => {
    if (confirm('Barcha sozlamalarni tiklashni xohlaysizmi?')) {
      resetSettings();
      setEmailToggles(EMAIL_DEFAULTS);
      setPrivacyToggles(PRIVACY_DEFAULTS);
      toast.success('Sozlamalar tiklandi!');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast.success('Sozlamalar saqlandi!');
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Sozlamalar</h1>
            <p className="text-slate-400 text-sm mt-1">Ilova ko'rinishi va xulq-atvorini moslashtiring</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleReset}
              className="flex items-center gap-2 border border-dark-border text-slate-400 hover:text-white text-sm px-4 py-2.5 rounded-xl transition-colors">
              <RotateCcw className="w-4 h-4" /> Tiklash
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm px-5 py-2.5 rounded-xl transition-colors font-medium disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Saqlash
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-dark-card border border-dark-border rounded-xl mb-6">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Appearance ── */}
        {activeTab === 'appearance' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <SettingSection title="Rang rejimi" icon={Palette}>
              <p className="text-slate-400 text-xs mb-3">Ilova rang sxemasini tanlang</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'dark',   label: 'Qora rejim', icon: Moon,    preview: 'bg-slate-900 border-slate-700' },
                  { value: 'light',  label: 'Oq rejim',   icon: Sun,     preview: 'bg-white border-slate-200'    },
                  { value: 'system', label: 'Tizim',      icon: Monitor, preview: 'bg-gradient-to-r from-slate-900 to-white border-slate-500' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setTheme(opt.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      theme === opt.value
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-dark-border bg-dark-surface hover:border-slate-500'
                    }`}>
                    <div className={`w-full h-16 rounded-lg ${opt.preview} mb-3 overflow-hidden border`}>
                      <div className="flex gap-1 p-2">
                        <div className="w-2 h-2 rounded-full bg-red-400 opacity-70" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400 opacity-70" />
                        <div className="w-2 h-2 rounded-full bg-green-400 opacity-70" />
                      </div>
                      <div className="px-2 space-y-1">
                        <div className={`h-1.5 rounded ${opt.value === 'light' ? 'bg-slate-200' : 'bg-slate-700'} w-3/4`} />
                        <div className={`h-1.5 rounded ${opt.value === 'light' ? 'bg-slate-200' : 'bg-slate-700'} w-1/2`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <opt.icon className={`w-4 h-4 ${theme === opt.value ? 'text-brand-400' : 'text-slate-500'}`} />
                      <span className={`text-sm font-medium ${theme === opt.value ? 'text-brand-400' : 'text-slate-400'}`}>
                        {opt.label}
                      </span>
                    </div>
                    {theme === opt.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SettingSection>

            <SettingSection title="Matn o'lchami" icon={Type}>
              <p className="text-slate-400 text-xs mb-3">Foydalanuvchi interfeysi uchun shrift o'lchamini tanlang</p>
              <OptionGroup
                options={[
                  { value: 'small',  label: "Kichik" },
                  { value: 'medium', label: "O'rta"  },
                  { value: 'large',  label: "Katta"  },
                ]}
                selected={fontSize}
                onChange={setFontSize}
              />
              <div className="mt-3 p-3 bg-dark-surface rounded-xl border border-dark-border">
                <p className={`text-slate-300 ${fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                  Namuna matn: O'quv platformasiga xush kelibsiz!
                </p>
              </div>
            </SettingSection>

            <SettingSection title="Til" icon={Globe}>
              <p className="text-slate-400 text-xs mb-3">Interfeys tilini tanlang</p>
              <OptionGroup
                options={[
                  { value: 'uz', label: "O'zbek"  },
                  { value: 'ru', label: 'Русский' },
                  { value: 'en', label: 'English' },
                ]}
                selected={language}
                onChange={setLanguage}
              />
            </SettingSection>

            <SettingSection title="Interfeys" icon={Layout}>
              <ToggleSwitch
                enabled={sidebarCollapsed}
                onChange={setSidebarCollapsed}
                label="Yon panelni yig'ish"
                description="Yon navigatsiya panelini avtomatik yig'ish"
              />
            </SettingSection>
          </motion.div>
        )}

        {/* ── Notifications ── */}
        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <SettingSection title="Bildirishnomalar" icon={Bell}>
              <ToggleSwitch
                enabled={notificationsEnabled}
                onChange={setNotificationsEnabled}
                label="Bildirishnomalarni yoqish"
                description="Yangi kurslar, xabarlar va yangilanishlar haqida xabar oling"
              />
              <div className="pt-2 border-t border-dark-border">
                <ToggleSwitch
                  enabled={soundEnabled}
                  onChange={setSoundEnabled}
                  label="Ovozli bildirishnomalar"
                  description="Yangi xabar kelganda ovoz chiqarish"
                />
              </div>
            </SettingSection>

            <SettingSection title="Email bildirishnomalar" icon={Bell}>
              <div className="space-y-4">
                {EMAIL_ITEMS.map(item => (
                  <ToggleSwitch
                    key={item.key}
                    enabled={emailToggles[item.key] && notificationsEnabled}
                    onChange={v => setEmailToggles(prev => ({ ...prev, [item.key]: v }))}
                    label={item.label}
                    description={item.desc}
                  />
                ))}
              </div>
            </SettingSection>
          </motion.div>
        )}

        {/* ── Accessibility ── */}
        {activeTab === 'accessibility' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <SettingSection title="Qulaylik sozlamalari" icon={Sliders}>
              <ToggleSwitch
                enabled={autoPlay}
                onChange={setAutoPlay}
                label="Videolarni avtomatik ijro etish"
                description="Kurs sahifasini ochganda video avtomatik boshlanadi"
              />
            </SettingSection>
            <SettingSection title="Animatsiyalar" icon={Sliders}>
              <p className="text-slate-400 text-xs">Bu sozlamalar tez orada qo'shiladi.</p>
              <div className="p-3 bg-dark-surface rounded-xl border border-dark-border space-y-1">
                <p className="text-slate-500 text-xs">✓ Sahifa o'tish animatsiyalari yoqilgan</p>
                <p className="text-slate-500 text-xs">✓ Hover effektlari yoqilgan</p>
              </div>
            </SettingSection>
          </motion.div>
        )}

        {/* ── Privacy ── */}
        {activeTab === 'privacy' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <SettingSection title="Profil maxfiyligi" icon={Shield}>
              <div className="space-y-4">
                {PRIVACY_ITEMS.map(item => (
                  <ToggleSwitch
                    key={item.key}
                    enabled={privacyToggles[item.key]}
                    onChange={v => setPrivacyToggles(prev => ({ ...prev, [item.key]: v }))}
                    label={item.label}
                    description={item.desc}
                  />
                ))}
              </div>
            </SettingSection>

            <SettingSection title="Ma'lumotlar" icon={Shield}>
              <div className="space-y-3">
                <div className="p-4 bg-dark-surface rounded-xl border border-dark-border">
                  <p className="text-slate-300 text-sm font-medium mb-1">Ma'lumotlarni yuklab olish</p>
                  <p className="text-slate-500 text-xs mb-3">Barcha shaxsiy ma'lumotlaringizni JSON formatida yuklab oling</p>
                  <button className="text-brand-400 hover:text-brand-300 text-sm border border-brand-500/30 px-4 py-2 rounded-lg hover:bg-brand-500/10 transition-colors">
                    Yuklab olish
                  </button>
                </div>
                <div className="p-4 bg-dark-surface rounded-xl border border-red-500/20">
                  <p className="text-red-400 text-sm font-medium mb-1">Hisobni o'chirish</p>
                  <p className="text-slate-500 text-xs mb-3">Bu amalni bekor qilib bo'lmaydi. Barcha ma'lumotlaringiz o'chib ketadi.</p>
                  <button className="text-red-400 hover:text-red-300 text-sm border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
                    Hisobni o'chirish
                  </button>
                </div>
              </div>
            </SettingSection>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}