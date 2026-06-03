import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;

export const GROQ_MODELS = {
  FAST: 'llama-3.1-8b-instant',
  BALANCED: 'llama-3.3-70b-versatile',
  POWERFUL: 'llama-3.3-70b-versatile', // 405b deprecated, fallback to 70b
  MIXTRAL: 'mixtral-8x7b-32768',
};

export const SYSTEM_PROMPTS = {
  TUTOR: `Sen "ChatBot Edu" platformasining aqlli AI yordamchisisan. Sening vazifang:
1. Foydalanuvchilarga chatbot yaratishni o'rgatish
2. Platform haqida yo'riqnoma berish
3. Dasturlash savollariga javob berish (Python, JavaScript, va boshqalar)
4. Kurs va materiallar haqida ma'lumot berish
5. Talabalar va o'qituvchilarga yordam berish

Platform imkoniyatlari:
- Kurslar yaratish va boshqarish (Admin va Teacher uchun)
- Kurslarga yozilish (Student uchun)
- PDF materiallarni yuklash va o'qish
- Real-time chat va xabarlar
- Sertifikatlar olish

Chatbot yaratish bo'yicha bilimlar:
- Groq API, OpenAI API, Anthropic API
- LangChain va LlamaIndex frameworklari
- Vector databases (Pinecone, Chroma)
- RAG (Retrieval Augmented Generation)
- Fine-tuning texnikalari
- Deployment va production

Doim o'zbek tilida javob ber, agar inglizcha so'ralsa inglizcha javob ber.
Qisqa, aniq va foydali javoblar ber.`,

  CODE_REVIEW: `Sen tajribali dasturchi va kod reviewer sisan. Kodni tahlil qil, xatolarni topi, yaxshilash tavsiyalarini ber.`,

  QUIZ_GENERATOR: `Sen ta'lim platformasida quiz yaratuvchi assistantsan. Berilgan mavzu bo'yicha test savollar va javoblar yaratasan.`,
};

export const chatWithGroq = async (messages, systemPrompt = SYSTEM_PROMPTS.TUTOR, model = GROQ_MODELS.BALANCED) => {
  try {
    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 2048,
      stream: false,
    });

    return {
      success: true,
      message: completion.choices[0]?.message?.content || '',
      usage: completion.usage,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const streamChatWithGroq = async (messages, systemPrompt = SYSTEM_PROMPTS.TUTOR, model = GROQ_MODELS.BALANCED) => {
  const stream = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  });

  return stream;
};
