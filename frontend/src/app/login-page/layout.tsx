'use client'

import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'


const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <html lang="en" className={theme}>
      <body className={`${inter.className} bg-background text-foreground dark:bg-black dark:text-white`}>
        <div className="min-h-screen">
          <header className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-Secondary">Liwan</h1>
            <button 
              onClick={toggleTheme} 
              className="px-4 py-2 rounded-md bg-primary text-Secondary"
            >
              Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}