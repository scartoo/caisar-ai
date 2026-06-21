// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://caisar.ai',

  integrations: [
    mdx(),
    sitemap({
      // Exclude the 404 page. The filter receives the FULL URL. Astro emits
      // 404 as a special file (dist/404.html), so its sitemap URL may be /404
      // WITH OR WITHOUT a trailing slash depending on build format — use a
      // substring check rather than a fragile exact-equality match.
      filter: (page) => !page.includes('/404'),
    }),
  ],

  markdown: {
    // Shiki dual themes with class-based switching. defaultColor:false makes
    // Shiki emit ONLY CSS variables (no baked-in inline colors), so the `.dark`
    // class on <html> fully controls which theme renders. The matching CSS
    // lives in src/styles/global.css (section 7). Without this block Astro
    // defaults to a SINGLE theme (github-dark) and code blocks won't switch —
    // which would fail acceptance criterion 4.
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});