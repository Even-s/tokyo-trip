import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // 確保掃描根目錄下的 components 與 app (如果沒有使用 src 目錄)
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 經典瑞士紅 (Swiss Red)
        'swiss-red': '#E30613', 
        // 接近純黑但不死黑，適合螢幕閱讀
        'swiss-black': '#111111',
        // 像美術館牆面的灰白
        'swiss-white': '#F4F4F4',
        // 用於 Hover 狀態的微暖白
        'swiss-offwhite': '#EAEAEA',
      },
      fontFamily: {
        // 確保使用 Next.js 預設的 Inter 字體
        sans: ['var(--font-geist-sans)', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        // 製作一個極淡的網格背景，輔助視覺對齊 (可選)
        'grid-pattern': "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;
