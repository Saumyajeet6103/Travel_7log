import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'
import KonamiEgg from '@/components/shared/KonamiEgg'
import ServiceWorkerRegister from '@/components/shared/ServiceWorkerRegister'

const inter        = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  title: '7 Log — Matheran 2026 🏔️',
  description: '7 dost, 1 hill station, infinite chaos. Private trip tracker for the gang.',
  manifest: '/manifest.json',
  themeColor: '#52B788',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '7 Log',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-base text-foreground min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <KonamiEgg />
            <ServiceWorkerRegister />
          </AuthProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgb(var(--c-surface))',
                color:      'rgb(var(--c-foreground))',
                border:     '1px solid rgb(var(--c-subtle))',
                borderRadius: '12px',
                fontSize: '14px',
              },
              duration: 3500,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
