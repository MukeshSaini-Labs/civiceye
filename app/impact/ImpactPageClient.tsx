'use client';

import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { urlForImage } from '../../sanity/lib/image';

export default function ImpactPageClient({ stories }: { stories: any[] }) {
  // Use dummy data if no stories in sanity yet to prevent blank page
  const displayStories = stories?.length > 0 ? stories : [
    {
      title: "Sector 7 Water Main Break Resolved in 4 Hours",
      summary: "A critical pressure loss was identified via visual report. The AI triaged the severity as 10/10 and autonomously rerouted the nearest emergency plumbing contractor.",
      category: "infrastructure",
      resolutionTime: "4 Hours",
      _createdAt: "2026-10-24T12:00:00Z"
    },
    {
      title: "Eliminating the 'Pothole Epidemic' on Route 101",
      summary: "Through gamified citizen reporting, over 400 deep structural road hazards were mapped and verified in a single weekend. Paving crews dispatched with optimized routes.",
      category: "roadways",
      resolutionTime: "1 Weekend",
      _createdAt: "2026-10-18T12:00:00Z"
    },
    {
      title: "Smart Streetlight Re-Activation at Scale",
      summary: "A dark neighborhood was illuminated after an autonomous report batch was processed. The system verified the repair using satellite and street-level optical feeds.",
      category: "safety",
      resolutionTime: "24 Hours",
      _createdAt: "2026-10-12T12:00:00Z"
    }
  ];

  return (
    <div className="pt-32 pb-24 max-w-[90rem] mx-auto px-6 lg:px-8">
       <div className="text-center max-w-3xl mx-auto mb-20 relative">
         <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
           className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 mb-6 font-mono font-bold tracking-[0.2em] text-xs"
         >
           TRANSPARENCY LEDGER
         </motion.div>
         <motion.h1 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
           className="text-5xl md:text-6xl font-black font-heading tracking-tighter text-white mb-6 leading-tight"
         >
           Stories of <br />
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Civic Transformation</span>
         </motion.h1>
         <motion.p 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
           className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed"
         >
           Real-world examples of how CivicPulse's autonomous engine is eliminating hazards, saving millions in municipal budgets, and empowering citizens.
         </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {displayStories.map((story: any, i: number) => (
           <StoryCard key={i} story={story} />
         ))}
      </div>
    </div>
  )
}

function StoryCard({ story }: { story: any }) {
  const dateStr = new Date(story.date || story._createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  // Map category to a dummy image if image doesn't exist
  const getImg = () => {
    if (story.featuredImage) return urlForImage(story.featuredImage).width(800).height(600).url();
    if (story.image) return urlForImage(story.image).width(800).height(600).url();
    if (story.category === 'infrastructure') return "https://picsum.photos/seed/water/800/600";
    if (story.category === 'roadways') return "https://picsum.photos/seed/road/800/600";
    return "https://picsum.photos/seed/light/800/600";
  }

  return (
     <motion.div 
        whileHover={{ y: -10 }}
        className="bg-[#0a0f1c]/80 border border-white/[0.05] rounded-[2rem] overflow-hidden group cursor-pointer hover:border-teal-500/30 transition-all duration-500 shadow-2xl backdrop-blur-xl flex flex-col"
     >
        <div className="relative h-60 w-full overflow-hidden">
           <div className="absolute inset-0 bg-[#020408]/40 z-10 group-hover:bg-transparent transition-colors duration-500" />
           <Image src={getImg()} alt={story.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
           <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-[#020408]/80 backdrop-blur-md rounded-lg border border-white/[0.1] text-xs font-mono text-teal-400 font-bold tracking-widest uppercase shadow-xl">
             <MapPin className="w-3 h-3" /> {story.resolutionTime || 'Auto-Resolved'}
           </div>
        </div>
        <div className="p-8 flex-1 flex flex-col">
           <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-4 uppercase tracking-widest">
              <Calendar className="w-4 h-4" /> {dateStr}
              <span className="text-teal-500/50 px-2">•</span>
              {story.category || 'General'}
           </div>
           <h3 className="text-2xl font-bold font-heading text-white mb-4 leading-tight group-hover:text-teal-400 transition-colors">{story.title}</h3>
           <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">{story.summary}</p>
           <div className="flex items-center gap-2 text-sm font-bold text-teal-400 font-mono tracking-widest uppercase">
              Read Report <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </div>
        </div>
     </motion.div>
  )
}
