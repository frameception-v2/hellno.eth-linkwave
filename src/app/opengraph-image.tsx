import { ImageResponse } from "next/og";
import { PROJECT_TITLE, PROJECT_DESCRIPTION } from "~/lib/constants";
// Removed: import { readFileSync } from "fs";
// Removed: import { join } from "path";

export const alt = PROJECT_TITLE;
export const contentType = "image/png";
export const runtime = 'edge'; // Required for OG images

// Function to load font with error handling - Simplified for Edge runtime
async function loadFont(fontPath: string): Promise<ArrayBuffer> {
  try {
    // Use fetch with new URL, which works in Edge runtime for public assets
    const fontUrl = new URL(fontPath, import.meta.url);
    const response = await fetch(fontUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
    }
    const fontData = await response.arrayBuffer();
    return fontData;
  } catch (error) {
    console.error(`Failed to load font from ${fontPath}: ${error}`);
    throw new Error(`Failed to load font ${fontPath}: ${error}`);
  }
}


// Create reusable options object
let imageOptions: any = null;

// Initialize fonts
async function initializeFonts() {
  if (imageOptions) return imageOptions;

  try {
    const regularFont = await loadFont(
      "public/fonts/Nunito-Regular.ttf"
    );
    const semiBoldFont = await loadFont(
      "public/fonts/Nunito-SemiBold.ttf"
    );

    imageOptions = {
      width: 1200,
      height: 800, // Adjusted height for better text fit
      fonts: [
        {
          name: "Nunito",
          data: regularFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "Nunito",
          data: semiBoldFont,
          weight: 600,
          style: "normal",
        },
      ],
    };

    return imageOptions;
  } catch (error) {
    console.error("Error initializing fonts:", error);
    // Return default options or handle error appropriately
    return {
        width: 1200,
        height: 800,
    }
  }
}

export default async function Image() {
  const options = await initializeFonts();

  const BACKGROUND_GRADIENT_START = "#4c1d95"; // Darker Purple
  const BACKGROUND_GRADIENT_END = "#be185d"; // Darker Pink
  const BACKGROUND_GRADIENT_STYLE = {
    backgroundImage: `linear-gradient(to bottom, ${BACKGROUND_GRADIENT_START}, ${BACKGROUND_GRADIENT_END})`,
    color: "white", // White text for contrast
  };

  /*
this Image is rendered using vercel/satori.

Satori supports a limited subset of HTML and CSS features, due to its special use cases. In general, only these static and visible elements and properties that are implemented.
For example, the <input> HTML element, the cursor CSS property are not in consideration. And you can't use <style> tags or external resources via <link> or <script>.
Also, Satori does not guarantee that the SVG will 100% match the browser-rendered HTML output since Satori implements its own layout engine based on the SVG 1.1 spec.
Please refer to Satori’s documentation for a list of supported HTML and CSS features. https://github.com/vercel/satori#css
*/
  return new ImageResponse(
    (
      <div
        tw="h-full w-full flex flex-col justify-center items-center relative p-10" // Added padding
        style={BACKGROUND_GRADIENT_STYLE}
      >
        {/* Ensure fonts are loaded before rendering text */}
        {options.fonts ? (
          <>
            <h1 tw="text-8xl text-center font-semibold mb-4" style={{ fontFamily: 'Nunito' }}>{PROJECT_TITLE}</h1>
            <h3 tw="text-4xl font-normal text-center" style={{ fontFamily: 'Nunito' }}>{PROJECT_DESCRIPTION}</h3>
          </>
        ) : (
          <div tw="text-4xl">Loading Font...</div> // Fallback text
        )}
      </div>
    ),
    options
  );
}
