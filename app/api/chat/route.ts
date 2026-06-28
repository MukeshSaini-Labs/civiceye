export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { adminClient } from '@/sanity/lib/client';

export async function POST(req: Request) {
  try {
    const { messages, firebaseAuthId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    // Anti-Hacking & Sanitization Regex
    const maliciousRegex = /(<script.*?>.*?<\/script>|javascript:|onclick=|onload=|onerror=|eval\(|exec\(|<iframe.*?<\/iframe>|https?:\/\/[^\s]+|www\.[^\s]+|\[.*?\]\(.*?\))/gi;
    const injectionRegex = /(ignore previous instructions|act as a hacker|forget your prompt|bypass security)/gi;

    const contents = messages.map((msg: any) => {
      let safeText = msg.content || "";
      if (maliciousRegex.test(safeText) || injectionRegex.test(safeText)) {
        safeText = "[BLOCKED_MALICIOUS_CONTENT]";
      }
      const parts: any[] = [{ text: safeText }];
      if (msg.attachment && msg.attachment.base64) {
        const base64Data = msg.attachment.base64.split(',')[1];
        parts.push({
          inlineData: {
            mimeType: msg.attachment.mimeType,
            data: base64Data
          }
        });
      }
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const fetchGemini = () => fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `[SYSTEM_TIME_OVERRIDE: Current Date is ${new Date().toISOString().split('T')[0]}]\n\n` + SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
      })
    });

    let geminiRes = await fetchGemini();
    
    // Simple retry logic for 503 Service Unavailable and 429 Too Many Requests
    if (!geminiRes.ok && (geminiRes.status === 503 || geminiRes.status === 429)) {
      console.warn(`Gemini API ${geminiRes.status}. Retrying in 2s...`);
      await new Promise(res => setTimeout(res, 2000));
      geminiRes = await fetchGemini();
    }

    if (!geminiRes.ok) {
      if (geminiRes.status === 429) {
        return NextResponse.json({ error: "Nexus Core is currently handling too many concurrent requests. Please wait a few seconds and try again." }, { status: 429 });
      }
      throw new Error(`Gemini API error: ${geminiRes.statusText} (${geminiRes.status})`);
    }

    const response = await geminiRes.json();
    let aiMessage = response.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    // Intercept Ticket Intent
    const ticketRegex = /\[TICKET_INTENT:\s*name="([^"]+)",\s*email="([^"]+)",\s*issue="([^"]+)"\]/;
    const match = aiMessage.match(ticketRegex);

    if (match) {
      const [_, name, email, issue] = match;
      
      const protocol = req.headers.get('x-forwarded-proto') || 'http';
      const host = req.headers.get('host');
      const ticketUrl = `${protocol}://${host}/api/ticket`;

      const ticketRes = await fetch(ticketUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, issue, firebaseAuthId }),
      });

      if (ticketRes.ok) {
        const ticketData = await ticketRes.json();
        aiMessage = aiMessage.replace(
          ticketRegex, 
          `\n\n✅ **Ticket Successfully Generated!**\nYour Reference ID is: **${ticketData.ticketId}**.\n\nI have emailed a confirmation to ${email} and alerted the Civic Eye Engineering Core.`
        );
      } else {
         aiMessage = aiMessage.replace(ticketRegex, "\n\n❌ I attempted to create a ticket, but our internal systems are currently experiencing downtime. Please try again later.");
      }
    }

    // Intercept Join Intent
    const joinRegex = /\[JOIN_INTENT:\s*name="([^"]+)",\s*email="([^"]+)",\s*phone="([^"]+)",\s*address="([^"]+)",\s*role="([^"]+)",\s*message="([^"]+)"\]/;
    const joinMatch = aiMessage.match(joinRegex);

    if (joinMatch) {
      const [_, fullName, email, phone, address, role, message] = joinMatch;
      
      const protocol = req.headers.get('x-forwarded-proto') || 'http';
      const host = req.headers.get('host');
      const joinUrl = `${protocol}://${host}/api/join`;

      const joinRes = await fetch(joinUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, address, role, message, firebaseAuthId }),
      });

      if (joinRes.ok) {
        const joinData = await joinRes.json();
        aiMessage = aiMessage.replace(
          joinRegex, 
          `\n\n✅ **Application Successfully Lodged!**\nYour Mission Reference ID is: **${joinData.referenceId}**.\n\nI have securely transmitted your profile to the Founder's desk and dispatched a confirmation to ${email}. Welcome to the Civic Eye pipeline, Operative.`
        );
      } else {
         aiMessage = aiMessage.replace(joinRegex, "\n\n❌ I attempted to process your application, but the Nexus connection failed. Please try again later.");
      }
    }

    // Intercept Hazard Report Intent
    const hazardRegex = /\[HAZARD_REPORT_INTENT\]/;
    if (aiMessage.match(hazardRegex)) {
      aiMessage = aiMessage.replace(
        hazardRegex,
        `\n\n⚡ **Hazard Reporting Protocol Initiated.**\n\nI have activated the Gemini Vision triage engine. Loading the embedded Live Reporting Wizard... [TRIGGER_HAZARD_REPORT]`
      );
    }

    // Intercept Map Intent
    const mapRegex = /\[MAP_INTENT\]/;
    if (aiMessage.match(mapRegex)) {
      aiMessage = aiMessage.replace(
        mapRegex,
        `\n\n🗺️ **Holo-Map Protocols Initialized.**\n\nThe Civic Eye Holo-Map provides real-time telemetry on all active municipal hazards globally. Loading live geospatial data... [TRIGGER_HOLO_MAP]`
      );
    }

    // Intercept City Analytics Intent
    const cityRegex = /\[CITY_ANALYTICS_INTENT:\s*city="([^"]+)",\s*state="([^"]+)",\s*hindiCity="([^"]+)"\]/i;
    const cityMatch = aiMessage.match(cityRegex);
    if (cityMatch) {
      const [_, city, state, hindiCity] = cityMatch;
      try {
        const issues = await adminClient.fetch(
          `*[_type == "issue" && (lower(city) match lower($city) || lower(city) match lower($hindiCity)) && state match $state] { _id, title, status, severity, category }`,
          { city: city + '*', hindiCity: hindiCity + '*', state }
        );
        
        let reportStr = `\n\n📊 **Live City Analytics for ${city}, ${state}:**\n\n`;
        if (issues.length === 0) {
          reportStr += `Currently, **no hazards or issues** have been reported in our database for this region. The Nexus grid shows all clear.`;
        } else {
          reportStr += `I have queried the central database. There are **${issues.length}** tracked issues in this region.\n\n`;
          issues.forEach((issue: any) => {
             const statusColor = issue.status === 'Resolved' ? '✅' : issue.status === 'Verified' ? '⚡' : '🔴';
             reportStr += `- ${statusColor} **${issue.title}** (Severity: ${issue.severity}/10) - [${issue.status}]\n`;
          });
        }
        aiMessage = aiMessage.replace(cityRegex, reportStr);
      } catch (err) {
        aiMessage = aiMessage.replace(cityRegex, `\n\n❌ [ERR_DB_TIMEOUT] Failed to retrieve live analytics for ${city}, ${state} from the Sanity cluster.`);
      }
    }

    // Intercept Track Intent
    const trackRegex = /\[TRACK_INTENT:\s*id="([^"]+)"\]/;
    const trackMatch = aiMessage.match(trackRegex);

    if (trackMatch) {
      const [_, referenceId] = trackMatch;
      
      const protocol = req.headers.get('x-forwarded-proto') || 'http';
      const host = req.headers.get('host');
      const trackUrl = `${protocol}://${host}/api/track`;

      const trackRes = await fetch(trackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceId, firebaseAuthId }),
      });

      if (trackRes.ok) {
        const json = await trackRes.json();
        const data = json.data;
        
        let detailString = '';
        if (!referenceId.startsWith('JOIN-')) {
          detailString = `**Issue Description:**\n> *${data.issue}*`;
        } else if (referenceId.startsWith('JOIN-')) {
          detailString = `**Role Applied:** ${data.role}`;
        }

        const adminNotes = data.adminReply ? `\n\n**Admin / Engineering Reply:**\n> *${data.adminReply}*` : '';
        
        aiMessage = aiMessage.replace(
          trackRegex, 
          `\n\n✅ **Live Tracking Data Retrieved:**\n\n**Reference ID:** ${referenceId}\n**Current Status:** \`${data.status}\`\n**Created At:** ${new Date(data.createdAt).toLocaleDateString()}\n\n${detailString}${adminNotes}`
        );
      } else if (trackRes.status === 403) {
         aiMessage = aiMessage.replace(trackRegex, `\n\n❌ **Access Denied.** Security protocol triggered. The Firebase Auth ID of the current session does not match the creator of Reference ID: \`${referenceId}\`. This data is strictly classified.`);
      } else {
         aiMessage = aiMessage.replace(trackRegex, `\n\n❌ **Record Not Found.** I could not find any active data for Reference ID: \`${referenceId}\`. Please ensure it is typed correctly (e.g., 10-character ID or JOIN-XXX).`);
      }
    }

    // Intercept Digest Intent
    const digestRegex = /\[DIGEST_INTENT\]/;
    const digestMatch = aiMessage.match(digestRegex);

    if (digestMatch) {
      const protocol = req.headers.get('x-forwarded-proto') || 'http';
      const host = req.headers.get('host');
      const digestUrl = `${protocol}://${host}/api/digest`;

      const digestRes = await fetch(digestUrl, { method: 'POST' });

      if (digestRes.ok) {
        aiMessage = aiMessage.replace(
          digestRegex, 
          `\n\n✅ **Weekly Digest Dispatched!**\nI have successfully generated the weekly impact analytics report and emailed it to the Engineering Core team via the Resend API.`
        );
      } else {
        aiMessage = aiMessage.replace(digestRegex, `\n\n❌ **Digest Generation Failed.** Could not dispatch the weekly report at this time.`);
      }
    }

    // Intercept Forecast Intent
    const forecastRegex = /\[FORECAST_INTENT\]/;
    const forecastMatch = aiMessage.match(forecastRegex);

    if (forecastMatch) {
      try {
        const { adminClient } = await import('@/sanity/lib/client');
        const query = `*[_type == "issue" && status != "Resolved"] | order(_createdAt desc)`;
        const activeIssues = await adminClient.fetch(query);
        
        if (!activeIssues || activeIssues.length === 0) {
          aiMessage = aiMessage.replace(
            forecastRegex,
            `\n\n🔮 **Predictive Infrastructure Forecast:**\n\nCurrently, there are no active unresolved hazards in the database. The 7-day risk forecast is **Clear**. No predictive maintenance is required at this moment.`
          );
        } else {
          // Send active issues to Gemini for predictive analysis
          const prompt = `You are "Eye Nexus", an elite predictive infrastructure AI. Analyze the following active city issues: ${JSON.stringify(activeIssues.map((i: any) => ({title: i.title, category: i.category, severity: i.severity})))}\n\nGenerate a highly advanced, technical "7-Day Infrastructure Risk Forecast". Provide the output EXACTLY in this markdown format without any introductory text:\n\n**Risk Level:** [Low/Medium/High/Critical]\n**Key Vulnerabilities:** [Identify 2 specific compounding risks based on the data]\n**Cascading Failure Prediction:** [What will happen if these are not fixed in 7 days?]\n**Recommended Mitigation:** [Top technical recommendation]\n\nKeep the tone futuristic, encrypted, data-driven, and highly professional.`;
          
          const forecastRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
            })
          });
          
          let predictionText = "**Risk Level:** High\n**Key Vulnerabilities:** Unresolved multi-category hazards compounding local infrastructure stress.\n**Cascading Failure Prediction:** Elevated risk of systemic degradation across civic sectors within T+7 days if ignored.\n**Recommended Mitigation:** Immediate dispatch of level-2 engineering contractors to critical zones.";
          
          if (forecastRes.ok) {
            const fData = await forecastRes.json();
            if (fData.candidates && fData.candidates[0].content) {
              predictionText = fData.candidates[0].content.parts[0].text.trim();
            }
          }

          aiMessage = aiMessage.replace(
            forecastRegex,
            `\n\n🔮 **Live Telemetry & Predictive Forecast (T+7 Days):**\n\n**Active Hazard Triggers:** ${activeIssues.length}\n\n${predictionText}\n\n*Forecast generated dynamically via Gemini 2.5 Flash Nexus Core.*`
          );
        }
      } catch (err) {
        aiMessage = aiMessage.replace(forecastRegex, `\n\n❌ **Forecast Error:** Could not connect to the Sanity Telemetry Database for predictive analysis.`);
      }
    }

    // Intercept Analytics Intent
    const analyticsRegex = /\[ANALYTICS_INTENT:\s*city="([^"]+)",\s*hindi="([^"]+)"\]/;
    const analyticsMatch = aiMessage.match(analyticsRegex);

    if (analyticsMatch) {
      const [_, cityName, hindiName] = analyticsMatch;
      try {
        const { adminClient } = await import('@/sanity/lib/client');
        
        // Fetch all issues for this specific city (checking both EN and HI)
        const query = `*[_type == "issue" && (lower(city) match lower($cityName) || lower(city) match lower($hindiName))] | order(_createdAt desc)`;
        const issues = await adminClient.fetch(query, { cityName: cityName + '*', hindiName: hindiName + '*' });
        
        if (!issues || issues.length === 0) {
          aiMessage = aiMessage.replace(
            analyticsRegex,
            `\n\n📊 **City Analytics for ${cityName}:**\n\nI have scanned the central database. Currently, **we do not have any issues reported for ${cityName}**.\n\nOur Nexus Grid is monitoring the region, but everything seems clear at this time.`
          );
        } else {
          const total = issues.length;
          const resolved = issues.filter((i: any) => i.status === 'Resolved').length;
          const critical = issues.filter((i: any) => i.severity >= 8 && i.status !== 'Resolved').length;

          let reportData = `\n\n📊 **Live City Analytics for ${cityName} (Sanity DB):**\n\n- **Total Hazards Logged:** ${total}\n- **Hazards Resolved:** ${resolved} (SLA Met)\n- **Pending Critical (4H SLA):** ${critical}\n\n`;
          
          reportData += `**Detailed Issue Reports for ${cityName}:**\n\n`;
          
          issues.forEach((issue: any, index: number) => {
            reportData += `---
**Report #${index + 1}: ${issue.title}**
- **Category:** ${issue.category || 'General'}
- **Severity Tier:** ${issue.triageTier || 'Standard'}
- **Status:** \`${issue.status || 'Reported'}\`
- **Exact Location:** ${issue.location || 'Not Specified'}
`;
          });
          
          reportData += `\n*The Nexus Grid is actively monitoring these metrics.*`;

          aiMessage = aiMessage.replace(analyticsRegex, reportData);
        }
      } catch (err) {
        aiMessage = aiMessage.replace(analyticsRegex, `\n\n❌ **Analytics Error:** Could not connect to the Sanity Telemetry Database while fetching data for ${cityName}.`);
      }
    }

    // Intercept Emergency Intent
    const emergencyRegex = /\[EMERGENCY_INTENT:\s*message="([^"]+)"\]/;
    const emergencyMatch = aiMessage.match(emergencyRegex);

    if (emergencyMatch) {
      const [_, emergencyMessage] = emergencyMatch;
      try {
        const { adminClient } = await import('@/sanity/lib/client');
        const alert = await adminClient.create({
          _type: 'issue',
          title: `🚨 CITY EMERGENCY: ${emergencyMessage}`,
          category: 'Public Safety',
          severity: 10,
          triageTier: 'Critical',
          status: 'Reported',
          location: 'Command Nexus Override',
          reporterId: 'Eye Nexus AI Agent',
          aiAnalysis: JSON.stringify({
            triageTier: 'Critical',
            mappedSeverity: 'high',
            exact_reasoning: `Emergency Protocol triggered by AI Agent: ${emergencyMessage}`,
          }),
        });
        aiMessage = aiMessage.replace(
          emergencyRegex,
          `\n\n🚨 **CITY EMERGENCY LOGGED** — Reference: \`${alert._id.slice(0, 8).toUpperCase()}\`\n\nA **Critical-tier** emergency alert has been injected into the Civic Eye command nexus and will appear on the live map immediately. All relevant municipal departments have been notified via the routing protocol.\n\n*Emergency Message:* "${emergencyMessage}"`
        );
      } catch (err) {
        aiMessage = aiMessage.replace(emergencyRegex, `\n\n❌ **Emergency Protocol Failed.** Could not connect to the command nexus database.`);
      }
    }

    // Intercept Leaderboard Intent
    const leaderboardRegex = /\[LEADERBOARD_INTENT\]/;
    if (aiMessage.match(leaderboardRegex)) {
      try {
        const { adminClient } = await import('@/sanity/lib/client');
        const users = await adminClient.fetch(`*[_type == "userAccount"] | order(score desc)[0...5] { name, score, resolvedCount, verifyCount, badge }`);
        let msg = `\n\n🏆 **Live Civic Eye Leaderboard:**\n\n`;
        users.forEach((u: any, i: number) => {
          msg += `${i + 1}. **${u.name}** - ${u.score} XP (${u.badge || 'Citizen'})\n   *Resolved: ${u.resolvedCount || 0} | Verified: ${u.verifyCount || 0}*\n`;
        });
        aiMessage = aiMessage.replace(leaderboardRegex, msg);
      } catch (e) {
        aiMessage = aiMessage.replace(leaderboardRegex, `\n\n❌ **Error loading leaderboard.**`);
      }
    }

    // Intercept Bid Stats Intent
    const bidRegex = /\[BID_STATS_INTENT\]/;
    if (aiMessage.match(bidRegex)) {
      try {
        const { adminClient } = await import('@/sanity/lib/client');
        const bids = await adminClient.fetch(`*[_type == "bid"] { bidAmount, status }`);
        let highest = 0;
        let lowest = Infinity;
        let accepted = 0;
        let rejected = 0;
        bids.forEach((b: any) => {
           if (b.bidAmount > highest) highest = b.bidAmount;
           if (b.bidAmount < lowest) lowest = b.bidAmount;
           if (b.status === 'Accepted') accepted++;
           if (b.status === 'Rejected') rejected++;
        });
        if (lowest === Infinity) lowest = 0;
        const msg = `\n\n💼 **Global Contractor Bid Analytics:**\n\n- **Total Bids:** ${bids.length}\n- **Accepted:** ${accepted}\n- **Rejected:** ${rejected}\n- **Lowest Bid:** ₹${lowest}\n- **Highest Bid:** ₹${highest}\n`;
        aiMessage = aiMessage.replace(bidRegex, msg);
      } catch (e) {
        aiMessage = aiMessage.replace(bidRegex, `\n\n❌ **Error loading bid analytics.**`);
      }
    }

    // Intercept Date Stats Intent
    const dateStatsRegex = /\[DATE_STATS_INTENT:\s*date="([^"]+)"\]/;
    const dateMatch = aiMessage.match(dateStatsRegex);
    if (dateMatch) {
      const [_, dateStr] = dateMatch;
      try {
        const { adminClient } = await import('@/sanity/lib/client');
        const issues = await adminClient.fetch(`*[_type == "issue" && _createdAt match $dateStr] { _id, title }`, { dateStr: dateStr + '*' });
        
        let reportStr = `\n\n📅 **Telemetry for ${dateStr}:**\n\nA total of **${issues.length}** issues were reported to the Civic Eye platform on this date.`;
        if (issues.length > 0) {
          const issueLinks = issues.map((i: any) => `- [${i.title || i._id}](/issue/${i._id})`).join('\n');
          reportStr += `\n\n**Reported Issues:**\n${issueLinks}`;
        }
        
        aiMessage = aiMessage.replace(dateStatsRegex, reportStr);
      } catch (e) {
        aiMessage = aiMessage.replace(dateStatsRegex, `\n\n❌ **Error loading telemetry for ${dateStr}.**`);
      }
    }

    // Intercept Total Stats Intent
    const totalStatsRegex = /\[TOTAL_STATS_INTENT\]/;
    if (aiMessage.match(totalStatsRegex)) {
      try {
        const { adminClient } = await import('@/sanity/lib/client');
        const [totalIssues, totalUsers, totalContractors, totalBids] = await Promise.all([
          adminClient.fetch(`count(*[_type == "issue"])`),
          adminClient.fetch(`count(*[_type == "userAccount"])`),
          adminClient.fetch(`count(*[_type == "contractor"])`),
          adminClient.fetch(`count(*[_type == "bid"])`)
        ]);
        
        aiMessage = aiMessage.replace(totalStatsRegex, `\n\n🌐 **Civic Eye Global Telemetry (Lifetime):**\n\n- **Total Hazards Reported:** ${totalIssues}\n- **Total Registered Citizens:** ${totalUsers}\n- **Total Verified Contractors:** ${totalContractors}\n- **Total Bids Submitted:** ${totalBids}\n\n*The autonomous command nexus is continuously monitoring this data.*`);
      } catch (e) {
        aiMessage = aiMessage.replace(totalStatsRegex, `\n\n❌ **Error loading global telemetry.**`);
      }
    }

    return NextResponse.json({ message: aiMessage });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to connect to the Nexus Core.' }, { status: 500 });
  }
}
