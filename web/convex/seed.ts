import { mutation } from "./_generated/server";

/**
 * Seed the Founders Drive ecosystem with sample data.
 * Run once from the dashboard or: `npx convex run seed:seed`
 *
 * Startups here are illustrative samples. Investor entries name real
 * Malaysian / SEA funds but use placeholder partner names and carry no
 * private contact details.
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // wipe (idempotent reseed)
    for (const t of [
      "pollVotes",
      "roastPolls",
      "realityCheckReports",
      "actionPlans",
      "founders",
      "pitchApplications",
      "eventRegistrations",
      "introRequests",
      "profileClaims",
      "emailLog",
      "founderSessions",
      "founderAccounts",
      "investorSessions",
      "investorAccounts",
      "newsPosts",
      "ecosystemEvents",
      "outreachMessages",
      "outreachThreads",
      "outreachCredits",
      "stripeCheckouts",
      "stripeWebhookEvents",
      "startupNews",
      "programmeFeedback",
      "startupProgrammes",
      "programmes",
      "contributors",
      "startups",
      "investors",
      "events",
      "founderPerks",
    ] as const) {
      const rows = await ctx.db.query(t).collect();
      for (const r of rows) await ctx.db.delete(r._id as any);
    }

    const now = Date.now();

    const startupSeed = [
      {
        name: "Aerocrop",
        pitch: "Drone-and-satellite crop analytics that tells Malaysian oil-palm estates exactly which hectares to replant.",
        sector: "Agritech / Deep Tech",
        stage: "Seed",
        city: "Cyberjaya",
        website: "https://aerocrop.example.my",
        teamSize: "4-10",
        traction: "9 estates under contract, RM 42k MRR, 3-month payback for customers.",
        fundingRaised: "RM 1.8M pre-seed",
        fundStatus: "Raising now",
        targetAmount: "RM 6M seed",
        helpWanted: ["Investor introductions", "GTM mentoring", "International expansion"],
        momentumScore: 78,
        realityScore: 72,
        featured: true,
        metrics: { mrr: "RM 42k", pilots: "9 estates" },
        founder: { name: "[Founder name]", role: "CEO & co-founder", email: "founder@aerocrop.example.my" },
      },
      {
        name: "BayarPulse",
        pitch: "Recurring-payments infrastructure for Malaysian SMEs — DuitNow, cards and e-wallets behind one API.",
        sector: "Fintech",
        stage: "Seed",
        city: "Kuala Lumpur",
        website: "https://bayarpulse.example.my",
        teamSize: "11-25",
        traction: "RM 30M annualised GMV, 1,400 active merchants, 8% MoM growth.",
        fundingRaised: "RM 4.2M seed",
        fundStatus: "Open to intros",
        targetAmount: "Series A in ~9 months",
        helpWanted: ["Fundraising advice", "Hiring", "Partnerships"],
        momentumScore: 71,
        realityScore: 64,
        featured: true,
        metrics: { gmv: "RM 30M annualised", arr: "RM 1.1M" },
        founder: { name: "[Founder name]", role: "Co-founder & CEO", email: "founder@bayarpulse.example.my" },
      },
      {
        name: "SupplyJaga",
        pitch: "B2B marketplace connecting F&B outlets with vetted local suppliers, with embedded 30-day credit.",
        sector: "Marketplace / Logistics",
        stage: "Pre-Seed",
        city: "Petaling Jaya",
        teamSize: "2-3",
        traction: "180 outlets, RM 600k GMV last quarter, 55% reorder rate.",
        fundingRaised: "RM 400k angel",
        fundStatus: "Raising now",
        targetAmount: "RM 2.5M pre-seed",
        helpWanted: ["Customer introductions", "Fundraising advice", "Technical advice"],
        momentumScore: 62,
        founder: { name: "[Founder name]", role: "Founder", email: "founder@supplyjaga.example.my" },
      },
      {
        name: "MedFlow",
        pitch: "Clinic operating system for Malaysian GP practices — queue, records, claims and teleconsults in one place.",
        sector: "Healthtech / AI",
        stage: "Seed",
        city: "Kuala Lumpur",
        website: "https://medflow.example.my",
        teamSize: "4-10",
        traction: "63 clinics live, RM 55k MRR, NPS 61.",
        fundingRaised: "RM 2.1M seed",
        fundStatus: "Not raising",
        helpWanted: ["Hiring", "Partnerships"],
        momentumScore: 58,
        realityScore: 69,
        metrics: { mrr: "RM 55k", pilots: "63 clinics" },
        founder: { name: "[Founder name]", role: "CEO", email: "founder@medflow.example.my" },
      },
      {
        name: "Rumah Rakit",
        pitch: "Prefab modular housing for the B40 segment, delivered and assembled in under two weeks.",
        sector: "Climate / Energy",
        stage: "Pre-Seed",
        city: "Johor Bahru",
        teamSize: "4-10",
        traction: "2 show units built, 40 units in the pipeline with a state agency.",
        fundStatus: "Open to intros",
        helpWanted: ["Investor introductions", "Partnerships", "GTM mentoring"],
        momentumScore: 49,
        founder: { name: "[Founder name]", role: "Co-founder", email: "founder@rumahrakit.example.my" },
      },
      {
        name: "Kelas Kita",
        pitch: "Vernacular upskilling platform for Malaysian frontline workers, sold to employers per seat.",
        sector: "SaaS / B2B software",
        stage: "Seed",
        city: "Kuala Lumpur",
        website: "https://kelaskita.example.my",
        teamSize: "11-25",
        traction: "22 enterprise clients, RM 90k MRR, 92% logo retention.",
        fundingRaised: "RM 3.5M seed",
        fundStatus: "Raising now",
        targetAmount: "RM 12M Series A",
        helpWanted: ["Fundraising advice", "International expansion", "Investor introductions"],
        momentumScore: 74,
        realityScore: 66,
        featured: true,
        metrics: { mrr: "RM 90k", arr: "RM 1.08M" },
        founder: { name: "[Founder name]", role: "CEO & founder", email: "founder@kelaskita.example.my" },
      },
      {
        name: "GudangGo",
        pitch: "On-demand micro-warehousing for Malaysian e-commerce sellers, priced by the pallet by the day.",
        sector: "Marketplace / Logistics",
        stage: "Seed",
        city: "Shah Alam",
        teamSize: "11-25",
        traction: "4 hubs, 320 sellers, RM 210k MRR.",
        fundingRaised: "RM 5M seed",
        fundStatus: "Not raising",
        helpWanted: ["Hiring"],
        momentumScore: 55,
        metrics: { mrr: "RM 210k" },
        founder: { name: "[Founder name]", role: "COO & co-founder", email: "founder@gudanggo.example.my" },
      },
      {
        name: "Tanya AI",
        pitch: "Bahasa-first customer-support copilot that resolves 60% of tickets for SEA consumer brands.",
        sector: "Healthtech / AI",
        stage: "Pre-Seed",
        city: "Cyberjaya",
        website: "https://tanya.example.my",
        teamSize: "2-3",
        traction: "6 design partners, RM 18k MRR, 58% automated-resolution rate.",
        fundStatus: "Raising now",
        targetAmount: "RM 3M pre-seed",
        helpWanted: ["Investor introductions", "Technical advice", "Customer introductions"],
        momentumScore: 67,
        metrics: { mrr: "RM 18k" },
        founder: { name: "[Founder name]", role: "Founder & CTO", email: "founder@tanya.example.my" },
      },
    ];

    const startupIds: Record<string, any> = {};
    for (const s of startupSeed) {
      const { founder, ...rest } = s as any;
      const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const id = await ctx.db.insert("startups", {
        ...rest,
        slug,
        createdAt: now,
        status: "approved",
      });
      startupIds[s.name] = id;
      await ctx.db.insert("founders", {
        startupId: id,
        name: founder.name,
        role: founder.role,
        email: founder.email,
        isPrimary: true,
        bio: `${founder.role} at ${s.name}.`,
      });
    }

    // A freshly submitted startup profile still waiting on review, so
    // /admin/startups has something real to show.
    {
      const slug = "kedai-kira";
      const id = await ctx.db.insert("startups", {
        name: "Kedai Kira",
        slug,
        pitch: "Simple bookkeeping and e-invoicing app for Malaysian sole proprietors and micro-SMEs.",
        sector: "Fintech",
        stage: "Idea stage",
        city: "Ipoh",
        teamSize: "2-3",
        traction: "120 waitlist signups, 8 paid design partners.",
        fundStatus: "Not raising",
        helpWanted: ["Technical advice", "Customer introductions"],
        momentumScore: 41,
        createdAt: now,
        status: "pending",
      });
      await ctx.db.insert("founders", {
        startupId: id,
        name: "[Founder name]",
        role: "Founder",
        email: "founder@kedaikira.example.my",
        isPrimary: true,
        bio: "Founder at Kedai Kira.",
      });
    }

    // ---- Investors ----
    // Real, active Malaysia-focused VC firms (public info as of 2026). Partner
    // names are left as role-only placeholders where no public named contact
    // was verified; no private contact details are stored here.
    const investors = [
      {
        name: "Investment team",
        fundName: "Gobi Partners",
        role: "Partner",
        stagePreferences: ["Seed", "Series A"],
        sectors: ["Fintech", "SaaS / B2B software", "Marketplace / Logistics"],
        ticketMin: 500000,
        ticketMax: 5000000,
        geography: ["Malaysia", "SEA", "China"],
        thesis: "Largest homegrown SEA VC (380+ investments); backs early-stage founders building for the region's digital SMEs and rising middle class.",
        leadPreference: "Lead",
        portfolioHighlights: ["Carsome", "Aerodyne", "Travelio"],
        website: "https://gobi.vc",
        isVerified: true,
      },
      {
        name: "Investment team",
        fundName: "500 Global (SEA)",
        role: "Partner",
        stagePreferences: ["Pre-Seed", "Seed"],
        sectors: ["Sector agnostic"],
        ticketMin: 150000,
        ticketMax: 1000000,
        geography: ["Malaysia", "SEA", "Global"],
        thesis: "High-volume seed investing in ambitious SEA founders; strong follow-on network into the US.",
        leadPreference: "Co-invest",
        portfolioHighlights: ["Grab", "Bukalapak", "FinAccel"],
        website: "https://500.co",
        isVerified: true,
      },
      {
        name: "Investment team",
        fundName: "Cradle Fund (CIP / DEQ)",
        role: "Investment team",
        stagePreferences: ["Idea stage", "Pre-Seed", "Seed"],
        sectors: ["Sector agnostic"],
        ticketMin: 100000,
        ticketMax: 2000000,
        geography: ["Malaysia"],
        thesis: "Government-linked early-stage funding and grants for Malaysian tech startups (CIP Spark, CIP Sprint, DEQ).",
        leadPreference: "Co-invest",
        portfolioHighlights: ["Grab (early grant)", "PayNet ecosystem companies"],
        website: "https://cradle.com.my",
        isVerified: true,
      },
      {
        name: "Investment team",
        fundName: "1337 Ventures",
        role: "Partner",
        stagePreferences: ["Idea stage", "Pre-Seed"],
        sectors: ["Sector agnostic"],
        ticketMin: 50000,
        ticketMax: 500000,
        geography: ["Malaysia", "SEA"],
        thesis: "Pre-seed accelerator and fund (Alpha Startups) backing very early Malaysian founders with hands-on GTM support.",
        leadPreference: "Lead",
        portfolioHighlights: ["Pod", "Cardtap"],
        website: "https://1337.ventures",
        isVerified: true,
      },
      {
        name: "Investment team",
        fundName: "RHL Ventures",
        role: "Investment team",
        stagePreferences: ["Seed", "Series A", "Series B"],
        sectors: ["Healthtech / AI", "Marketplace / Logistics", "Sector agnostic"],
        geography: ["Malaysia", "SEA"],
        thesis: "Malaysia-based fund backing technology-driven startups across healthcare, e-commerce and media.",
        leadPreference: "Either",
        portfolioHighlights: ["KLOOK", "Kumpul"],
        website: "https://www.rhl.vc",
        isVerified: true,
      },
      {
        name: "Investment team",
        fundName: "Vynn Capital",
        role: "Investment team",
        stagePreferences: ["Seed", "Series A", "Series B"],
        sectors: ["Marketplace / Logistics", "Climate / Energy"],
        geography: ["Malaysia", "SEA"],
        thesis: "Backs early-stage entrepreneurs in mobility, supply chain, travel, property and food-tech across SEA.",
        leadPreference: "Either",
        portfolioHighlights: ["Green Rebel", "Frontier Car Group"],
        website: "https://vynncapital.com",
        isVerified: true,
      },
      {
        name: "Investment team",
        fundName: "Kairous Capital",
        role: "Investment team",
        stagePreferences: ["Seed", "Series A", "Series B"],
        sectors: ["Fintech", "Healthtech / AI"],
        geography: ["Malaysia", "SEA"],
        thesis: "Invests across AI, insurtech and financial services, from seed through growth stage.",
        leadPreference: "Either",
        portfolioHighlights: [],
        website: "https://kairous.com",
        isVerified: true,
      },
      {
        name: "Investment team",
        fundName: "Xeraya Capital",
        role: "Investment team",
        stagePreferences: ["Series A", "Series B"],
        sectors: ["Healthtech / AI"],
        geography: ["Malaysia", "SEA"],
        thesis: "Growth-stage fund focused on healthcare, life sciences and consumer technology.",
        leadPreference: "Either",
        portfolioHighlights: [],
        website: "https://xeraya.com",
        isVerified: true,
      },
      {
        name: "Investment team",
        fundName: "TransLink Capital",
        role: "Investment team",
        stagePreferences: ["Series A", "Series B"],
        sectors: ["SaaS / B2B software"],
        geography: ["Malaysia", "SEA", "Global"],
        thesis: "Deep-tech and enterprise-software focused fund bridging Asia and Silicon Valley.",
        leadPreference: "Either",
        portfolioHighlights: [],
        website: "https://translinkcapital.com",
        isVerified: true,
      },
      {
        name: "Investment team",
        fundName: "Nova Founders Capital",
        role: "Investment team",
        stagePreferences: ["Seed", "Series A", "Series B"],
        sectors: ["Fintech"],
        geography: ["Malaysia", "SEA"],
        thesis: "Fintech-focused venture builder and fund investing from seed through Series B.",
        leadPreference: "Either",
        portfolioHighlights: [],
        isVerified: false,
      },
      {
        name: "Investment team",
        fundName: "ICCP SBI Venture Partners",
        role: "Investment team",
        stagePreferences: ["Series A", "Series B"],
        sectors: ["SaaS / B2B software"],
        geography: ["Malaysia"],
        thesis: "Enterprise and technology-focused growth-stage investor active since 1998.",
        leadPreference: "Either",
        portfolioHighlights: [],
        isVerified: false,
      },
      {
        name: "Investment team",
        fundName: "K2 Global",
        role: "Investment team",
        stagePreferences: ["Seed", "Series A", "Series B"],
        sectors: ["SaaS / B2B software"],
        geography: ["Malaysia", "Global"],
        thesis: "Backs enterprise-software and high-tech companies from seed through later rounds.",
        leadPreference: "Either",
        portfolioHighlights: [],
        isVerified: false,
      },
      {
        name: "Investment team",
        fundName: "Antler Malaysia",
        role: "Investment team",
        stagePreferences: ["Idea stage", "Pre-Seed"],
        sectors: ["Sector agnostic"],
        ticketMin: 100000,
        ticketMax: 150000,
        geography: ["Malaysia", "Global"],
        thesis: "Global early-stage VC and residency programme that co-founds and funds day-zero startups.",
        leadPreference: "Lead",
        portfolioHighlights: [],
        website: "https://www.antler.co",
        isVerified: true,
      },
      {
        name: "Investment team",
        fundName: "The Hive Southeast Asia",
        role: "Investment team",
        stagePreferences: ["Seed", "Series A"],
        sectors: ["SaaS / B2B software", "Sector agnostic"],
        geography: ["Malaysia", "SEA"],
        thesis: "Tech and tech-adjacent seed-to-Series-A fund with a hands-on venture studio arm.",
        leadPreference: "Either",
        portfolioHighlights: [],
        website: "https://www.thehivesea.com",
        isVerified: true,
      },
      {
        name: "Investment team",
        fundName: "Netrove Partners",
        role: "Investment team",
        stagePreferences: ["Seed", "Series A", "Series B"],
        sectors: ["Sector agnostic"],
        geography: ["Malaysia", "SEA"],
        thesis: "Early to growth-stage investor across SEA technology companies.",
        leadPreference: "Either",
        portfolioHighlights: [],
        isVerified: false,
      },
      {
        name: "Investment team",
        fundName: "Captii Ventures",
        role: "Investment team",
        stagePreferences: ["Seed"],
        sectors: ["Sector agnostic"],
        geography: ["Malaysia"],
        thesis: "Corporate VC arm investing at seed stage in Malaysian technology startups.",
        leadPreference: "Either",
        portfolioHighlights: [],
        website: "https://captii.vc",
        isVerified: false,
      },
      {
        name: "Investment team",
        fundName: "E3 Hubs",
        role: "Investment team",
        stagePreferences: ["Idea stage", "Pre-Seed", "Seed"],
        sectors: ["Sector agnostic"],
        geography: ["Malaysia"],
        thesis: "Angel-network-backed fund writing very early cheques into Malaysian founders.",
        leadPreference: "Co-invest",
        portfolioHighlights: [],
        website: "https://e3hubs.com",
        isVerified: false,
      },
      {
        name: "Investment team",
        fundName: "FirstFloor Capital",
        role: "Investment team",
        stagePreferences: ["Seed", "Series A", "Series B"],
        sectors: ["Sector agnostic"],
        geography: ["Malaysia"],
        thesis: "Seed to Series B investor backing Malaysian technology companies.",
        leadPreference: "Either",
        portfolioHighlights: [],
        isVerified: false,
      },
      {
        name: "Investment team",
        fundName: "OSK Ventures International",
        role: "Investment team",
        stagePreferences: ["Seed", "Series A", "Series B"],
        sectors: ["Fintech", "Sector agnostic"],
        geography: ["Malaysia"],
        thesis: "Publicly listed VC arm of OSK Group investing from early to late stage across consumer, fintech and enterprise models.",
        leadPreference: "Either",
        portfolioHighlights: [],
        website: "https://oskvi.com",
        isVerified: true,
      },
      {
        name: "Investment team",
        fundName: "Malaysia Venture Capital Management Berhad (MAVCAP)",
        role: "Investment team",
        stagePreferences: ["Seed", "Series A", "Series B"],
        sectors: ["Sector agnostic"],
        geography: ["Malaysia"],
        thesis: "Government-linked fund-of-funds and direct investor supporting the Malaysian VC ecosystem.",
        leadPreference: "Co-invest",
        portfolioHighlights: [],
        isVerified: true,
      },
      {
        name: "[Angel name]",
        fundName: "Malaysian Business Angel Network (MBAN) syndicate",
        role: "Angel syndicate lead",
        stagePreferences: ["Pre-Seed", "Seed"],
        sectors: ["Fintech", "Consumer / D2C", "Marketplace / Logistics"],
        ticketMin: 25000,
        ticketMax: 300000,
        geography: ["Malaysia"],
        thesis: "Operator-angels writing first cheques into Malaysian founders, often alongside institutional pre-seed.",
        leadPreference: "Co-invest",
        portfolioHighlights: ["Various seed-stage MY startups"],
        isVerified: false,
      },
    ];
    for (const inv of investors)
      await ctx.db.insert("investors", { ...inv, status: "approved" });

    // A couple of freshly submitted fund sign-ups still waiting on review,
    // so /admin/investors has something real to show.
    const pendingInvestorSeed = [
      {
        name: "Aiman Rasyid",
        fundName: "Meridian East Capital",
        role: "Principal",
        stagePreferences: ["Seed", "Series A"],
        sectors: ["Fintech", "SaaS / B2B software"],
        ticketMin: 300000,
        ticketMax: 2000000,
        geography: ["Malaysia", "SEA"],
        thesis: "New fund raised by ex-operators; backing enterprise software and fintech founders in Malaysia.",
        leadPreference: "Co-invest",
        portfolioHighlights: [],
        website: "https://meridianeast.example.my",
        contactEmail: "aiman@meridianeast.example.my",
        isVerified: false,
        status: "pending",
      },
    ];
    for (const inv of pendingInvestorSeed) await ctx.db.insert("investors", inv);

    // ---- Event ----
    // No past volumes yet — Vol. 02 below is the first Roast My Startup event.
    // Once it (or a later volume) is marked "Completed", it will surface
    // automatically in the Past Events section via events.getPastEvents.
    const pitchingNames = ["Aerocrop", "BayarPulse", "SupplyJaga", "Kelas Kita"];
    const pitching = pitchingNames.map((n) => startupIds[n]);
    const eventId = await ctx.db.insert("events", {
      title: "Roast My Startup — Vol. 02",
      volume: "Vol. 02",
      date: "Thu 26 Jun 2026",
      doorsTime: "6:30 PM",
      startTime: "7:00 PM",
      venue: "Common Ground, KL Eco City",
      totalSeats: 80,
      registeredCount: 47,
      status: "Upcoming",
      pitchingStartups: pitching,
    });

    // ---- Pitch applications ----
    // More startups apply than the four seats available — the admin picks
    // which four actually pitch at /admin/roast.
    for (const s of startupSeed) {
      const selected = pitchingNames.includes(s.name);
      await ctx.db.insert("pitchApplications", {
        eventId,
        startupId: startupIds[s.name],
        companyName: s.name,
        founderName: s.founder.name,
        email: s.founder.email,
        oneLiner: s.pitch,
        sector: s.sector,
        stage: s.stage,
        whyScrutinyReady: `${s.name} wants direct feedback on ${s.fundStatus === "Raising now" ? "the current raise" : "where the business is weak"}.`,
        helpWanted: s.helpWanted,
        status: selected ? "Selected" : "Pending",
        createdAt: now,
      });
    }

    // ---- Polls (one per pitch) ----
    const pollDefs = [
      { pitchNumber: 1, name: "Aerocrop", status: "Closed" },
      { pitchNumber: 2, name: "BayarPulse", status: "Closed" },
      { pitchNumber: 3, name: "SupplyJaga", status: "Active" },
      { pitchNumber: 4, name: "Kelas Kita", status: "Queued" },
    ];
    const pollIds: Record<number, any> = {};
    for (const p of pollDefs) {
      const s = startupSeed.find((x) => x.name === p.name)!;
      const id = await ctx.db.insert("roastPolls", {
        eventId,
        pitchNumber: p.pitchNumber,
        startupId: startupIds[p.name],
        startupName: p.name,
        tagline: s.pitch,
        sector: s.sector,
        stage: s.stage,
        status: p.status,
      });
      pollIds[p.pitchNumber] = id;
    }

    // seed some votes on the closed + active pitches so results look alive
    const seededVotes: Record<number, [number, number, number][]> = {
      1: gen(88, [8, 9], [6, 8], [7, 9]),
      2: gen(120, [6, 8], [5, 7], [5, 7]),
      3: gen(142, [7, 9], [4, 7], [7, 10]),
    };
    const tagPool = [
      "Crystal-clear ICP",
      "Pricing too low",
      "High defensibility",
      "Crowded market",
      "Strong founder-market fit",
      "Unclear wedge",
      "Great traction story",
      "Needs a sharper ask",
    ];
    for (const [num, votes] of Object.entries(seededVotes)) {
      for (let i = 0; i < votes.length; i++) {
        const [c, inv, innov] = votes[i];
        await ctx.db.insert("pollVotes", {
          pollId: pollIds[Number(num)],
          voterSessionId: `seed-${num}-${i}`,
          clarityScore: c,
          investibilityScore: inv,
          innovationScore: innov,
          tags: i % 3 === 0 ? [tagPool[i % tagPool.length]] : [],
          createdAt: now - (votes.length - i) * 1000,
        });
      }
    }

    // ---- Reality Check report + action plan for one alum ----
    await ctx.db.insert("realityCheckReports", {
      eventId,
      startupId: startupIds["BayarPulse"],
      score: 64,
      criticalIssues: [
        "CAC only works if the 9-month enterprise sales cycle comes down.",
        "Take-rate is undifferentiated versus incumbent PSPs.",
      ],
      importantIssues: [
        "No clear economic buyer named inside target merchants.",
        "Churn cohort data is too young to trust.",
      ],
      strengths: [
        "Genuine infra depth — DuitNow + cards + e-wallets behind one API.",
        "8% MoM GMV growth with a small sales team.",
      ],
      top3Actions: [
        {
          why: "Target market is too broad and the sales cycle runs 9–12 months.",
          what: "Narrow the ICP to mid-market fintech and vertical SaaS.",
          how: "Run a 90-day pilot with 20 named target accounts.",
          who: "Two operators, one design-partner customer, one PSP-experienced mentor — introduced by Founders Drive.",
        },
        {
          why: "Pricing leaves margin on the table and signals 'commodity'.",
          what: "Move to value-based pricing with a platform fee.",
          how: "Test three pricing pages with 10 prospects each over 4 weeks.",
          who: "Pricing mentor from the mentor network.",
        },
        {
          why: "The raise narrative is a feature list, not a wedge.",
          what: "Rebuild the deck around the vertical wedge and expansion path.",
          how: "Two narrative workshops + a redlined deck before Day 30.",
          who: "Founders Drive fundraising reviewer.",
        },
      ],
      matchedExperts: ["[PSP operator]", "[Pricing mentor]", "[Series A founder]"],
      targetDates: "Day 7 plan locked; Day 30/60/90 reviews scheduled.",
    });

    for (const p of [
      { milestoneDay: 7, title: "Final Action Plan locked", status: "Implemented", evidence: "Signed plan shared with panel." },
      { milestoneDay: 30, title: "ICP narrowed to mid-market fintech; 20-account pilot launched", status: "Implemented", evidence: "Pilot tracker: 20 accounts, 6 in procurement." },
      { milestoneDay: 60, title: "Value-based pricing live", status: "Testing", evidence: "New pricing on 40% of new deals." },
      { milestoneDay: 90, title: "Reality Check 2 + case study", status: "Partially Implemented", evidence: "Sales cycle down to 41 days avg; case study in draft." },
    ]) {
      await ctx.db.insert("actionPlans", {
        startupId: startupIds["BayarPulse"],
        ...p,
        updatedAt: now,
      });
    }

    // ---- Perks ----
    const perks = [
      { partner: "AWS Activate", title: "Up to USD 25,000 in cloud credits", category: "Cloud", valueAmount: "USD 25,000", description: "Credits, support and architecture reviews for early-stage Founders Drive startups." },
      { partner: "[Legal partner]", title: "Incorporation + founder agreements package", category: "Legal", valueAmount: "RM 4,000", description: "Fixed-fee company setup, cap-table and standard founder/employee agreements." },
      { partner: "[Accounting partner]", title: "6 months of bookkeeping + SST filing", category: "Accounting", valueAmount: "RM 3,600", description: "Monthly management accounts and statutory filing for pre-Series-A teams." },
      { partner: "[Recruitment partner]", title: "Discounted first two engineering hires", category: "Recruitment", valueAmount: "50% placement fee", description: "SEA tech recruitment desk with a Founders Drive rate." },
      { partner: "[Bank partner]", title: "Fast-tracked startup business account", category: "Banking", valueAmount: "Fee waiver", description: "Priority onboarding and waived monthly fees for the first year." },
      { partner: "HubSpot for Startups", title: "Up to 75% off first year", category: "Marketing", valueAmount: "75% off", description: "CRM and marketing suite at startup pricing." },
    ];
    for (const p of perks) await ctx.db.insert("founderPerks", p);

    // ---- Industry contributors (agencies, ministries, programme-running VCs) ----
    const contribSeed = [
      { name: "Malaysia Digital Economy Corporation", shortName: "MDEC", type: "Government agency", website: "https://mdec.my", focusAreas: ["Digital economy", "Tech exports", "Talent"], description: "The lead agency for Malaysia's digital economy — grants, the Malaysia Digital status, and acceleration programmes." },
      { name: "Cradle Fund", shortName: "Cradle", type: "Government agency", website: "https://cradle.com.my", focusAreas: ["Pre-seed", "Seed", "Commercialisation"], description: "Government-linked early-stage funding agency running the CIP grant series and direct equity (DEQ)." },
      { name: "Malaysian Research Accelerator for Technology and Innovation", shortName: "MRANTI", type: "Government agency", website: "https://mranti.my", focusAreas: ["Deep tech", "Commercialisation", "Agritech", "Healthtech"], description: "National R&D commercialisation agency — park, testbeds, and technology acceleration." },
      { name: "Ministry of Science, Technology and Innovation", shortName: "MOSTI", type: "Ministry", website: "https://www.mosti.gov.my", focusAreas: ["Science & technology", "Innovation policy", "Deep tech"], description: "Federal ministry funding technology development through TDF and related instruments." },
      { name: "PETRONAS", shortName: "PETRONAS", type: "Corporate", website: "https://www.petronas.com", focusAreas: ["Energy transition", "Industrial tech", "Climate"], description: "National energy company running FutureTech, an accelerator for energy and industrial startups." },
      { name: "1337 Ventures", shortName: "1337", type: "VC / accelerator", website: "https://1337.ventures", focusAreas: ["Pre-seed", "GTM", "Sector agnostic"], description: "Pre-seed fund and accelerator; runs the Alpha Startups pre-accelerator across the region." },
      { name: "Gobi Partners", shortName: "Gobi", type: "VC / accelerator", website: "https://gobi.vc", focusAreas: ["Seed", "Series A", "Islamic economy"], description: "Pan-Asian VC; runs the Taqwatech and Dana Impact cohorts alongside its funds." },
      { name: "Sunway iLabs", shortName: "Sunway iLabs", type: "University", website: "https://sunway-innovation-labs.com", focusAreas: ["Healthtech", "Edtech", "Smart cities"], description: "Sunway Group's innovation arm — the Super Accelerator and a seed fund." },
    ];
    const contribIds: Record<string, any> = {};
    for (const c of contribSeed) {
      const slug = c.shortName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      // link Cradle / 1337 / Gobi to their investor rows if present
      const inv = (await ctx.db.query("investors").collect()).find((x: any) =>
        x.fundName.toLowerCase().includes(c.shortName.toLowerCase()) ||
        x.fundName.toLowerCase().includes(c.name.toLowerCase().split(" ")[0]),
      );
      contribIds[c.shortName] = await ctx.db.insert("contributors", {
        ...c,
        slug,
        investorId: inv?._id,
        reviewStatus: "approved",
        createdAt: now,
      });
    }

    // ---- Programmes: cohorts + grants ----
    const programmeSeed = [
      { c: "MDEC", name: "MD Startup Grant", kind: "Grant", fundingAmount: "Up to RM 50,000", equity: "Equity-free", summary: "Early-stage grant for Malaysia Digital status companies to build and validate.", stageFocus: ["Idea stage", "Pre-Seed"], sectorFocus: [], cadence: "Rolling", lifecycle: "Open" },
      { c: "MDEC", name: "Global Acceleration & Innovation Network (GAIN)", kind: "Accelerator / cohort", fundingAmount: "Soft-landing support", equity: "Equity-free", summary: "Market-access programme helping growth-stage Malaysian tech firms expand abroad.", stageFocus: ["Seed", "Series A"], sectorFocus: [], cadence: "Annual", lifecycle: "Ongoing" },
      { c: "Cradle", name: "CIP Spark", kind: "Grant", fundingAmount: "Up to RM 150,000", equity: "Equity-free", summary: "Conditional grant for pre-seed founders to get from prototype to first customers.", stageFocus: ["Pre-Seed"], sectorFocus: [], cadence: "Twice a year", lifecycle: "Open" },
      { c: "Cradle", name: "CIP Sprint", kind: "Grant", fundingAmount: "Up to RM 600,000", equity: "Equity-free", summary: "Larger conditional grant for startups with early traction and a path to raising.", stageFocus: ["Pre-Seed", "Seed"], sectorFocus: [], cadence: "Twice a year", lifecycle: "Open" },
      { c: "Cradle", name: "DEQ (Direct Equity)", kind: "Grant", fundingAmount: "RM 500k – RM 4M", equity: "Up to 20%", summary: "Direct equity co-investment alongside qualified lead investors.", stageFocus: ["Seed", "Series A"], sectorFocus: [], cadence: "Rolling", lifecycle: "Open" },
      { c: "MRANTI", name: "MRANTI Technology Commercialisation Programme", kind: "Accelerator / cohort", fundingAmount: "Up to RM 500,000", equity: "Equity-free", summary: "Structured commercialisation support for research-based ventures — testbeds, mentoring, market pilots.", stageFocus: ["Pre-Seed", "Seed"], sectorFocus: ["Agritech / Deep Tech", "Healthtech / AI", "Climate / Energy"], cadence: "Annual", lifecycle: "Upcoming" },
      { c: "MOSTI", name: "Technology Development Fund 1 (TDF1)", kind: "Grant", fundingAmount: "Up to RM 500,000", equity: "Equity-free", summary: "Grant for pre-commercialisation technology development and prototyping.", stageFocus: ["Idea stage", "Pre-Seed"], sectorFocus: [], cadence: "Rolling", lifecycle: "Open" },
      { c: "PETRONAS", name: "FutureTech Accelerator", kind: "Accelerator / cohort", fundingAmount: "Pilot funding + PoC", equity: "Equity-free", summary: "12-week accelerator pairing energy and industrial startups with PETRONAS business units for paid pilots.", stageFocus: ["Seed", "Series A"], sectorFocus: ["Climate / Energy", "Deep tech / Robotics"], cadence: "Annual", lifecycle: "Closed" },
      { c: "1337", name: "Alpha Startups Pre-Accelerator", kind: "Accelerator / cohort", fundingAmount: "Up to RM 25,000", equity: "Up to 4%", summary: "One-week intensive then a build sprint; demo day to angels and pre-seed funds.", stageFocus: ["Idea stage", "Pre-Seed"], sectorFocus: [], cadence: "Quarterly", lifecycle: "Open" },
      { c: "Gobi", name: "Taqwatech Cohort", kind: "Accelerator / cohort", fundingAmount: "Up to USD 100,000", equity: "Negotiated", summary: "Cohort for startups serving the Islamic economy — halal, modest fashion, Islamic finance, pilgrimage.", stageFocus: ["Pre-Seed", "Seed"], sectorFocus: ["Fintech", "Consumer / D2C"], cadence: "Annual", lifecycle: "Ongoing" },
      { c: "Sunway iLabs", name: "Super Accelerator", kind: "Accelerator / cohort", fundingAmount: "Up to RM 200,000", equity: "Up to 8%", summary: "15-week accelerator with access to the Sunway ecosystem as a first customer.", stageFocus: ["Pre-Seed", "Seed"], sectorFocus: ["Healthtech / AI", "Marketplace / Logistics"], cadence: "Twice a year", lifecycle: "Open" },
    ];
    const progIds: Record<string, any> = {};
    for (const p of programmeSeed) {
      const slug = `${p.c}-${p.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      progIds[p.name] = await ctx.db.insert("programmes", {
        contributorId: contribIds[p.c],
        name: p.name,
        slug,
        kind: p.kind,
        summary: p.summary,
        fundingAmount: p.fundingAmount,
        equity: p.equity,
        stageFocus: p.stageFocus,
        sectorFocus: p.sectorFocus,
        cadence: p.cadence,
        lifecycle: p.lifecycle,
        reviewStatus: "approved",
        createdAt: now,
      });
    }

    // ---- Startup <-> programme tags ----
    const tagSeed: [string, string, string, number, string, boolean][] = [
      ["Aerocrop", "CIP Sprint", "2025 cycle", 2025, "Awarded RM 480k", true],
      ["Aerocrop", "MRANTI Technology Commercialisation Programme", "Cohort 3", 2024, "Graduated; 2 estate pilots", true],
      ["BayarPulse", "Alpha Startups Pre-Accelerator", "Batch 41", 2023, "Top 3 at demo day", true],
      ["BayarPulse", "MD Startup Grant", "—", 2023, "RM 50k", false],
      ["Kelas Kita", "Sunway iLabs Super Accelerator", "Batch 8", 2024, "Sunway campuses as first customer", true],
      ["SupplyJaga", "CIP Spark", "2025 cycle", 2025, "Awarded RM 140k", true],
      ["Tanya AI", "Alpha Startups Pre-Accelerator", "Batch 45", 2025, "Graduated", false],
      ["MedFlow", "Taqwatech Cohort", "2024", 2024, "Regional expansion track", false],
    ];
    for (const [startup, programme, cohortLabel, year, outcome, verified] of tagSeed) {
      const pid = progIds[programme] ?? progIds[programme.replace("Gobi ", "")];
      if (!startupIds[startup] || !pid) continue;
      await ctx.db.insert("startupProgrammes", {
        startupId: startupIds[startup],
        programmeId: pid,
        cohortLabel: cohortLabel === "—" ? undefined : cohortLabel,
        year,
        outcome,
        verified,
        createdAt: now,
      });
    }

    // ---- Anonymous programme feedback ----
    const fbSeed: [string, string, number, number, number, number, boolean, string][] = [
      ["Aerocrop", "CIP Sprint", 4, 3, 5, 3, true, "The money was real and equity-free. Reporting was heavy and disbursement slower than planned — budget 3 months of runway around it."],
      ["SupplyJaga", "CIP Spark", 5, 4, 5, 4, true, "Exactly the right cheque size for pre-seed. Mentor matching was better than expected."],
      ["BayarPulse", "Alpha Startups Pre-Accelerator", 4, 5, 2, 4, true, "Great for forcing focus and a first network. Don't expect funding from the programme itself."],
      ["Kelas Kita", "Sunway iLabs Super Accelerator", 4, 4, 4, 5, true, "Access to Sunway as a paying customer was the whole value. The 8% equity is steep — go in with a plan to use the distribution."],
      ["Tanya AI", "Alpha Startups Pre-Accelerator", 3, 3, 3, 3, false, "Useful week, but the follow-through after demo day was thin for teams that didn't place."],
    ];
    for (const [startup, programme, overall, mentorship, funding, network, rec, comment] of fbSeed) {
      const pid = progIds[programme];
      if (!startupIds[startup] || !pid) continue;
      await ctx.db.insert("programmeFeedback", {
        programmeId: pid,
        startupId: startupIds[startup],
        ratingOverall: overall,
        ratingMentorship: mentorship,
        ratingFunding: funding,
        ratingNetwork: network,
        wouldRecommend: rec,
        comment,
        createdAt: now,
        updatedAt: now,
      });
    }

    // ---- Ecosystem news + events ----
    const newsSeed = [
      { title: "Malaysian fintech funding held steady in 2025 despite the regional slowdown", source: "The Edge Malaysia", summary: "Local seed rounds stayed resilient, led by payments and SME lending.", tags: ["Fintech", "Funding"] },
      { title: "MRANTI opens applications for its 2026 commercialisation cohort", source: "MRANTI", summary: "Up to RM 500k in support for research-based ventures in agritech, healthtech and climate.", tags: ["Grants", "Deep tech"] },
      { title: "KL climbs regional rankings as a base for early-stage SEA founders", source: "Tech in Asia", summary: "Lower burn, a deep talent pool and government co-investment cited as the draw.", tags: ["Ecosystem"] },
    ];
    for (const n of newsSeed)
      await ctx.db.insert("newsPosts", {
        ...n,
        authorType: "admin",
        authorName: "Founders Drive",
        status: "published",
        createdAt: now - Math.random() * 1e9,
      });

    const eventSeed = [
      { title: "KL Fintech Week 2026", date: "18–19 Mar 2026", location: "KLCC", description: "Two days of policy, partnerships and a startup showcase.", tags: ["Fintech"], isSponsored: true },
      { title: "MRANTI Founders Friday", date: "Fri 6 Feb 2026", location: "MRANTI Park, Bukit Jalil", description: "Monthly open house for deep-tech founders and researchers." },
      { title: "Cradle x Angels: pre-seed pitch night", date: "27 Feb 2026", location: "Common Ground, KL Eco City", description: "Ten pre-seed teams pitch to Cradle and MBAN angels.", isSponsored: true },
    ];
    for (const e of eventSeed)
      await ctx.db.insert("ecosystemEvents", {
        ...e,
        authorType: "admin",
        authorName: "Founders Drive",
        status: "published",
        createdAt: now - Math.random() * 1e9,
      });

    return {
      startups: startupSeed.length,
      investors: investors.length,
      polls: pollDefs.length,
      perks: perks.length,
      contributors: contribSeed.length,
      programmes: programmeSeed.length,
      news: newsSeed.length,
      events: eventSeed.length,
    };
  },
});

function gen(
  n: number,
  cRange: [number, number],
  iRange: [number, number],
  nRange: [number, number],
): [number, number, number][] {
  const pick = ([lo, hi]: [number, number]) =>
    Math.max(1, Math.min(10, lo + Math.floor(Math.random() * (hi - lo + 1))));
  return Array.from({ length: n }, () => [pick(cRange), pick(iRange), pick(nRange)]);
}
