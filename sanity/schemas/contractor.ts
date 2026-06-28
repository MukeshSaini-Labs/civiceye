import { defineField, defineType } from 'sanity';

export const contractor = defineType({
  name: 'contractor',
  title: 'Contractor Accounts',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Company / Agency Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fullName',
      title: 'Contractor Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email ID',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'mobile',
      title: 'Mobile Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'gstNumber',
      title: 'GST Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'registrationNumber',
      title: 'Company Registration Number (Optional)',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Complete Address',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'verificationStatus',
      title: 'Verification Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending Review', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
        ],
      },
      initialValue: 'pending',
    }),
  ],
  preview: {
    select: {
      title: 'companyName',
      subtitle: 'fullName',
      status: 'verificationStatus',
    },
    prepare(selection) {
      const { title, subtitle, status } = selection;
      const statusIcon = status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳';
      return {
        title: title,
        subtitle: `${subtitle} | Status: ${statusIcon} ${status}`,
      };
    },
  },
});
