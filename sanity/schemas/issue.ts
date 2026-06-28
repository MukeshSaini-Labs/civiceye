import { defineField, defineType } from 'sanity'

export const issue = defineType({
  name: 'issue',
  title: 'Reported Issue',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Issue Title',
      type: 'string',
    }),
    defineField({
      name: 'reporterUid',
      title: 'Reporter Auth ID',
      type: 'string',
      description: 'Firebase UID of the user who reported this issue',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          'Infrastructure', 'Waste Management', 'Utilities', 'Public Safety', 'Other'
        ],
      },
    }),
    defineField({
      name: 'severity',
      title: 'Severity Level',
      type: 'number',
      validation: (rule) => rule.min(1).max(10),
    }),
    defineField({
      name: 'triageTier',
      title: 'Triage Tier',
      type: 'string',
      options: {
        list: ['Critical', 'Elevated', 'Standard'],
      },
      initialValue: 'Elevated',
    }),
    defineField({
      name: 'adminApproval',
      title: 'Admin Issue Approval',
      description: 'Accept or Reject this reported issue for public listing & bidding.',
      type: 'string',
      options: {
        list: ['Pending', 'Accepted', 'Rejected'],
      },
      initialValue: 'Pending',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['Reported', 'Verified', 'In progress', 'In review', 'Resolved', 'Rejected'],
      },
      initialValue: 'Reported',
    }),
    defineField({
      name: 'location',
      title: 'Location / Full Address',
      type: 'string',
    }),
    defineField({
      name: 'streetAddress',
      title: 'Street Address',
      type: 'string',
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
    }),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
    }),
    defineField({
      name: 'latitude',
      title: 'Latitude',
      type: 'number',
    }),
    defineField({
      name: 'longitude',
      title: 'Longitude',
      type: 'number',
    }),
    defineField({
      name: 'originalImage',
      title: 'Original Evidence Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'originalVideo',
      title: 'Original Evidence Video',
      type: 'file',
      options: { accept: 'video/*' },
      description: 'Video evidence uploaded by citizen reporter',
    }),
    defineField({
      name: 'speechTranscript',
      title: 'Speech Transcript (from video)',
      type: 'text',
      description: 'Auto-transcribed speech from video report using Web Speech API',
    }),
    defineField({
      name: 'resolutionImage',
      title: 'Resolution Evidence Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'resolvedAt',
      title: 'Resolution Date & Time',
      type: 'datetime',
    }),
    defineField({
      name: 'resolutionNote',
      title: 'Resolution Note / Action Taken',
      type: 'text',
    }),
    defineField({
      name: 'aiAnalysis',
      title: 'AI Analysis JSON',
      type: 'text',
      description: 'Stored JSON of the AI analysis',
    }),
    defineField({
      name: 'verificationCount',
      title: 'Verification Count',
      type: 'number',
      initialValue: 0,
      description: 'Number of citizens who verified this hazard',
    }),
    defineField({
      name: 'reporterId',
      title: 'Reporter Name',
      type: 'string',
    }),
    defineField({
      name: 'reporterEmail',
      title: 'Reporter Email',
      type: 'string',
      description: '⚠️ Private — never display on public pages',
    }),
    defineField({
      name: 'reporterPhone',
      title: 'Reporter Phone',
      type: 'string',
      description: '⚠️ Private — never display on public pages',
    }),
    defineField({
      name: 'reporterImage',
      title: 'Reporter Selfie / Image',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
})
