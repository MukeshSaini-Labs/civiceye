import React from 'react';
import { notFound } from 'next/navigation';
import { client } from '../../sanity/lib/client';
import { PortableText } from '@portabletext/react';
import { motion } from 'motion/react';

export const dynamic = 'force-dynamic';

export default async function GenericPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the params before accessing its properties (Next.js 15 requirement)
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const query = `*[_type == "genericPage" && slug.current == $slug][0]`;
  const pageData = await client.fetch(query, { slug });

  // If page is not in Sanity, return 404 (or we can fallback to hardcoded if we wanted)
  if (!pageData) {
    // Basic fallback for standard links if they aren't created in CMS yet
    const fallbacks: Record<string, any> = {
      'about': { title: "About CivicEye", subtitle: "We are redefining urban infrastructure management.", content: [] },
      'privacy': { title: "Privacy Policy", subtitle: "Your data is secure and localized.", content: [] },
      'terms-of-service': { title: "Terms of Service", subtitle: "Agreement for using the CivicEye platform.", content: [] },
      'api-documentation': { title: "API Documentation", subtitle: "Integrate with the Autonomous Command Nexus.", content: [] },
    };

    if (fallbacks[slug]) {
       return <GenericPageUI pageData={fallbacks[slug]} />
    }

    notFound();
  }

  return <GenericPageUI pageData={pageData} />;
}

// Separate UI component to keep it clean (could be a client component if we used motion heavily)
function GenericPageUI({ pageData }: { pageData: any }) {
  return (
    <div className="pt-32 pb-24 max-w-[50rem] mx-auto px-6 lg:px-8 min-h-screen">
       <div className="mb-16">
         <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tighter text-white mb-6 leading-tight">
           {pageData.title}
         </h1>
         {pageData.subtitle && (
           <p className="text-xl text-teal-400 font-medium leading-relaxed">
             {pageData.subtitle}
           </p>
         )}
         <div className="w-20 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 mt-8 rounded-full" />
      </div>

      <div className="prose prose-invert prose-teal max-w-none prose-headings:font-heading prose-headings:tracking-tight text-slate-300 [&_p]:text-slate-300 [&_li]:text-slate-300 [&_span]:text-slate-300 [&_strong]:text-white prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl">
         {pageData.content?.length > 0 ? (
            <PortableText value={pageData.content} />
         ) : (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-slate-400 italic text-center">
               Content for this page is currently being drafted. Please check back later.
            </div>
         )}
      </div>
    </div>
  );
}
