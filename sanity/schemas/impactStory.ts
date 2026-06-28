import { defineField, defineType } from 'sanity'

export const impactStory = defineType({
  name: 'impactStory',
  title: 'Impact Story',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Story Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'date',
      title: 'Published Date',
      type: 'datetime',
    }),
    defineField({
      name: 'category',
      title: 'Category (e.g. infrastructure, roadways, safety)',
      type: 'string',
    }),
    defineField({
      name: 'resolutionTime',
      title: 'Resolution Time (e.g. 4 Hours)',
      type: 'string',
    }),
  ],
})
