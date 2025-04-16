import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageIcon, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface ImageUploadProps {
  onImageChange: (file: File | null) => void
  disabled?: boolean
  className?: string
  label?: string
  description?: string
}

export function ImageUpload({ 
  onImageChange, 
  disabled = false,
  className,
  label = "",
  description = "Upload a single image (max 1MB)"
}: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError(null)

    if (!file) {
      setPreview(null)
      onImageChange(null)
      return
    }

    // Check file size (1MB = 1024 * 1024 bytes)
    if (file.size > 1024 * 1024) {
      setError("Image size must be less than 1MB")
      setPreview(null)
      onImageChange(null)
      return
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file")
      setPreview(null)
      onImageChange(null)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
      onImageChange(file)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    onImageChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <Label htmlFor="image-upload">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Choose Image
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {preview && (
          <div className="mt-2">
            <Image
              src={preview}
              alt="Preview"
              className="max-h-48 w-auto rounded-md border object-cover shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  )
} 