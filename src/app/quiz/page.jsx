'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, Trash2, Edit2, X, Save, Loader2,
  CheckCircle, Circle, ChevronDown, ChevronUp, Send, Award
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc,
  serverTimestamp, query, orderBy, where, setDoc
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '@/app/dashboard/layout';

// ── QuizForm ──────────────────────────────────────────────
function QuizForm({ quiz, onSave, onClose }) {
  const [form, setForm] = useState(quiz || {
    title: '', description: '', targetRole: 'student',
    questions: [{ text: '', options: ['', '', '', ''], correct: 0 }]
  });
  const [saving, setSaving] = useState(false);

  const addQ = () => setForm(p => ({
    ...p,
    questions: [...p.questions, { text: '', options: ['', '', '', ''], correct: 0 }]
  }));

  const removeQ = (i) => setForm(p => ({
    ...p, questions: p.questions.filter((_, j) => j !== i)
  }));

  const updateQ = (i, key, val) => setForm(p => ({
    ...p,
    questions: p.questions.map((q, j) => j === i ? { ...q, [key]: val } : q)
  }));

  const updateOption = (qi, oi, val) => setForm(p => ({
    ...p,
    questions: p.questions.map((q, j) => j !== qi ? q : {
      ...q, options: q.options.map((o, k) => k === oi ? val : o)
    })
  }));

  const handle = async () => {
    if (!form.title.trim()) { toast.error('Sarlavha kiriting'); return; }
    if (form.questions.some(q => !q.text.trim())) { toast.error('Barcha savollarni to\'ldiring'); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-card border border-dark-border rounded-xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-dark-border flex-shrink-0">
          <h3 className="text-white font-semibold text-lg">{quiz ? "So'rovnomani tahrirlash" : "Yangi So'rovnoma"}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Meta */}
          <div className="space-y-3">
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="So'rovnoma sarlavhasi *"
              className="w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Qisqa tavsif (ixtiyoriy)"
              className="w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
            <div>
              <label className="text-slate-400 text-xs mb-2 block">Kimga mo'ljallangan?</label>
              <select value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))}
                className="w-full bg-dark-surface border border-dark-border text-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500">
                <option value="student">Talabalar</option>
                <option value="teacher">O'qituvchilar</option>
                <option value="all">Hammasi</option>
              </select>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium text-sm">Savollar ({form.questions.length})</h4>
              <button onClick={addQ} className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 text-sm transition-colors">
                <Plus className="w-4 h-4" /> Savol qo'shish
              </button>
            </div>
            {form.questions.map((q, qi) => (
              <div key={qi} className="bg-dark-surface border border-dark-border rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-slate-500 text-sm font-medium mt-3 flex-shrink-0">{qi + 1}.</span>
                  <input value={q.text} onChange={e => updateQ(qi, 'text', e.target.value)}
                    placeholder={`${qi + 1}-savol matni`}
                    className="flex-1 bg-dark-bg border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
                  {form.questions.length > 1 && (
                    <button onClick={() => removeQ(qi)} className="p-2 text-slate-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-2 pl-5">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button onClick={() => updateQ(qi, 'correct', oi)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${q.correct === oi ? 'border-emerald-500 bg-emerald-500' : 'border-dark-border hover:border-emerald-500/50'}`}>
                        {q.correct === oi && <div className="w-2 h-2 bg-white rounded-full" />}
                      </button>
                      <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)}
                        placeholder={`${String.fromCharCode(65 + oi)} variant`}
                        className="flex-1 bg-dark-bg border border-dark-border text-slate-300 placeholder-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                    </div>
                  ))}
                  <p className="text-slate-600 text-xs pl-7">Yashil doira — to'g'ri javob</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-dark-border flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 border border-dark-border text-slate-400 hover:text-white py-3 rounded-xl text-sm transition-colors">Bekor</button>
          <button onClick={handle} disabled={saving}
            className="flex-1 bg-brand-500 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Saqlash
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── QuizTake ──────────────────────────────────────────────
function QuizTake({ quiz, userId, onClose }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const submit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error('Barcha savollarga javob bering'); return;
    }
    let correct = 0;
    quiz.questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const sc = Math.round((correct / quiz.questions.length) * 100);
    setScore(sc);
    setSubmitted(true);
    try {
      await setDoc(doc(db, 'quizResults', `${userId}_${quiz.id}`), {
        userId, quizId: quiz.id, quizTitle: quiz.title,
        score: sc, correct, total: quiz.questions.length,
        answers, completedAt: serverTimestamp(),
      });
    } catch (e) { console.error(e); }
  };

  if (submitted) return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-card border border-dark-border rounded-xl p-10 text-center max-w-sm w-full">
        <div className={`w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-5 ${score >= 70 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
          {score >= 70 ? <Award className="w-10 h-10 text-emerald-400" /> : <ClipboardList className="w-10 h-10 text-red-400" />}
        </div>
        <h3 className="text-white text-3xl font-bold mb-2">{score}%</h3>
        <p className={`font-semibold mb-2 ${score >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
          {score >= 70 ? 'Ajoyib natija!' : 'Qayta urinib ko\'ring'}
        </p>
        <p className="text-slate-400 text-sm mb-8">
          {quiz.questions.filter((q, i) => answers[i] === q.correct).length} / {quiz.questions.length} to'g'ri javob
        </p>
        <button onClick={onClose} className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-medium transition-colors">Yopish</button>
      </motion.div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-card border border-dark-border rounded-xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-dark-border flex-shrink-0">
          <div>
            <h3 className="text-white font-semibold">{quiz.title}</h3>
            <p className="text-slate-500 text-xs mt-0.5">{quiz.questions.length} ta savol</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {quiz.questions.map((q, qi) => (
            <div key={qi} className="bg-dark-surface border border-dark-border rounded-xl p-4">
              <p className="text-white font-medium mb-4">{qi + 1}. {q.text}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setAnswers(p => ({ ...p, [qi]: oi }))}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-all border ${answers[qi] === oi ? 'bg-brand-500/20 border-brand-500/50 text-white' : 'border-dark-border text-slate-300 hover:border-slate-600 hover:bg-dark-bg'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${answers[qi] === oi ? 'border-brand-500 bg-brand-500' : 'border-dark-border'}`}>
                      {answers[qi] === oi && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="font-medium text-slate-500 flex-shrink-0">{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-dark-border flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 border border-dark-border text-slate-400 hover:text-white py-3 rounded-xl text-sm transition-colors">Bekor</button>
          <button onClick={submit}
            className="flex-1 bg-brand-500 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Topshirish ({Object.keys(answers).length}/{quiz.questions.length})
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function QuizPage() {
  const { userProfile, isAdmin, isTeacher } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [takeQuiz, setTakeQuiz] = useState(null);
  const [expanded, setExpanded] = useState({});

  const canManage = isAdmin || isTeacher;

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'quizzes'), orderBy('createdAt', 'desc')));
      setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      // orderBy index yo'q bo'lsa
      const snap = await getDocs(collection(db, 'quizzes'));
      setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  };

  const saveQuiz = async (form) => {
    try {
      if (editQuiz) {
        await updateDoc(doc(db, 'quizzes', editQuiz.id), { ...form, updatedAt: serverTimestamp() });
        toast.success('Yangilandi!');
      } else {
        await addDoc(collection(db, 'quizzes'), {
          ...form,
          creatorId: userProfile.uid,
          creatorName: userProfile.displayName,
          createdAt: serverTimestamp(),
        });
        toast.success("So'rovnoma qo'shildi!");
      }
      setShowForm(false); setEditQuiz(null);
      fetchQuizzes();
    } catch (e) { toast.error(e.message); }
  };

  const deleteQuiz = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteDoc(doc(db, 'quizzes', id));
      setQuizzes(p => p.filter(q => q.id !== id));
      toast.success("O'chirildi");
    } catch (e) { toast.error(e.message); }
  };

  const roleColor = (r) => r === 'student' ? 'bg-blue-500/20 text-blue-400' : r === 'teacher' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400';
  const roleLabel = (r) => r === 'student' ? 'Talabalar' : r === 'teacher' ? "O'qituvchilar" : 'Hammasi';

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-brand-400" /> So'rovnomalar
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">{quizzes.length} ta so'rovnoma</p>
          </div>
          {canManage && (
            <button onClick={() => { setEditQuiz(null); setShowForm(true); }}
              className="flex items-center gap-2 bg-brand-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 ">
              <Plus className="w-4 h-4" /> Yangi So'rovnoma
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-24">
            <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-slate-400 font-semibold text-lg mb-2">So'rovnoma yo'q</h3>
            {canManage && <p className="text-slate-600 text-sm">Birinchi so'rovnomani yarating</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map(quiz => (
              <motion.div key={quiz.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-brand-500/30 transition-all">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${roleColor(quiz.targetRole)}`}>
                          {roleLabel(quiz.targetRole)}
                        </span>
                        <span className="text-slate-500 text-xs">{quiz.questions?.length || 0} savol</span>
                        <span className="text-slate-600 text-xs">• {quiz.creatorName}</span>
                      </div>
                      <h3 className="text-white font-semibold">{quiz.title}</h3>
                      {quiz.description && <p className="text-slate-400 text-sm mt-1">{quiz.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setTakeQuiz(quiz)}
                        className="flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm px-4 py-2 rounded-xl hover:bg-brand-500/20 transition-all font-medium">
                        Boshlash
                      </button>
                      {canManage && (
                        <>
                          <button onClick={() => { setEditQuiz(quiz); setShowForm(true); }}
                            className="p-2 text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-xl transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteQuiz(quiz.id)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Toggle questions preview */}
                  <button onClick={() => setExpanded(p => ({ ...p, [quiz.id]: !p[quiz.id] }))}
                    className="mt-3 flex items-center gap-1 text-slate-500 hover:text-slate-300 text-xs transition-colors">
                    {expanded[quiz.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {expanded[quiz.id] ? 'Yopish' : 'Savollarni ko\'rish'}
                  </button>
                </div>

                <AnimatePresence>
                  {expanded[quiz.id] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-dark-border bg-dark-surface px-5 py-4 space-y-3 overflow-hidden">
                      {quiz.questions?.map((q, i) => (
                        <div key={i} className="text-sm">
                          <p className="text-slate-300 font-medium mb-1">{i + 1}. {q.text}</p>
                          <div className="grid grid-cols-2 gap-1.5 pl-4">
                            {q.options?.map((opt, j) => (
                              <div key={j} className={`flex items-center gap-2 text-xs px-2 py-1 rounded-lg ${j === q.correct ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'}`}>
                                {j === q.correct ? <CheckCircle className="w-3 h-3 flex-shrink-0" /> : <Circle className="w-3 h-3 flex-shrink-0" />}
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && <QuizForm quiz={editQuiz} onSave={saveQuiz} onClose={() => { setShowForm(false); setEditQuiz(null); }} />}
        {takeQuiz && <QuizTake quiz={takeQuiz} userId={userProfile?.uid} onClose={() => setTakeQuiz(null)} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
