import { defineField, defineType } from 'sanity';

export const joinRequest = defineType({
  name: 'joinRequest',
  title: 'Mission Join Request',
  type: 'document',
  fields: [
    defineField({
      name: 'referenceId',
      title: 'Reference ID',
      type: 'string',
    }),
    defineField({
      name: 'fullName',
      title: 'Full Name',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Mobile Number',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Full Address',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: 'Desired Role',
      type: 'string',
      options: {
        list: [
          'Frontend Engineer',
          'AI/ML Developer',
          'UI/UX Designer',
          'Field Operations',
          'Legal Advisor',
          'Social Media Manager',
          'NGO Partner',
          'Marketing Lead',
          'General Volunteer',
        ],
      },
    }),
    defineField({
      name: 'message',
      title: 'Message / Why join us?',
      type: 'text',
    }),
    defineField({
      name: 'status',
      title: 'Application Status',
      type: 'string',
      options: {
        list: ['Pending Review', 'Interviewing', 'Accepted', 'Rejected'],
      },
      initialValue: 'Pending Review',
    }),
    defineField({
      name: 'adminReply',
      title: 'Admin Reply / Update (Visible to User in Tracking)',
      type: 'text',
      description: 'Leave a reply or update here (e.g. interview scheduled). When the user tracks their Application ID via AI, they will see this message.',
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
  preview: {
    select: {
      title: 'fullName',
      subtitle: 'role',
    },
  },
});
