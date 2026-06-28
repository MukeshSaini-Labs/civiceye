import { defineField, defineType } from 'sanity';

export const bid = defineType({
  name: 'bid',
  title: 'Contractor Bids',
  type: 'document',
  fields: [
    defineField({
      name: 'bounty',
      title: 'Linked Bounty',
      type: 'reference',
      to: [{ type: 'bounty' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contractorName',
      title: 'Contractor Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contractorEmail',
      title: 'Contractor Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'bidAmount',
      title: 'Bid Amount (INR)',
      type: 'number',
      description: 'The custom budget proposed by the contractor.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'estimatedDays',
      title: 'Estimated Days to Complete',
      type: 'number',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'materialDetails',
      title: 'Material Details',
      type: 'text',
      description: 'What materials will be used and their estimated cost.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'wageDetails',
      title: 'Wage Details',
      type: 'text',
      description: 'Breakdown of labor wages.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Bid Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'Pending' },
          { title: 'Accepted', value: 'Accepted' },
          { title: 'Rejected', value: 'Rejected' },
        ],
      },
      initialValue: 'Pending',
    }),
  ],
  preview: {
    select: {
      title: 'contractorName',
      amount: 'bidAmount',
      status: 'status',
    },
    prepare(selection) {
      const { title, amount, status } = selection;
      return {
        title: `Bid: ${title}`,
        subtitle: `₹${amount} - ${status}`,
      };
    },
  },
});
