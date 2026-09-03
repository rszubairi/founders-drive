import { mutation } from "convex/server";

export const seedDatabase = mutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existingEvents = await ctx.db.query("events").collect();
    if (existingEvents.length > 0) {
      return { message: "Database already has data." };
    }

    // 1. Seed Event: Vol. 02
    const eventId = await ctx.db.insert("events", {
      title: "Roast My Startup",
      volume: "Vol. 02",
      editionDate: "Thu 26 Jun 2026",
      doorsTime: "6:30 PM",
      startTime: "7:00 PM",
      venue: "Common Ground KL Eco City",
      city: "Kuala Lumpur",
      capacityFounders: 4,
      capacityAudience: 80,
      registeredCount: 68,
      status: "upcoming",
      applicationsCloseDate: "Fri 12 Jun 2026",
      theme: "B2B SaaS, Agtech & Cross-Border FinTech",
    });

    // 2. Seed Startups & Founders
    // Startup 1: Aerocrop
    const aeroId = await ctx.db.insert("startups", {
      name: "Aerocrop Agtech",
      slug: "aerocrop-agtech",
      pitch: "Autonomous drone imagery and predictive yield analytics for Malaysian oil palm plantations.",
      description: "Aerocrop helps plantation managers detect early ganoderma fungus and optimize fertilizer spread using multispectral drone mapping and edge AI.",
      website: "https://aerocrop.my",
      city: "Kuala Lumpur",
      sector: "Agritech / Deep Tech",
      stage: "Seed",
      teamSize: "8 people",
      traction: "RM 85k MRR · 14 plantation groups across Perak & Sabah · 42,000 hectares scanned",
      mrr: "RM 85,000",
      fundingRaised: "RM 500k Pre-Seed",
      fundStatus: "Raising now",
      targetAmount: "RM 2,500,000",
      targetInvestors: "Regional Agri-food & Industrial VCs",
      helpWanted: ["Customer introductions", "International expansion (Indonesia)", "Fundraising advice"],
      realityScore: 78,
      momentumScore: 91,
      status: "roasted_alumni",
      createdAt: Date.now() - 60 * 86400000,
    });

    await ctx.db.insert("founders", {
      startupId: aeroId,
      name: "Dharshan Nair",
      role: "Co-Founder & CEO",
      email: "dharshan@aerocrop.my",
      linkedin: "https://linkedin.com/in/dharshan-nair",
      bio: "Ex-drone systems engineer at Petronas, 7+ years in aerial telemetry.",
      isPrimary: true,
      isExited: false,
    });

    // Startup 2: BayarPulse
    const bayarId = await ctx.db.insert("startups", {
      name: "BayarPulse",
      slug: "bayarpulse",
      pitch: "Instant cross-border payroll and treasury settlement for Malaysian tech teams hiring remote SEA talent.",
      description: "Automated Ringgit to local currency payroll disbursement with zero correspondent banking delays and built-in statutory tax deductions for remote contractors.",
      website: "https://bayarpulse.io",
      city: "Cyberjaya",
      sector: "Fintech",
      stage: "Pre-Seed",
      teamSize: "4 people",
      traction: "RM 420k monthly TPV · 24 Malaysian tech startups live · 18% MoM growth",
      mrr: "RM 16,500",
      fundingRaised: "Bootstrapped",
      fundStatus: "Raising now",
      targetAmount: "RM 1,200,000",
      targetInvestors: "Fintech & B2B seed funds",
      helpWanted: ["VC introductions", "GTM mentoring", "Regulatory & compliance advice"],
      realityScore: 71,
      momentumScore: 84,
      status: "active",
      createdAt: Date.now() - 30 * 86400000,
    });

    await ctx.db.insert("founders", {
      startupId: bayarId,
      name: "Farah Zainal",
      role: "Founder & CEO",
      email: "farah@bayarpulse.io",
      linkedin: "https://linkedin.com/in/farah-zainal",
      bio: "Ex-Fintech product lead at Grab Financial, chartered accountant.",
      isPrimary: true,
      isExited: false,
    });

    // Startup 3: SupplyJaga
    const supplyId = await ctx.db.insert("startups", {
      name: "SupplyJaga",
      slug: "supplyjaga",
      pitch: "Next-day consolidated procurement and inventory intelligence for Malaysian F&B chains and kopitiams.",
      description: "Connecting 400+ food operators directly with local poultry, fresh produce, and dry goods distributors with guaranteed morning drop-offs and 14-day credit terms.",
      website: "https://supplyjaga.com",
      city: "Petaling Jaya",
      sector: "Marketplace / Logistics",
      stage: "Seed",
      teamSize: "14 people",
      traction: "RM 1.4M GMV / month · 410 active restaurants in Klang Valley · 94% repeat purchase rate",
      mrr: "RM 72,000 (net take-rate)",
      fundingRaised: "RM 800k Angel syndicate",
      fundStatus: "Open to intros",
      targetAmount: "RM 3,500,000",
      targetInvestors: "Logistics, Marketplace & Commerce funds",
      helpWanted: ["Warehouse automation partners", "Customer introductions", "Hiring senior CTO"],
      realityScore: 83,
      momentumScore: 94,
      status: "roasted_alumni",
      createdAt: Date.now() - 90 * 86400000,
    });

    await ctx.db.insert("founders", {
      startupId: supplyId,
      name: "Marcus Tan",
      role: "Co-Founder & COO",
      email: "marcus@supplyjaga.com",
      linkedin: "https://linkedin.com/in/marcus-tan-supply",
      bio: "Second-time founder, previously scaled dark store grocery network.",
      isPrimary: true,
      isExited: true,
    });

    // Startup 4: MedFlow AI
    const medId = await ctx.db.insert("startups", {
      name: "MedFlow AI",
      slug: "medflow-ai",
      pitch: "Multilingual ambient clinical documentation that cuts doctor charting time from 18 minutes to 90 seconds.",
      description: "Fine-tuned on Malaysian Bahasa, Manglish, Mandarin medical terminology and local clinic drug formularies with EMR integration.",
      website: "https://medflow.ai",
      city: "Kuala Lumpur",
      sector: "Healthtech / AI",
      stage: "Pre-Series A",
      teamSize: "11 people",
      traction: "RM 115k MRR · 38 private clinics & 2 hospital networks in pilot · 85,000 consultations transcribed",
      mrr: "RM 115,000",
      fundingRaised: "RM 1.8M Seed (Cradle + Angels)",
      fundStatus: "Raising now",
      targetAmount: "RM 5,000,000",
      targetInvestors: "Healthtech, Deeptech & Regional Series A leads",
      helpWanted: ["Hospital enterprise introductions", "International expansion (Singapore, Thailand)", "Hiring clinical leads"],
      realityScore: 86,
      momentumScore: 96,
      status: "active",
      createdAt: Date.now() - 120 * 86400000,
    });

    await ctx.db.insert("founders", {
      startupId: medId,
      name: "Dr. Alicia Lim",
      role: "Co-Founder & CEO",
      email: "alicia@medflow.ai",
      linkedin: "https://linkedin.com/in/dr-alicia-lim",
      bio: "Former NHS & KPJ medical registrar, health informatics specialist.",
      isPrimary: true,
      isExited: false,
    });

    // 3. Seed Live Poll Sessions for Event Vol. 02
    const poll1 = await ctx.db.insert("roastPolls", {
      eventId,
      pitchNumber: 1,
      startupName: "Aerocrop Agtech",
      oneLiner: "Autonomous drone imagery and predictive yield analytics for oil palm plantations.",
      sector: "Agritech",
      stage: "Seed",
      status: "closed",
      totalVotes: 142,
    });

    const poll2 = await ctx.db.insert("roastPolls", {
      eventId,
      pitchNumber: 2,
      startupName: "BayarPulse",
      oneLiner: "Cross-border payroll & statutory settlement for remote Southeast Asian teams.",
      sector: "Fintech",
      stage: "Pre-Seed",
      status: "closed",
      totalVotes: 138,
    });

    const poll3 = await ctx.db.insert("roastPolls", {
      eventId,
      pitchNumber: 3,
      startupName: "SupplyJaga",
      oneLiner: "Consolidated procurement & inventory engine for Malaysian F&B chains.",
      sector: "Marketplace / Logistics",
      stage: "Seed",
      status: "active",
      totalVotes: 145,
    });

    const poll4 = await ctx.db.insert("roastPolls", {
      eventId,
      pitchNumber: 4,
      startupName: "MedFlow AI",
      oneLiner: "Multilingual ambient clinical scribe saving 80% doctor charting time.",
      sector: "Healthtech / AI",
      stage: "Pre-Series A",
      status: "draft",
      totalVotes: 0,
    });

    // Seed sample votes for Poll 3 (SupplyJaga)
    await ctx.db.insert("pollVotes", {
      pollId: poll3,
      voterSessionId: "session-sample-1",
      clarityScore: 9,
      investibilityScore: 8,
      innovationScore: 7,
      tags: ["Crystal clear ICP", "Huge TAM", "Strong founder aura"],
      audienceNote: "Very clear unit economics. Working capital terms with suppliers will be the main bottleneck to watch.",
      submittedAt: Date.now() - 300000,
    });

    await ctx.db.insert("pollVotes", {
      pollId: poll3,
      voterSessionId: "session-sample-2",
      clarityScore: 8,
      investibilityScore: 7,
      innovationScore: 6,
      tags: ["Pricing too conservative", "High defensibility"],
      audienceNote: "Great repeat purchase rate. Need to verify how they defend against Ninja Van / Grab logistics expansion.",
      submittedAt: Date.now() - 200000,
    });

    // 4. Seed Investors
    await ctx.db.insert("investors", {
      name: "Khailee Ng",
      fundName: "500 Global (SEA)",
      role: "Managing Partner",
      type: "VC Fund",
      status: "Actively deploying",
      stagePreferences: ["Pre-Seed", "Seed", "Series A"],
      sectors: ["Fintech", "SaaS", "Commerce", "AI", "Marketplace"],
      ticketMin: "RM 500k",
      ticketMax: "RM 5M",
      geography: "Malaysia & Southeast Asia",
      thesis: "High-velocity founders building scalable regional platforms with clear unit economics.",
      leadPreference: "Lead",
      portfolioHighlights: ["Grab", "Bukalapak", "Carsome", "Kargo"],
      isVerified: true,
      contactWorkflow: "Controlled warm intro via Founders Drive",
    });

    await ctx.db.insert("investors", {
      name: "Thomas Tsao",
      fundName: "Gobi Partners",
      role: "Co-Founder & Chair",
      type: "VC Fund",
      status: "Actively deploying",
      stagePreferences: ["Seed", "Series A", "Series B"],
      sectors: ["Fintech", "Healthtech", "TaqwaTech", "Enterprise"],
      ticketMin: "RM 1.5M",
      ticketMax: "RM 12M",
      geography: "Pan-Asian & Emerging Markets",
      thesis: "Backing resilient entrepreneurs solving underserved market inefficiencies in Southeast Asia.",
      leadPreference: "Lead or Co-invest",
      portfolioHighlights: ["Deliveree", "Carsome", "PolicyPal", "Zoom"],
      isVerified: true,
      contactWorkflow: "Controlled warm intro via Founders Drive",
    });

    await ctx.db.insert("investors", {
      name: "Norman Matthieu Vanhaecke",
      fundName: "Cradle Fund (CIP Spark / Sprint)",
      role: "CEO & Ecosystem Lead",
      type: "Government Tech Fund",
      status: "Actively deploying",
      stagePreferences: ["Idea", "Pre-Seed", "Seed"],
      sectors: ["Deep Tech", "Agritech", "AI", "CleanTech", "Fintech"],
      ticketMin: "RM 150k",
      ticketMax: "RM 800k",
      geography: "Malaysia",
      thesis: "Non-dilutive commercialization grants and catalytic seed co-investment for Malaysian innovators.",
      leadPreference: "Grant / Co-invest",
      portfolioHighlights: ["MyHSR", "Involve Asia", "Dropee", "Naluri"],
      isVerified: true,
      contactWorkflow: "Direct application via Founders Drive portal",
    });

    // 5. Seed Reality Check Report for SupplyJaga
    const reportId = await ctx.db.insert("realityCheckReports", {
      eventId,
      startupId: supplyId,
      startupName: "SupplyJaga",
      overallScore: 81,
      audienceClarityAvg: 8.7,
      audienceInvestibilityAvg: 7.9,
      audienceInnovationAvg: 7.4,
      criticalIssues: [
        "14-day credit terms to kopitiams create working capital strain if scaling 3x without debt facility.",
        "Supplier concentration: top 3 poultry suppliers account for 58% of volume.",
      ],
      importantIssues: [
        "Sales team currently founder-led; needs repeatable B2B onboarding playbook for non-Klang Valley regions.",
        "Take-rate of 5.1% has room to expand with private-label consumables.",
      ],
      strengths: [
        "94% 6-month cohort retention is top-decile across Southeast Asian B2B commerce.",
        "Gross margin positive on every route since Month 4.",
      ],
      top3Actions: [
        {
          why: "Working capital cycle limits merchant onboarding speed.",
          what: "Secure an invoice financing debt line with a digital bank.",
          how: "Pilot RM 1M supply chain financing line with GXBank / Boost Bank at 1.2% per cycle.",
          who: "Introduce fintech debt partner and CFO advisor.",
        },
        {
          why: "Supplier concentration creates price vulnerability.",
          what: "Onboard secondary poultry and produce co-ops in Perak & Johor.",
          how: "Lock 6-month volume commitments with 3 agricultural cooperatives.",
          who: "Connect with FAMA and Malaysian Agri-Distributors Association.",
        },
        {
          why: "Need to free up founders from operational dispatch.",
          what: "Hire Head of Operations & Logistics Dispatch lead.",
          how: "Recruit ex-Shopee Express / Teleport logistics lead with warehouse experience.",
          who: "Founders Drive talent matching intro.",
        },
      ],
      matchedExperts: ["Ex-Ninja Van COO", "Managing Partner at Seed VC", "F&B Group Chairman"],
      founderCommitmentDate: "90 days (Target review: Sep 2026)",
      stage: "Day 30 Update",
    });

    // Seed Action Plans
    await ctx.db.insert("actionPlans", {
      startupId: supplyId,
      realityReportId: reportId,
      dayMilestone: 30,
      itemTitle: "Invoice financing debt facility",
      challengeRaised: "Panel challenged the 14-day working capital lag as a scale blocker.",
      founderAction: "Signed term sheet for RM 1.2M revolving credit line with digital banking partner.",
      status: "Implemented",
      evidence: "Term sheet executed on 14 May. Working capital cycle shortened to 2 days.",
      updatedAt: Date.now() - 15 * 86400000,
    });

    await ctx.db.insert("actionPlans", {
      startupId: supplyId,
      realityReportId: reportId,
      dayMilestone: 60,
      itemTitle: "Supplier diversification in Perak",
      challengeRaised: "Panel highlighted top 3 poultry supplier concentration risk (58%).",
      founderAction: "Onboarding 4 new regional farming cooperatives.",
      status: "Testing",
      evidence: "Pilot batch of 12 tonnes delivered last week; supplier concentration reduced to 41%.",
      updatedAt: Date.now() - 2 * 86400000,
    });

    return { success: true, message: "Database seeded successfully." };
  },
});
