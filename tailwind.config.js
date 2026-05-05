/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        "radar": {
          "primary": "#1B3A6B",
          "primary-content": "#FFFFFF",
          "secondary": "#0A0A0A",
          "secondary-content": "#FFFFFF",
          "accent": "#1B3A6B",
          "accent-content": "#FFFFFF",
          "neutral": "#0A0A0A",
          "neutral-content": "#FFFFFF",
          "base-100": "#FFFFFF",
          "base-200": "#FAFAF8",
          "base-300": "#F4F4F2",
          "base-content": "#0A0A0A",
          "info": "#1B3A6B",
          "info-content": "#FFFFFF",
          "success": "#1F5F4A",
          "success-content": "#FFFFFF",
          "warning": "#A66E12",
          "warning-content": "#0A0A0A",
          "error": "#7A2419",
          "error-content": "#FFFFFF",
          "--rounded-box": "4px",
          "--rounded-btn": "2px",
          "--rounded-badge": "2px",
          "--animation-btn": "0.08s",
          "--animation-input": "0.08s",
          "--btn-focus-scale": "1",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "2px"
        }
      }
    ],
    base: true,
    styled: true,
    utils: true
  }
}
