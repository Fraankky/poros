import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Navbar } from '../components/public/layout/navbar'
import { Footer } from '../components/public/layout/footer'
import { SearchModal } from '../components/public/ui/search-modal'

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

function PublicLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      
      <main className="pt-16">
        <Outlet />
      </main>
      
      <Footer />
      
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  )
}
