import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts',
  }),
  // Use the function-form schema so we can access the image() helper.
  schema: ({ image }) =>
    z.object({
      title: z.string().max(120),
      summary: z.string().max(280),
      pubDate: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      hero: image().optional(),
    }),
});

export const collections = { posts };
