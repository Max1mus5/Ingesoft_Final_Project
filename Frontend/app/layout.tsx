/**
 * The system implements the root layout for the application.
 * This layout configures fonts, metadata, and global providers.
 */

import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

/**
 * The system configures the Inter font as specified in the technical manual.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

/**
 * The system configures Geist Mono for monospace text.
 */
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

/**
 * The system defines application metadata for SEO.
 */
export const metadata: Metadata = {
  title: 'Sistema de Incapacidades | Gestión Integral',
  description: 'Sistema integral de gestión de incapacidades y recobros. Administre incapacidades, alertas de vencimiento y conciliación financiera.',
  generator: 'Next.js',
  keywords: ['incapacidades', 'gestión', 'recobros', 'EPS', 'recursos humanos'],
  icons: {
    icon: [
      {
        url: '/icon.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.png',
        type: 'image/png',
      },
    ],
    apple: '/apple-icon.png',
  },
}

/**
 * The system configures viewport settings.
 */
export const viewport: Viewport = {
  themeColor: '#121212',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-[#121212]">
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-[#121212] text-[#E0E0E0]`}
      >
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
