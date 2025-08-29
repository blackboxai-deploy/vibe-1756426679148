import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ApiKeyProvider } from '@/components/providers/api-key-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Image Generator',
  description: 'Generate stunning images with OpenAI DALL-E',
  keywords: ['AI', 'image generation', 'DALL-E', 'OpenAI', 'artificial intelligence'],
  authors: [{ name: 'AI Image Generator' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#6366f1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800`}>
        <ApiKeyProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </ApiKeyProvider>
      </body>
    </html>
  )
}