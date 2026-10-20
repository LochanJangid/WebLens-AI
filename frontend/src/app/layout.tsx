import type { Metadata } from 'next';
import './globals.css';
import { AssistantProvider } from '@/context/AssistantContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlobalAssistant } from '@/components/assistant/GlobalAssistant';

export const metadata: Metadata = {
  title: 'WebLensAI — 100% Free AI Website Intelligence & Visual Improvement Studio',
  description:
    'Production-grade website auditing and screenshot-driven AI visual improvement studio built by Lochan Jangid. 100% free forever for all users. Give screenshots to Claude, GPT-4o, and Cursor to take your website to the next level.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  authors: [{ name: 'Lochan Jangid', url: 'https://lochan.vercel.app/' }],
  creator: 'Lochan Jangid',
  publisher: 'WebLensAI',
  keywords: [
    'WebLensAI',
    'Free Website Audit',
    'AI Visual Improvement',
    'Screenshot to LLM',
    'Claude Vision Prompt',
    'GPT-4o Vision',
    'Cursor Composer',
    'Lochan Jangid',
    'Core Web Vitals',
    'Accessibility WCAG',
  ],
  openGraph: {
    title: 'WebLensAI — 100% Free AI Website Intelligence & Screenshot Visual Improvement',
    description:
      'Analyze websites, download screenshots, generate multi-model vision prompts, transform code with same content, and chat with AI assistant. Built by Lochan Jangid. 100% Free.',
    siteName: 'WebLensAI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#050505] text-[#F7F7F8] antialiased selection:bg-[#F20D4F] selection:text-white">
        <AssistantProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <GlobalAssistant />
        </AssistantProvider>
      </body>
    </html>
  );
}
