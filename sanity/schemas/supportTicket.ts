import { defineField, defineType } from 'sanity'

export const supportTicket = defineType({
  name: 'supportTicket',
  title: 'Support Tickets',
  type: 'document',
  fields: [
    defineField({
      name: 'ticketId',
      title: 'Ticket ID',
      type: 'string',
    }),
    defineField({
      name: 'name',
      title: 'User Name',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'User Email',
      type: 'string',
    }),
    defineField({
      name: 'issue',
      title: 'Issue Description',
      type: 'text',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['Open', 'In Progress', 'Resolved'],
      },
      initialValue: 'Open',
    }),
    defineField({
      name: 'adminReply',
      title: 'Admin Reply / Notes (Visible to User in Tracking)',
      type: 'text',
      description: 'Leave a reply here. When the user tracks their ticket ID via AI, they will see this message.',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'firebaseAuthId',
      title: 'Firebase Auth ID',
      type: 'string',
      description: 'Hidden field used for tracking verification.',
      hidden: true,
    }),
  ],
})
