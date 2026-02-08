import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../../lib/theme'

export function DarkModeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-neutral-300" />
      ) : (
        <Moon className="w-5 h-5 text-neutral-600" />
      )}
    </button>
  )
}
