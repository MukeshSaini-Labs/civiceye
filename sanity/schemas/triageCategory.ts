import { defineField, defineType } from 'sanity'

export const triageCategory = defineType({
  name: 'triageCategory',
  title: 'Triage Category',
  type: 'document',
  groups: [
    { name: 'config', title: 'Category Config', default: true },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Category Name',
      type: 'string',
      description: 'e.g. Critical, Elevated, Standard',
      validation: (rule) => rule.required(),
      group: 'config',
    }),
    defineField({
      name: 'slaText',
      title: 'SLA Text',
      type: 'string',
      description: 'e.g. 4h SLA, 24h SLA, 72h SLA',
      group: 'config',
    }),
    defineField({
      name: 'colorHex',
      title: 'Color (Hex)',
      type: 'string',
      description: 'Hex color code for map pins and badges. e.g. #ef4444',
      group: 'config',
    }),
    defineField({
      name: 'priority',
      title: 'Priority Order',
      type: 'number',
      description: '1 = highest priority displayed first',
      initialValue: 3,
      group: 'config',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of what qualifies as this category',
      group: 'config',
    }),
  ],
  orderings: [
    {
      title: 'Priority',
      name: 'priorityAsc',
      by: [{ field: 'priority', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'slaText', color: 'colorHex' },
    prepare({ title, subtitle, color }) {
      return {
        title: title || 'Unnamed Category',
        subtitle: subtitle || 'No SLA set',
        media: () => null,
      };
    },
  },
})
