// "use client"

// import { useState, useCallback, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Loader2, Upload, ImageIcon, Download, RefreshCw, Server } from "lucide-react"
// import Image from "next/image"
// import { useDropzone } from "react-dropzone"
// import { Progress } from "@/components/ui/progress"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { cn } from "@/lib/utils"
// import { ImageGrid } from "@/components/image-grid"
// import { ComponentStats } from "@/components/component-stats"

// export default function Home() {
//   const [file, setFile] = useState<File | null>(null)
//   const [preview, setPreview] = useState<string | null>(null)
//   const [result, setResult] = useState<string | null>(null)
//   const [mask, setMask] = useState<string | null>(null)
//   const [overlay, setOverlay] = useState<string | null>(null)
//   const [totalComponents, setTotalComponents] = useState<number | null>(null)
//   const [groupsFound, setGroupsFound] = useState<number | null>(null)
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [progress, setProgress] = useState(0)
//   const [activeTab, setActiveTab] = useState("upload")
//   const [processingStage, setProcessingStage] = useState<string | null>(null)
//   const [serverStatus, setServerStatus] = useState<"unknown" | "online" | "offline">("unknown")

//   useEffect(() => {
//     checkServerStatus()
//   }, [])

//   const checkServerStatus = async () => {
//     try {
//       const controller = new AbortController()
//       const timeoutId = setTimeout(() => controller.abort(), 3000)

//       const response = await fetch("http://localhost:8000/api/process-image", {
//         method: "HEAD",
//         signal: controller.signal,
//       }).catch(() => null)

//       clearTimeout(timeoutId)
//       setServerStatus(response && response.ok ? "online" : "offline")
//     } catch (e) {
//       setServerStatus("offline")
//     }
//   }

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     const selectedFile = acceptedFiles[0]
//     if (selectedFile) {
//       setFile(selectedFile)
//       setResult(null)
//       setMask(null)
//       setOverlay(null)
//       setTotalComponents(null)
//       setGroupsFound(null)
//       setError(null)

//       const reader = new FileReader()
//       reader.onload = (event) => {
//         setPreview(event.target?.result as string)
//       }
//       reader.readAsDataURL(selectedFile)
//     }
//   }, [])

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: {
//       "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
//     },
//     maxFiles: 1,
//   })

//   const processImage = async () => {
//     if (!file) return

//     setIsProcessing(true)
//     setError(null)
//     setProgress(0)
//     setActiveTab("result")

//     try {
//       setProcessingStage("Preparing image")
//       await simulateProgress(0, 20)

//       const formData = new FormData()
//       formData.append("image", file)

//       setProcessingStage("Uploading to Python server")
//       await simulateProgress(20, 40)

//       setProcessingStage("Analyzing components")
//       await simulateProgress(40, 70)

//       const response = await fetch("/api/process-image", {
//         method: "POST",
//         body: formData,
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || "Failed to process image")
//       }

//       const data = await response.json()

//       setProcessingStage("Finalizing results")
//       await simulateProgress(70, 100)

//       setResult(data.resultImageUrl)
//       setMask(data.maskImageUrl)
//       setOverlay(data.overlayImageUrl)
//       setTotalComponents(data.totalComponentsFound)
//       setGroupsFound(data.groupsFound)
//       setProcessingStage(null)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An unknown error occurred")
//     } finally {
//       setIsProcessing(false)
//       setProgress(100)
//     }
//   }

//   const simulateProgress = async (from: number, to: number) => {
//     const duration = 1000
//     const steps = 20
//     const increment = (to - from) / steps

//     for (let i = 0; i <= steps; i++) {
//       await new Promise((resolve) => setTimeout(resolve, duration / steps))
//       setProgress(Math.min(from + increment * i, to))
//     }
//   }

//   const resetForm = () => {
//     setFile(null)
//     setPreview(null)
//     setResult(null)
//     setMask(null)
//     setOverlay(null)
//     setTotalComponents(null)
//     setGroupsFound(null)
//     setError(null)
//     setProgress(0)
//     setActiveTab("upload")
//     setProcessingStage(null)
//   }

//   const downloadResult = () => {
//     if (!result) return

//     // Create a temporary link element
//     const link = document.createElement("a")
//     link.href = result
//     link.download = "labeled-components.png"
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
//       <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//         <div className="container flex h-16 items-center px-4">
//           <div className="flex items-center gap-2">
//             <ImageIcon className="h-6 w-6 text-primary" />
//             <h1 className="text-xl font-bold">Component Labeling</h1>
//           </div>
//           <div className="ml-auto flex items-center gap-2">
//             <Badge variant={serverStatus === "online" ? "outline" : "destructive"} className="flex items-center gap-1">
//               <Server className="h-3 w-3" />
//               {serverStatus === "online" ? "Python Server Connected" : "Python Server Offline"}
//             </Badge>
//             <Badge variant="outline" className="hidden sm:inline-flex">
//               Image Processing
//             </Badge>
//           </div>
//         </div>
//       </header>

