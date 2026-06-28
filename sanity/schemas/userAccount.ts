import { defineField, defineType } from 'sanity'

export const userAccount = defineType({
  name: 'userAccount',
  title: 'User Accounts',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Citizen Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'uid',
      title: 'Firebase UID',
      type: 'string',
      description: 'Internal reference to Firebase Auth',
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Complete Address',
      type: 'text',
      description: 'Physical address provided by the citizen',
    }),
    defineField({
      name: 'score',
      title: 'Total XP Score',
      type: 'number',
      validation: (rule) => rule.required().min(0),
      initialValue: 0,
    }),
    defineField({
      name: 'reportsCount',
      title: 'Reports Submitted',
      type: 'number',
      initialValue: 0,
      description: 'Each report = +10 XP',
    }),
    defineField({
      name: 'verifyCount',
      title: 'Verifications Done',
      type: 'number',
      initialValue: 0,
      description: 'Each verification = +5 XP',
    }),
    defineField({
      name: 'resolvedCount',
      title: 'Issues Helped Resolve',
      type: 'number',
      initialValue: 0,
      description: 'Each resolved issue = +20 XP',
    }),
    defineField({
      name: 'badge',
      title: 'Badge / Title',
      type: 'string',
      description: 'e.g. City Guardian, Urban Hero, Civic Sentinel',
      options: {
        list: [
          'City Guardian', 'Urban Hero', 'Civic Sentinel', 'Street Warden',
          'Hazard Hunter', 'Community Champion', 'Infrastructure Defender',
          'Neighborhood Protector', 'Public Safety Officer', 'Rookie Reporter'
        ]
      }
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
    }),
    defineField({
      name: 'joinedAt',
      title: 'Joined At',
      type: 'datetime',
    }),
    defineField({
      name: 'isUser',
      title: 'Highlight as Current User?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'avatar',
      title: 'Citizen Avatar',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  orderings: [
    {
      title: 'Score (High to Low)',
      name: 'scoreDesc',
      by: [{ field: 'score', direction: 'desc' }],
    },
  ],
})
