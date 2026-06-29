'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Camera, BrainCircuit, Wrench, CheckCircle } from 'lucide-react';

export default function HowItWorksClient({ steps }: { steps: any[] }) {
  // Fallback to hardcoded if CMS is empty
  let displaySteps = steps?.length > 0 ? steps : [
    { stepNumber: 1, title: "Optical Ingestion", description: "A citizen identifies a hazard and captures a visual frame using the CivicPulse terminal.", iconName: "Camera" },
    { stepNumber: 2, title: "AI Triage Engine", description: "Google Gemini Vision model instantly extracts metadata: hazard category, exact severity index, etc.", iconName: "BrainCircuit" },
    { stepNumber: 3, title: "Contractor Dispatch", description: "The system autonomously generates a work order and dispatches the most optimized local contractor.", iconName: "Wrench" },
    { stepNumber: 4, title: "Forensic Verification", description: "Post-repair, the contractor uploads completion evidence for AI verification.", iconName: "CheckCircle" },
  ];

  // Deduplicate steps by stepNumber to prevent double-rendering on mobile/desktop
  displaySteps = displaySteps.filter((step: any, index: number, self: any[]) =>
    index === self.findIndex((t) => t.stepNumber === step.stepNumber)
  );

  const getIcon = (name: string) => {
    switch (name) {
      case 'Camera': return <Camera />;
      case 'BrainCircuit': return <BrainCircuit />;
      case 'Wrench': return <Wrench />;
      case 'CheckCircle': return <CheckCircle />;
      default: return <BrainCircuit />;
    }
  }

  return (
    <div className="pt-32 pb-24 max-w-[90rem] mx-auto px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20 relative">
         <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
           className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-teal-500/10 border border-teal-500/30 text-teal-400 mb-6 shadow-[0_0_30px_rgba(20,184,166,0.2)]"
         >
           <BrainCircuit className="w-8 h-8" />
         </motion.div>
         <motion.h1 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
           className="text-5xl md:text-6xl font-black font-heading tracking-tighter text-white mb-6 leading-tight"
         >
           The Autonomous <br />
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Resolution Pipeline</span>
         </motion.h1>
         <motion.p 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
           className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed"
         >
           From citizen report to contractor dispatch in under 2 seconds. Understand how our Gemini-powered engine automates the entire lifecycle of urban maintenance.
         </motion.p>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
         <div className="absolute left-[2.25rem] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-teal-500/0 via-teal-500/50 to-teal-500/0" />

         {displaySteps.map((step: any, index: number) => (
           <StepCard 
             key={index}
             num={String(step.stepNumber).padStart(2, '0')} 
             title={step.title} 
             desc={step.description} 
             icon={getIcon(step.iconName)} 
             align={index % 2 === 0 ? 'left' : 'right'} 
             delay={0.1 + (index * 0.1)}
           />
         ))}
      </div>
    </div>
  );
}

function StepCard({ num, title, desc, icon, align, delay }: { num: string, title: string, desc: string, icon: React.ReactNode, align: 'left' | 'right', delay: number }) {
  const isLeft = align === 'left';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, delay }}
      className={`flex flex-col md:flex-row items-start md:items-center gap-8 mb-16 relative w-full ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
    >
       <div className={`md:w-1/2 flex ${isLeft ? 'md:justify-end' : 'md:justify-start'} pl-20 md:pl-0 relative`}>
          <div className={`absolute top-0 md:top-1/2 left-[1.1rem] md:left-auto md:right-[-2.25rem] -translate-x-1/2 md:translate-x-0 md:-translate-y-1/2 w-10 h-10 rounded-full bg-[#020408] border-4 border-[#020408] flex items-center justify-center z-10 shadow-[0_0_0_2px_rgba(20,184,166,0.5)] ${isLeft ? 'md:right-[-2.25rem]' : 'md:left-[-2.25rem]'}`}>
             <div className="w-3 h-3 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(20,184,166,1)]" />
          </div>

          <div className={`bg-[#0a0f1c]/80 border border-white/[0.05] p-8 rounded-[2rem] max-w-md w-full backdrop-blur-xl hover:border-teal-500/30 transition-all duration-500 group hover:shadow-[0_0_40px_rgba(20,184,166,0.1)]`}>
            <div className="flex items-center gap-4 mb-5">
              <div className="text-4xl font-black font-heading text-white/10 group-hover:text-teal-500/20 transition-colors">{num}</div>
              <div className="p-3 bg-[#020408] rounded-xl border border-white/[0.08] text-teal-400 shadow-inner group-hover:scale-110 transition-transform">
                {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' } as any)}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
          </div>
       </div>
    </motion.div>
  );
}