//       <div className="container py-10 px-4">
//         <div className="mx-auto max-w-5xl">
//           {serverStatus !== "online" && (
//             <Alert variant="destructive" className="mb-6">
//               <Server className="h-4 w-4" />
//               <AlertTitle>Python Server Not Connected</AlertTitle>
//               <AlertDescription>
//                 <p>The Python Flask server is not running or not accessible. Please start the server with:</p>
//                 <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-x-auto">python component_labeling.py</pre>
//                 <Button variant="outline" size="sm" className="mt-2" onClick={checkServerStatus}>
//                   Check Connection
//                 </Button>
//               </AlertDescription>
//             </Alert>
//           )}

//           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//             <TabsList className="grid w-full grid-cols-2">
//               <TabsTrigger value="upload">Upload</TabsTrigger>
//               <TabsTrigger value="result">Result</TabsTrigger>
//             </TabsList>

//             <TabsContent value="upload" className="mt-6">
//               <Card className="overflow-hidden border-2 border-dashed border-muted-foreground/25">
//                 <CardContent className="p-0">
//                   <div
//                     {...getRootProps()}
//                     className={cn(
//                       "flex flex-col items-center justify-center p-8 transition-colors cursor-pointer rounded-md",
//                       isDragActive ? "bg-primary/5 border-primary/50" : "hover:bg-muted/50",
//                     )}
//                   >
//                     <input {...getInputProps()} />
//                     {preview ? (
//                       <div className="w-full space-y-4">
//                         <div className="relative mx-auto aspect-video max-w-md overflow-hidden rounded-lg border shadow-sm">
//                           <Image
//                             src={preview || "/placeholder.svg"}
//                             alt="Preview"
//                             fill
//                             className="object-contain"
//                             unoptimized
//                           />
//                         </div>
//                         <div className="flex flex-wrap justify-center gap-2">
//                           <Button onClick={() => setFile(null)} variant="outline" size="sm">
//                             Change Image
//                           </Button>
//                           <Button
//                             onClick={(e) => {
//                               e.stopPropagation()
//                               processImage()
//                             }}
//                             disabled={!file || isProcessing || serverStatus !== "online"}
//                             size="sm"
//                           >
//                             {isProcessing ? (
//                               <>
//                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
//                               </>
//                             ) : (
//                               <>
//                                 <Upload className="mr-2 h-4 w-4" /> Process Image
//                               </>
//                             )}
//                           </Button>
//                         </div>
//                         <div className="text-center text-sm text-muted-foreground">
//                           <p>File: {file?.name}</p>
//                           <p>Size: {file ? Math.round(file.size / 1024) : 0} KB</p>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="flex flex-col items-center justify-center space-y-4 py-12">
//                         <div className="rounded-full bg-primary/10 p-4">
//                           <Upload className="h-8 w-8 text-primary" />
//                         </div>
//                         <div className="space-y-2 text-center">
//                           <h3 className="text-lg font-semibold">Drag & drop your image here</h3>
//                           <p className="text-sm text-muted-foreground">
//                             or click to browse files (JPG, PNG, GIF up to 10MB)
//                           </p>
//                         </div>
//                         <Button variant="outline" size="sm">
//                           Select Image
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="result" className="mt-6">
//               <Card>
//                 <CardContent className="p-6">
//                   {error && (
//                     <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
//                       <p className="font-medium">Error processing image</p>
//                       <p>{error}</p>
//                     </div>
//                   )}

//                   {isProcessing && (
//                     <div className="space-y-4 py-8 text-center">
//                       <div className="relative h-24 w-24 mx-auto">
//                         <Loader2 className="h-24 w-24 animate-spin text-muted-foreground" />
//                         <div className="absolute inset-0 flex items-center justify-center">
//                           <span className="text-sm font-medium">{Math.round(progress)}%</span>
//                         </div>
//                       </div>
//                       <Progress value={progress} className="h-2 w-full" />
//                       <p className="text-sm font-medium">{processingStage}</p>
//                     </div>
//                   )}

//                   {result && !isProcessing && (
//                     <div className="space-y-6">
//                       <ImageGrid
//                         images={{
//                           original: preview,
//                           labeled: result,
//                           grouped: mask,
//                           boxes: overlay,
//                         }}
//                       />

//                       <ComponentStats totalComponents={totalComponents} groupsFound={groupsFound} />

//                       <Separator />
//                       <div className="flex flex-wrap justify-center gap-2">
//                         <Button onClick={resetForm} variant="outline" size="sm">
//                           <RefreshCw className="mr-2 h-4 w-4" /> Process New Image
//                         </Button>
//                         <Button onClick={downloadResult} size="sm">
//                           <Download className="mr-2 h-4 w-4" /> Download Result
//                         </Button>
//                       </div>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//     </main>
//   )
// }




