#!/bin/bash
echo "🤖 ChatBot Edu - O'rnatish boshlanmoqda..."

# Node version check
node_version=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$node_version" ] || [ "$node_version" -lt 18 ]; then
  echo "❌ Node.js 18+ kerak. Joriy versiya: $(node -v 2>/dev/null || 'topilmadi')"
  echo "   https://nodejs.org dan yuklab oling"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# .env.local check
if [ ! -f ".env.local" ]; then
  echo "⚠️  .env.local fayli topilmadi!"
  echo "   .env.local faylni yarating va kerakli kalitlarni kiriting"
  exit 1
fi
echo "✅ .env.local topildi"

# Install
echo "📦 Paketlar o'rnatilmoqda..."
npm install

echo ""
echo "✅ O'rnatish tugadi!"
echo ""
echo "🚀 Ishga tushirish:"
echo "   npm run dev"
echo ""
echo "🌐 Brauzerda oching: http://localhost:3000"
