import DashboardLayout from '@/app/dashboard/layout';

// metadata va 'use client' birgalikda ishlamaydi,
// shuning uchun metadata ni page.jsx da head tag orqali beramiz
export default function ChatLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
