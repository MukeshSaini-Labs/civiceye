import { defineField, defineType } from 'sanity'

export const howItWorksStep = defineType({
  name: 'howItWorksStep',
  title: 'How It Works Step',
  type: 'document',
  fields: [
    defineField({
      name: 'stepNumber',
      title: 'Step Number',
      type: 'number',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'iconName',
      title: 'Icon Name (Lucide)',
      type: 'string',
    }),
  ],
})
