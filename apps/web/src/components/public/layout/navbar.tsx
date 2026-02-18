import { useState, useEffect, useRef } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { Search, Menu, X, ChevronDown } from 'lucide-react'
import { DarkModeToggle } from '../ui/dark-mode-toggle'
import { CATEGORIES } from '../../../config/categories'

interface NavbarProps {
  onSearchClick: () => void
}

const BERITA_CATEGORIES = CATEGORIES.berita
const OTHER_CATEGORIES = CATEGORIES.others

export function Navbar({ onSearchClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isBeritaDropdownOpen, setIsBeritaDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    return router.subscribe('onResolved', () => {
      setIsMobileMenuOpen(false)
      setIsBeritaDropdownOpen(false)
    })
  }, [router])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isBeritaDropdownOpen) return
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBeritaDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isBeritaDropdownOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md shadow-sm'
            : 'bg-white dark:bg-neutral-950'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className="font-sans font-extrabold text-2xl tracking-tight text-neutral-900 dark:text-white">
                POROS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Berita Dropdown */}
              <div 
                className="relative" 
                ref={dropdownRef}
                onMouseEnter={() => setIsBeritaDropdownOpen(true)}
                onMouseLeave={() => setIsBeritaDropdownOpen(false)}
              >
                <button
                  onClick={() => setIsBeritaDropdownOpen(!isBeritaDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 text-[15px] font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Berita
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 ${isBeritaDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Dropdown with smooth transition - pt-2 creates hover bridge without gap */}
                <div
                  className={`absolute top-full left-0 pt-2 w-48 transition-all duration-200 origin-top ${
                    isBeritaDropdownOpen 
                      ? 'opacity-100 scale-100 translate-y-0 visible' 
                      : 'opacity-0 scale-95 -translate-y-2 invisible'
                  }`}
                >
                  <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800 py-1 overflow-hidden">
                    {BERITA_CATEGORIES.map(cat => (
                      <Link
                        key={cat.slug}
                        to="/kategori/$slug"
                        params={{ slug: cat.slug }}
                        onClick={() => setIsBeritaDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Other Categories */}
              {OTHER_CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  to="/kategori/$slug"
                  params={{ slug: cat.slug }}
                  className="px-3 py-2 text-[15px] font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={onSearchClick}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>

              <DarkModeToggle />

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                ) : (
                  <Menu className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 shadow-lg">
            <div className="px-4 py-4 space-y-1">
              {/* Berita Section */}
              <div className="py-2">
                <span className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Berita
                </span>
                <div className="mt-1 space-y-1">
                  {BERITA_CATEGORIES.map(cat => (
                    <Link
                      key={cat.slug}
                      to="/kategori/$slug"
                      params={{ slug: cat.slug }}
                      className="block px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 my-2" />

              {/* Other Categories */}
              {OTHER_CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  to="/kategori/$slug"
                  params={{ slug: cat.slug }}
                  className="block px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
