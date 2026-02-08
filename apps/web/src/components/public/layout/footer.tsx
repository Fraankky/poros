import { Link } from '@tanstack/react-router'
import { usePublicCategories } from '../../../hooks/use-public-categories'

export function Footer() {
  const { data: categoriesData } = usePublicCategories()
  const categories = categoriesData?.categories || []

  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-sans font-extrabold text-2xl tracking-tight text-neutral-900 dark:text-white">
                POROS
              </span>
            </Link>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              Portal Berita POROS - Sumber informasi terpercaya seputar Jogja, kampus, dan nasional.
            </p>
          </div>

          {/* Categories */}
          <div className="md:col-span-2">
            <h3 className="font-sans font-semibold text-neutral-900 dark:text-white mb-4">
              Kategori
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to="/kategori/$slug"
                  params={{ slug: cat.slug }}
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-poros-600 dark:hover:text-poros-400 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-sans font-semibold text-neutral-900 dark:text-white mb-4">
              Kontak
            </h3>
            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <p>Email: redaksi@poros.id</p>
              <p>Jogja, Indonesia</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            © {new Date().getFullYear()} POROS. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-500">
            <Link to="/" className="hover:text-neutral-700 dark:hover:text-neutral-300">
              Tentang
            </Link>
            <Link to="/" className="hover:text-neutral-700 dark:hover:text-neutral-300">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
