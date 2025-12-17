// Lightweight inline fallback so we never depend on external placeholder URLs.
// This renders a neutral "No image" card anywhere an image_url is missing.
export const NO_IMAGE_DATA_URI =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e5e7eb"/>
          <stop offset="1" stop-color="#f3f4f6"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <rect x="110" y="110" width="580" height="380" rx="18" fill="#ffffff" stroke="#d1d5db"/>
      <path d="M220 420l120-120 90 90 70-70 140 140H220z" fill="#e5e7eb"/>
      <circle cx="320" cy="270" r="36" fill="#e5e7eb"/>
      <text x="400" y="520" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system" font-size="26" fill="#6b7280">
        No image
      </text>
    </svg>`
  );


