import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ImageGridProps {
  images: {
    original: string | null
    labeled: string | null
    grouped: string | null
    boxes: string | null
  }
}

export function ImageGrid({ images }: ImageGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Original Image</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-md border bg-muted">
            {images.original && (
              <Image
                src={images.original || "/placeholder.svg"}
                alt="Original"
                fill
                className="object-contain"
                unoptimized // Important to prevent Next.js from trying to optimize external images
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Connected Components</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-md border bg-muted">
            {images.labeled && (
              <Image
                src={images.labeled || "/placeholder.svg"}
                alt="Connected Components"
                fill
                className="object-contain"
                unoptimized // Important to prevent Next.js from trying to optimize external images
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Grouped Components</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-md border bg-muted">
            {images.grouped && (
              <Image
                src={images.grouped || "/placeholder.svg"}
                alt="Grouped Components"
                fill
                className="object-contain"
                unoptimized // Important to prevent Next.js from trying to optimize external images
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Bounding Boxes</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-md border bg-muted">
            {images.boxes && (
              <Image
                src={images.boxes || "/placeholder.svg"}
                alt="Bounding Boxes"
                fill
                className="object-contain"
                unoptimized // Important to prevent Next.js from trying to optimize external images
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
