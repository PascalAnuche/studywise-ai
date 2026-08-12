import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import { TopbarStatus, TopbarStatusSkeleton } from '@/components/TopbarStatus';
import './globals.css';

export const metadata: Metadata = {
  title: 'StudyWise AI',
  description: 'Learn with confidence, explainable answers, study planning, and progress tracking.',
};

/**
 * The shell is deliberately not `force-dynamic`.
 *
 * It used to read the database directly for the topbar, which made every route
 * in the app dynamic and meant nothing reached the browser until that query
 * finished. The one part that needs data now streams behind Suspense instead,
 * so the sidebar and topbar paint immediately.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Applies the stored theme before first paint. Without it the page
          renders in the default theme and then repaints, which is a visible
          flash of the wrong colours on every load.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('studywise-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AppShell
          status={
            <Suspense fallback={<TopbarStatusSkeleton />}>
              <TopbarStatus />
            </Suspense>
          }
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
