import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Sen "ChatBot Edu" platformasining aqlli AI yordamchisisan.

Vazifang:
1. Chatbot yaratishni o'rgatish (Python, JavaScript, boshqalar)
2. Dasturlash savollariga aniq javob berish
3. Kod misollarini code block ichida berish
4. LangChain, RAG, Groq, OpenAI API larini tushuntirish
5. Platform (ChatBot Edu) haqida yo'riqnoma berish

Bilimlar:
- Groq API, OpenAI API, Anthropic Claude API
- Telegram Bot: python-telegram-bot, aiogram, node-telegram-bot-api
- LangChain: chains, agents, memory, tools
- RAG: document loading, chunking, embeddings, vector stores
- Pinecone, Chroma, Weaviate, FAISS vector databases
- FastAPI, Flask bilan chatbot backend
- Docker, Railway, Heroku, Vercel deploy
- Prompt engineering va fine-tuning

Qoidalar:
- O'zbek tilida javob ber (inglizcha so'ralsa inglizcha)
- Kod misollarini \`\`\`python yoki \`\`\`javascript formatida ber
- Qisqa, aniq va amaliy javoblar ber`;

// Valid Groq models (2025)
const VALID_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'llama-3.1-70b-versatile',
  'llama-3.2-3b-preview',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
];

export async function POST(request) {
  try {
    const body = await request.json();
    let { messages, model = 'llama-3.3-70b-versatile' } = body;

    // Validate model - fallback to default if unknown
    if (!VALID_MODELS.includes(model)) {
      model = 'llama-3.3-70b-versatile';
    }

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages massivi bo\'sh yoki noto\'g\'ri' }, { status: 400 });
    }

    // Check API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key' || !apiKey.startsWith('gsk_')) {
      return NextResponse.json({
        error: 'GROQ_API_KEY topilmadi yoki noto\'g\'ri. .env.local faylga GROQ_API_KEY=gsk_... qo\'shing'
      }, { status: 500 });
    }

    // Clean messages — only role and content
    const cleanMessages = messages
      .map(m => ({ role: m.role, content: String(m.content || '') }))
      .filter(m => m.content.trim() && ['user', 'assistant', 'system'].includes(m.role))
      .slice(-20); // last 20 messages

    if (cleanMessages.length === 0) {
      return NextResponse.json({ error: 'Xabarlar bo\'sh' }, { status: 400 });
    }

    // Call Groq
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...cleanMessages,
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', groqRes.status, errText);

      // Parse Groq error for better message
      let errorMsg = `Groq API xatolik (${groqRes.status})`;
      try {
        const errJson = JSON.parse(errText);
        errorMsg = errJson.error?.message || errorMsg;
      } catch {}

      return NextResponse.json({ error: errorMsg }, { status: groqRes.status });
    }

    // Pass through the stream
    return new Response(groqRes.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat route exception:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
