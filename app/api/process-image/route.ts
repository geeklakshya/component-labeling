// import { type NextRequest, NextResponse } from "next/server"

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData()
//     const image = formData.get("image")

//     if (!image || !(image instanceof Blob)) {
//       return NextResponse.json({ error: "Invalid image file" }, { status: 400 })
//     }

//     const flaskServerUrl = "https://image-component-labeling.onrender.com/"

//     const uploadForm = new FormData()
//     uploadForm.append("image", image)

//     const response = await fetch(`${flaskServerUrl}/api/process-image`, {
//       method: "POST",
//       body: uploadForm,
//     })

//     if (!response.ok) {
//       const errorText = await response.text()
//       console.error("Flask error:", errorText)
//       return NextResponse.json(
//         {
//           error: "Flask server error",
//           message: errorText,
//         },
//         { status: response.status },
//       )
//     }

//     const result = await response.json()

//     // Fix the image URLs by prepending the Flask server URL
//     const fixedResult = {
//       ...result,
//       originalImageUrl: `${flaskServerUrl}${result.originalImageUrl}`,
//       resultImageUrl: `${flaskServerUrl}${result.resultImageUrl}`,
//       maskImageUrl: `${flaskServerUrl}${result.maskImageUrl}`,
//       overlayImageUrl: `${flaskServerUrl}${result.overlayImageUrl}`,
//       totalComponentsFound: result.totalComponentsFound,
//       groupsFound: result.groupsFound,
//     }

//     return NextResponse.json(fixedResult)
//   } catch (err) {
//     console.error("Unexpected error:", err)
//     return NextResponse.json(
//       {
//         error: "Server error",
//         message: err instanceof Error ? err.message : String(err),
//       },
//       { status: 500 },
//     )
//   }
// }


import { type NextRequest, NextResponse } from "next/server"

// Use the environment variable for the Flask API URL
const flaskServerUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image")

    if (!image || !(image instanceof Blob)) {
      return NextResponse.json({ error: "Invalid image file" }, { status: 400 })
    }

    const uploadForm = new FormData()
    uploadForm.append("image", image)

    const response = await fetch(`${flaskServerUrl}/api/process-image`, {
      method: "POST",
      body: uploadForm,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Flask error:", errorText)
      return NextResponse.json(
        {
          error: "Flask server error",
          message: errorText,
        },
        { status: response.status },
      )
    }

    const result = await response.json()

    // Fix the image URLs by prepending the Flask server URL
    const fixedResult = {
      ...result,
      originalImageUrl: `${flaskServerUrl}${result.originalImageUrl}`,
      resultImageUrl: `${flaskServerUrl}${result.resultImageUrl}`,
      maskImageUrl: `${flaskServerUrl}${result.maskImageUrl}`,
      overlayImageUrl: `${flaskServerUrl}${result.overlayImageUrl}`,
      totalComponentsFound: result.totalComponentsFound,
      groupsFound: result.groupsFound,
    }

    return NextResponse.json(fixedResult)
  } catch (err) {
    console.error("Unexpected error:", err)
    return NextResponse.json(
      {
        error: "Server error",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
}
