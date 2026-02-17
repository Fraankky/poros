import { useState, useCallback } from 'react'

interface CoverUploadProps {
  currentImageUrl: string | null
  onUpload: (file: File) => void
  onDelete: () => void
  isUploading: boolean
  isDeleting: boolean
}

export function CoverUpload({
  currentImageUrl,
  onUpload,
  onDelete,
  isUploading,
  isDeleting,
}: CoverUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const hasExistingCover = !!currentImageUrl
  const displayImage = previewUrl || currentImageUrl

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile)
      setPreviewUrl(URL.createObjectURL(droppedFile))
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const clearSelection = () => {
    setFile(null)
    setPreviewUrl(null)
  }

  const handleUpload = () => {
    if (file) {
      onUpload(file)
      setFile(null)
      setPreviewUrl(null)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Cover Image</h2>

      {/* Current Cover Display */}
      {displayImage ? (
        <div className="mb-4 space-y-3">
          <div className="relative group">
            <img
              src={displayImage}
              alt="Cover"
              className="w-full h-48 object-cover rounded-lg"
            />
            {previewUrl && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Preview
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {hasExistingCover && !previewUrl && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this cover?')) {
                    onDelete()
                  }
                }}
                disabled={isDeleting}
                className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 text-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Cover'}
              </button>
            )}
            {previewUrl && (
              <button
                onClick={clearSelection}
                className="flex-1 bg-gray-100 text-black-600 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-4 p-8 bg-gray-100 rounded-lg text-center text-black-500">
          <svg className="mx-auto h-12 w-12 mb-2 text-black-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No cover image</p>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          id="cover-upload"
        />
        <label htmlFor="cover-upload" className="cursor-pointer block">
          <svg className="mx-auto h-8 w-8 mb-2 text-black-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-black-600">
            {isDragging ? 'Drop image here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-black-400 mt-1">
            JPG, PNG, WebP (max 10MB)
          </p>
        </label>
      </div>

      {/* Upload Button */}
      {file && (
        <div className="mt-4">
          <p className="text-sm text-black-600 mb-2">
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Upload Cover'}
          </button>
        </div>
      )}
    </div>
  )
}
