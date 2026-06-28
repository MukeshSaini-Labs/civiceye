import { NextResponse } from 'next/server';
import { adminClient } from '../../../sanity/lib/client';

export async function GET() {
  try {
    console.log("Seeding data to Sanity...");

    // 1. Seed How It Works Steps
    const steps = [
      {
        _type: 'howItWorksStep',
        stepNumber: 1,
        title: "Optical Ingestion",
        description: "A citizen identifies a hazard (e.g. massive pothole, broken mainline) and captures a visual frame using the CivicPulse terminal. Geo-coordinates and timestamp are securely embedded.",
        iconName: "Camera"
      },
      {
        _type: 'howItWorksStep',
        stepNumber: 2,
        title: "AI Triage Engine",
        description: "Google Gemini Vision model instantly extracts metadata: hazard category, exact severity index (1-10), necessary repair materials, and the correct municipal department to notify. Zero human review required.",
        iconName: "BrainCircuit"
      },
      {
        _type: 'howItWorksStep',
        stepNumber: 3,
        title: "Contractor Dispatch",
        description: "The system autonomously generates a work order and dispatches the most optimized local contractor based on live availability and historical repair speed records.",
        iconName: "Wrench"
      },
      {
        _type: 'howItWorksStep',
        stepNumber: 4,
        title: "Forensic Verification",
        description: "Post-repair, the contractor uploads completion evidence. The AI performs a deep-pixel cross-reference against the original hazard image to mathematically prove resolution before releasing funds.",
        iconName: "CheckCircle"
      }
    ];

    for (const step of steps) {
      await adminClient.create(step);
      console.log(`Created step: ${step.title}`);
    }

    // 2. Seed Impact Stories
    const stories = [
      {
        _type: 'impactStory',
        title: "Sector 7 Water Main Break Resolved in 4 Hours",
        slug: { current: 'sector-7-water-main' },
        summary: "A critical pressure loss was identified via visual report. The AI triaged the severity as 10/10 and autonomously rerouted the nearest emergency plumbing contractor.",
        category: "infrastructure",
        resolutionTime: "4 Hours",
        date: "2026-10-24T12:00:00Z"
      },
      {
        _type: 'impactStory',
        title: "Eliminating the 'Pothole Epidemic' on Route 101",
        slug: { current: 'pothole-epidemic-route-101' },
        summary: "Through gamified citizen reporting, over 400 deep structural road hazards were mapped and verified in a single weekend. Paving crews dispatched with optimized routes.",
        category: "roadways",
        resolutionTime: "1 Weekend",
        date: "2026-10-18T12:00:00Z"
      },
      {
        _type: 'impactStory',
        title: "Smart Streetlight Re-Activation at Scale",
        slug: { current: 'smart-streetlight-reactivation' },
        summary: "A dark neighborhood was illuminated after an autonomous report batch was processed. The system verified the repair using satellite and street-level optical feeds.",
        category: "safety",
        resolutionTime: "24 Hours",
        date: "2026-10-12T12:00:00Z"
      }
    ];

    for (const story of stories) {
      await adminClient.create(story);
      console.log(`Created story: ${story.title}`);
    }

    // 3. Seed Generic Pages
    const pages = [
      {
        _type: 'genericPage',
        title: "About CivicPulse",
        slug: { current: 'about' },
        subtitle: "We are redefining urban infrastructure management through autonomous AI.",
        content: [
          {
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', text: "CivicPulse was founded with a single mission: to eliminate the bureaucratic friction between a community's problems and their solutions. By leveraging Google Gemini's advanced multimodal AI, we instantly analyze visual reports of civic decay—from broken water mains to structural damage—and autonomously dispatch the optimal repair contractors. Welcome to the future of the autonomous city." }]
          }
        ]
      },
      {
        _type: 'genericPage',
        title: "Privacy Policy",
        slug: { current: 'privacy' },
        subtitle: "Your data is secure, anonymized, and hyper-localized.",
        content: [
          {
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', text: "When you upload an image to CivicPulse, it is instantly processed by our autonomous engine. We do not store personal identifying information. Geo-coordinates are stripped of device-specific metadata and used strictly for dispatching repair crews. All civic reports are converted into mathematical vectors and stored in our secure, decentralized ledger." }]
          }
        ]
      },
      {
        _type: 'genericPage',
        title: "Terms of Service",
        slug: { current: 'terms-of-service' },
        subtitle: "The rules of engagement for the Autonomous Command Nexus.",
        content: [
          {
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', text: "By using CivicPulse, you agree to submit only accurate, real-world visual reports of civic infrastructure. Deliberate falsification of reports will result in an AI-enforced ban from the gamified leaderboard system. Contractors dispatched via the Nexus must adhere to the 4-hour SLA framework." }]
          }
        ]
      },
      {
        _type: 'genericPage',
        title: "API Documentation",
        slug: { current: 'api-documentation' },
        subtitle: "Integrate your municipal systems with the CivicPulse Engine.",
        content: [
          {
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', text: "The CivicPulse API is currently in closed beta for Level-4 Municipalities. The RESTful endpoints allow direct ingestion of satellite telemetry, drone feeds, and existing 311 databases. Reach out to the Nexus Engineering team for access keys." }]
          }
        ]
      }
    ];

    for (const page of pages) {
      await adminClient.create(page);
      console.log(`Created page: ${page.title}`);
    }

    // 4. Seed Issues for the Community Verification Feed
    const issues = [
      {
        _type: 'issue',
        title: 'Deep Structural Pothole - Main St',
        description: 'Large crater causing vehicular damage.',
        severity: 'high',
        status: 'investigating',
        location: 'Downtown Core, Sector 4',
        verificationCount: 1,
        createdAt: new Date().toISOString()
      },
      {
        _type: 'issue',
        title: 'Fallen Power Line',
        description: 'Live wire down near the elementary school.',
        severity: 'high',
        status: 'investigating',
        location: 'Westside Residential',
        verificationCount: 2,
        createdAt: new Date().toISOString()
      },
      {
        _type: 'issue',
        title: 'Flooded Underpass',
        description: 'Drainage system clogged, severe water pooling.',
        severity: 'medium',
        status: 'reported',
        location: 'Highway 101 Junction',
        verificationCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        _type: 'issue',
        title: 'Broken Traffic Light',
        description: 'Intersection signals are completely off.',
        severity: 'high',
        status: 'reported',
        location: '4th & Market',
        verificationCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        _type: 'issue',
        title: 'Graffiti on City Hall',
        description: 'Vandalism on the east wall.',
        severity: 'low',
        status: 'reported',
        location: 'Civic Center',
        verificationCount: 1,
        createdAt: new Date().toISOString()
      }
    ];

    for (const issue of issues) {
      await adminClient.create(issue);
      console.log(`Created issue: ${issue.title}`);
    }

    return NextResponse.json({ success: true, message: "Sanity successfully seeded with World Class data AND issues!" });

  } catch (error: any) {
    console.error("Error seeding sanity:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
