import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

const apps = defineCollection({
  type: 'data',
  schema: z.object({
    label: z.string(),
    description: z.string().optional(),
    iconUrl: z.string(),
    href: z.string().optional(),
    iframeUrl: z.string().optional(),
    iframeUrlLocal: z.string().optional(),
    devOnly: z.boolean().optional(),
    wip: z.boolean().optional(),
    urlSync: z.boolean().optional(),
    menuMode: z.enum(['host', 'delegate']).optional(),
    ogDescription: z.string().optional(),
    ogImage: z.string().optional(),
    ogImageWidth: z.number().optional(),
    ogImageHeight: z.number().optional(),
  }),
});

export const collections = {
  articles,
  apps,
};
