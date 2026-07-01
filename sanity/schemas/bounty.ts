import { defineField, defineType } from 'sanity';

export const bounty = defineType({
  name: 'bounty',
  title: 'Civic Bounty',
  type: 'document',
  fields: [
    defineField({
      name: 'issue',
      title: 'Linked Hazard/Issue',
      type: 'reference',
      to: [{ type: 'issue' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bountyAmount',
      title: 'Bounty Reward (INR)',
      type: 'number',
      description: 'AI-determined reward for fixing this issue.',
      validation: (Rule) => Rule.required().min(1),
    }),

    defineField({
      name: 'status',
      title: 'Bounty Status',
      type: 'string',
      options: {
        list: [
          { title: 'Open', value: 'Open' },
          { title: 'Claimed', value: 'Claimed' },
          { title: 'Verified', value: 'Verified' },
          { title: 'Paid', value: 'Paid' },
        ],
      },
      initialValue: 'Open',
    }),
    defineField({
      name: 'contractorId',
      title: 'Claimed By (Contractor ID)',
      type: 'string',
    }),
    defineField({
      name: 'completionImage',
      title: 'Completion Proof Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'aiVerificationScore',
      title: 'AI Verification Score (1-100)',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'issue.title',
      subtitle: 'status',
      amount: 'bountyAmount'
    },
    prepare(selection) {
      const { title, subtitle, amount } = selection;
      return {
        title: title ? `Bounty: ${title}` : 'Untitled Bounty',
        subtitle: `${subtitle} - ₹${amount}`,
      };
    },
  },
});