"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, ImageIcon, Download, RefreshCw, Server } from "lucide-react"
import Image from "next/image"
import { useDropzone } from "react-dropzone"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { ImageGrid } from "@/components/image-grid"
import { ComponentStats } from "@/components/component-stats"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [mask, setMask] = useState<string | null>(null)
  const [overlay, setOverlay] = useState<string | null>(null)
  const [totalComponents, setTotalComponents] = useState<number | null>(null)
  const [groupsFound, setGroupsFound] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("upload")
  const [processingStage, setProcessingStage] = useState<string | null>(null)
  const [serverStatus, setServerStatus] = useState<"unknown" | "online" | "offline">("unknown")

  // Fetch Flask server status
  useEffect(() => {
    checkServerStatus()
  }, [])

  const checkServerStatus = async () => {
    const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:8000";
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(`${flaskApiUrl}/api/process-image`, {
        method: "HEAD",
        signal: controller.signal,
      }).catch(() => null)

      clearTimeout(timeoutId)
      setServerStatus(response && response.ok ? "online" : "offline")
    } catch (e) {
      setServerStatus("offline")
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setMask(null)
      setOverlay(null)
      setTotalComponents(null)
      setGroupsFound(null)
      setError(null)

      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
    },
    maxFiles: 1,
  })

  const processImage = async () => {
    if (!file) return

    setIsProcessing(true)
    setError(null)
    setProgress(0)
    setActiveTab("result")

    try {
      setProcessingStage("Preparing image")
      await simulateProgress(0, 20)

      const formData = new FormData()
      formData.append("image", file)

      setProcessingStage("Uploading to Python server")
      await simulateProgress(20, 40)

      setProcessingStage("Analyzing components")
      await simulateProgress(40, 70)

      const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:8000"
      const response = await fetch(`${flaskApiUrl}/api/process-image`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to process image")
      }

      const data = await response.json()

      setProcessingStage("Finalizing results")
      await simulateProgress(70, 100)

      setResult(data.resultImageUrl)
      setMask(data.maskImageUrl)
      setOverlay(data.overlayImageUrl)
      setTotalComponents(data.totalComponentsFound)
      setGroupsFound(data.groupsFound)
      setProcessingStage(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsProcessing(false)
      setProgress(100)
    }
  }

  const simulateProgress = async (from: number, to: number) => {
    const duration = 1000
    const steps = 20
    const increment = (to - from) / steps

    for (let i = 0; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, duration / steps))
      setProgress(Math.min(from + increment * i, to))
    }
  }

  const resetForm = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setMask(null)
    setOverlay(null)
    setTotalComponents(null)
    setGroupsFound(null)
    setError(null)
    setProgress(0)
    setActiveTab("upload")
    setProcessingStage(null)
  }

  const downloadResult = () => {
    if (!result) return

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = result
    link.download = "labeled-components.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Component Labeling</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={serverStatus === "online" ? "outline" : "destructive"} className="flex items-center gap-1">
              <Server className="h-3 w-3" />
              {serverStatus === "online" ? "Python Server Connected" : "Python Server Offline"}
            </Badge>
            <Badge variant="outline" className="hidden sm:inline-flex">
              Image Processing
            </Badge>
          </div>
        </div>
      </header>

      <div className="container py-10 px-4">
        <div className="mx-auto max-w-5xl">
          {serverStatus !== "online" && (
            <Alert variant="destructive" className="mb-6">
              <Server className="h-4 w-4" />
              <AlertTitle>Python Server Not Connected</AlertTitle>
              <AlertDescription>
                <p>The Python Flask server is not running or not accessible. Please start the server with:</p>
                <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-x-auto">python component_labeling.py</pre>
                <Button variant="outline" size="sm" className="mt-2" onClick={checkServerStatus}>
                  Check Connection
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="result">Result</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              <Card className="overflow-hidden border-2 border-dashed border-muted-foreground/25">
                <CardContent className="p-0">
                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex flex-col items-center justify-center p-8 transition-colors cursor-pointer rounded-md",
                      isDragActive ? "bg-primary/5 border-primary/50" : "hover:bg-muted/50",
                    )}
                  >
                    <input {...getInputProps()} />
                    {preview ? (
                      <div className="w-full space-y-4">
                        <div className="relative mx-auto aspect-video max-w-md overflow-hidden rounded-lg border shadow-sm">
                          <Image
                            src={preview || "/placeholder.svg"}
                            alt="Preview"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          <Button onClick={() => setPreview(null)} variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset
                          </Button>
                          <Button onClick={processImage} variant="default" size="sm" disabled={isProcessing}>
                            {isProcessing ? (
                              <>
                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                Processing
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Start Processing
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-sm">
                        <Upload className="h-6 w-6" />
                        <p>Drag & drop an image here or click to select one</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="result" className="mt-6">
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground">{processingStage}</p>
                </div>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {result && (
                <div>
                  <ImageGrid
                    resultImage={result}
                    maskImage={mask}
                    overlayImage={overlay}
                    totalComponents={totalComponents}
                    groupsFound={groupsFound}
                  />
                  <div className="mt-4 flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={downloadResult}
                      disabled={!result}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Result
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
