import { useReadingProgress } from '../../../hooks/use-reading-progress'

export function ReadingProgress() {
  const { progress } = useReadingProgress()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent">
      <div
        className="h-full bg-poros-600 dark:bg-poros-400 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
