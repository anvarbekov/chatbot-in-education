import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'ChatBot Edu - Chatbot Yaratishni O\'rgan',
  description: 'Eng zamonaviy platforma orqali chatbot yaratishni o\'rganing. Kurslar, resurslar va AI yordamchi bilan.',
  keywords: 'chatbot, AI, ta\'lim, kurslar, o\'zbek, machine learning',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz" data-theme="chatbotedu">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#181c24',
                  color: '#d4d8e2',
                  border: '1px solid #252c3b',
                  borderRadius: '8px',
                  fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                },
                success: { iconTheme: { primary: '#3db88a', secondary: '#181c24' } },
                error:   { iconTheme: { primary: '#e0607e', secondary: '#181c24' } },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
