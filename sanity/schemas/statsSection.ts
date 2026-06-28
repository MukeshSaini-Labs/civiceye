import { defineField, defineType } from 'sanity'

export const statsSection = defineType({
  name: 'statsSection',
  title: 'Stats Section',
  type: 'document',
  fields: [
    defineField({
      name: 'stats',
      title: 'Global Statistics',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'value', title: 'Value', type: 'string' },
            { name: 'trend', title: 'Trend', type: 'string' },
            { name: 'trendUp', title: 'Trend Up?', type: 'boolean', initialValue: true },
            { name: 'iconName', title: 'Icon Name (Lucide)', type: 'string', description: 'e.g., CheckCircle, Users, Clock, Leaf' }
          ],
        },
      ],
    }),
  ],
})
