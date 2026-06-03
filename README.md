# ChatBot Edu 🤖

O'zbek tilida chatbot yaratishni o'rgatuvchi ta'lim platformasi.

## Tuzatilgan xatolar

1. **`firebase-admin` paketi** — `package.json` ga qo'shildi (avval yo'q edi)
2. **`next.config.js`** — `domains` o'rniga `remotePatterns` ishlatildi (Next.js 14 talab qiladi)
3. **`firebase.js`** — `getAnalytics` xatosi tuzatildi (`isSupported()` bilan)
4. **`groq.js`** — eskirgan `llama-3.1-405b-reasoning` modeli `llama-3.3-70b-versatile` ga o'zgartirildi
5. **`api/chat/route.js`** — model validatsiyasi va xato xabarlar yaxshilandi
6. **`api/upload/route.js`** — `max_bytes` (Cloudinary da mavjud emas) o'chirildi
7. **`dashboard/layout.jsx`** — `useEffect` dependency array tuzatildi (`router` qo'shildi)
8. **`chat/layout.jsx`** — `metadata` + `'use client'` ziddiyati tuzatildi
9. **`src/components/`** — macOS glob bug tufayli `{ui,layout,...}` nomli papka tuzatildi

## O'rnatish

```bash
npm install
npm run dev
```

## Muhit o'zgaruvchilar (.env.local)

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin (server)
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=...

# Groq AI
GROQ_API_KEY=gsk_...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Texnologiyalar

- **Next.js 14** (App Router)
- **Firebase** (Auth + Firestore + Storage)
- **Groq AI** (Llama 3.3 70B)
- **Tailwind CSS** + DaisyUI
- **Framer Motion**
- **Cloudinary** (fayl yuklash)
# chatbot-in-education
