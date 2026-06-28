export const founderMessage = {
  name: 'founderMessage',
  title: 'Founder Message',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Founder Name',
      type: 'string',
      initialValue: 'Mukesh Saini',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      initialValue: 'Creator & Lead Architect',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Founder Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'message',
      title: 'Message / Vision',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      description: 'Leave blank if you do not want the icon to appear.',
      fields: [
        { name: 'linkedin', title: 'LinkedIn URL', type: 'url' },
        { name: 'twitter', title: 'X (Twitter) URL', type: 'url' },
        { name: 'youtube', title: 'YouTube URL', type: 'url' },
        { name: 'instagram', title: 'Instagram URL', type: 'url' },
        { name: 'facebook', title: 'Facebook URL', type: 'url' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image',
    },
  },
};
