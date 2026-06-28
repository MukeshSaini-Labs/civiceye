'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'mybu3spt';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

const startYear = 2026;
const currentYear = new Date().getFullYear();
// Generate years from 2026 up to the current real-world year
const YEARS = Array.from(
  { length: Math.max(1, currentYear - startYear + 1) }, 
  (_, i) => (startYear + i).toString()
);
const MONTHS = [
  { val: '01', name: 'January' },
  { val: '02', name: 'February' },
  { val: '03', name: 'March' },
  { val: '04', name: 'April' },
  { val: '05', name: 'May' },
  { val: '06', name: 'June' },
  { val: '07', name: 'July' },
  { val: '08', name: 'August' },
  { val: '09', name: 'September' },
  { val: '10', name: 'October' },
  { val: '11', name: 'November' },
  { val: '12', name: 'December' },
];

const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

function buildDateStructure(S: any, type: string, title: string, icon: string) {
  return S.listItem()
    .title(`${icon} ${title}`)
    .child(
      S.list()
        .title(`${title} by Year`)
        .items([
          S.listItem()
            .title('All (View All)')
            .child(S.documentTypeList(type).title(`All ${title}`)),
          S.divider(),
          ...YEARS.map(year =>
            S.listItem()
              .title(year)
              .child(
                S.list()
                  .title(`${year} - ${title}`)
                  .items(
                    MONTHS.map(month =>
                      S.listItem()
                        .title(month.name)
                        .child(
                          S.list()
                            .title(`${month.name} ${year}`)
                            .items(
                              Array.from({ length: getDaysInMonth(parseInt(year), parseInt(month.val)) }, (_, i) => i + 1).map(day => {
                                const dayStr = day.toString().padStart(2, '0');
                                const start = `${year}-${month.val}-${dayStr}T00:00:00.000Z`;
                                const end = new Date(new Date(start).getTime() + 86400000).toISOString();
                                
                                return S.listItem()
                                  .title(`Day ${dayStr}`)
                                  .child(
                                    S.documentList()
                                      .title(`${title} on ${month.name} ${dayStr}, ${year}`)
                                      .filter(`_type == $type && _createdAt >= $start && _createdAt < $end`)
                                      .params({ type, start, end })
                                  )
                              })
                            )
                        )
                    )
                  )
              )
          )
        ])
    );
}

export default defineConfig({
  basePath: '/studio',
  name: 'civiceye_studio',
  title: 'Civic Eye Studio',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Civic Eye CMS')
          .items([
            S.listItem()
              .title('🏠 Site Settings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.listItem()
              .title('🦸 Hero Section')
              .child(
                S.document()
                  .schemaType('heroSection')
                  .documentId('heroSection')
              ),
            S.listItem()
              .title('📊 Stats & Metrics')
              .child(
                S.document()
                  .schemaType('statsSection')
                  .documentId('statsSection')
              ),
            S.divider(),
            buildDateStructure(S, 'issue', 'Community Issues', '📋'),
            buildDateStructure(S, 'bounty', 'Civic Bounties', '💰'),
            buildDateStructure(S, 'bid', 'Contractor Bids', '🔨'),
            buildDateStructure(S, 'resolution', 'Contractor Resolutions', '✅'),
            S.listItem()
              .title('👷‍♂️ Contractor Accounts')
              .child(S.documentTypeList('contractor').title('Contractors')),
            S.listItem()
              .title('🚦 Triage Categories')
              .child(S.documentTypeList('triageCategory').title('Triage Categories')),
            S.listItem()
              .title('👥 User Accounts')
              .child(S.documentTypeList('userAccount').title('User Accounts')),
            S.listItem()
              .title('🏆 Impact Stories')
              .child(S.documentTypeList('impactStory').title('Impact Stories')),
            S.listItem()
              .title('ℹ️ How It Works Steps')
              .child(S.documentTypeList('howItWorksStep').title('Steps')),
            S.listItem()
              .title('📰 News & Updates')
              .child(S.documentTypeList('newsPost').title('News Posts')),
            S.listItem()
              .title('📚 Standard Pages')
              .child(S.documentTypeList('genericPage').title('Pages (About, Privacy, etc)')),
            S.divider(),
            S.listItem()
              .title('✉️ Newsletter Subscribers')
              .child(S.documentTypeList('subscriber').title('Subscribers')),
            S.listItem()
              .title('🎫 Support Tickets')
              .child(S.documentTypeList('supportTicket').title('Support Tickets')),
            S.listItem()
              .title('🚀 Mission Applications')
              .child(S.documentTypeList('joinRequest').title('Join Requests')),
            S.listItem()
              .title('🌟 Message from Founder')
              .child(
                S.document()
                  .schemaType('founderMessage')
                  .documentId('founderMessage')
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
