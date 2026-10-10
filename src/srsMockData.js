// Demo-only records for the SRS-specific workspace modules.
// Replace imports from this file with API adapters when backend endpoints land.
export const knowledgeBaseSeed = {
  brand: {
    name: 'Northstar Talent',
    website: 'https://northstartalent.example',
    tagline: 'Careers with a human point of view.',
    industry: 'Recruitment',
    location: 'Amsterdam, Netherlands',
    description: 'A people-first recruitment partner for ambitious product and technology teams.',
    story: 'Northstar started inside a product studio that was tired of transactional hiring. The team still sits with clients through the search, not just at the handoff.',
    mission: 'Help ambitious teams hire people who will still be proud of the work a year later.',
  },
  audience: {
    primary: 'Product, design, engineering, and go-to-market professionals across Europe.',
    secondary: 'Founders and talent leads at product companies with 20–200 people.',
    pains: 'Slow shortlists, vague role briefs, and candidates who disappear after the first call.',
    markets: 'Netherlands, United Kingdom, and remote EU',
  },
  voice: {
    tone: 'Clear, optimistic, and human',
    personality: 'Warm, precise, confident',
    languages: 'English, Dutch',
    sample: 'The right role should feel obvious once you see the work, the team, and the pace. We write it that way.',
  },
  offerings: [
    { id: 'service-1', name: 'Embedded recruitment', detail: 'Flexible talent support that operates as part of the client team.', who: 'Growing product teams' },
    { id: 'service-2', name: 'Executive search', detail: 'Focused search for senior technology and product leadership.', who: 'Founders hiring their first leadership layer' },
  ],
  messaging: {
    pillars: 'Human expertise, transparent process, ambitious careers',
    proof: '92% probation pass rate · 21-day average time to shortlist',
    required: 'Equal-opportunity language',
    restricted: 'Guaranteed placement, perfect candidate, rockstar',
    differentiator: 'Recruiters who have shipped product, not only filled seats.',
    cta: 'See open roles',
  },
  visual: {
    colors: ['#1E1B18', '#3E92CC', '#FFFAFF'],
    imageStyle: 'Editorial photography, natural light, real teams at work',
    typeStyle: 'Clean sans serif, generous space, short headlines',
  },
  posting: {
    platforms: ['Instagram', 'Facebook'],
    frequency: '4 posts per week',
    timezone: 'Europe/Amsterdam',
    bestTimes: 'Tuesday to Thursday, 5–7 PM',
    hashtags: '#northstar #hiring #productteams',
    mix: 'Team stories, role highlights, and practical hiring advice',
    autoPublish: true,
  },
  metaRules: {
    dailyBudget: 45,
    duration: 21,
    reviewMode: true,
    category: 'Employment',
    leadForm: 'Higher intent',
    optimize: true,
    countries: 'Netherlands, United Kingdom',
    objective: 'Lead generation',
  },
}

export const vacancySeed = [
  { id: 'vac-104', title: 'Senior Product Designer', location: 'Amsterdam · Hybrid', department: 'Design', type: 'Full-time', status: 'campaign live', campaign: 'Senior Product Designer · NL', applicants: 48, cpl: 8.42, updated: '18 min ago' },
  { id: 'vac-103', title: 'Growth Marketing Lead', location: 'London · Hybrid', department: 'Marketing', type: 'Full-time', status: 'in review', campaign: 'Draft ready for approval', applicants: 0, cpl: 0, updated: '2 hours ago' },
  { id: 'vac-102', title: 'Frontend Engineer', location: 'Remote · EU', department: 'Engineering', type: 'Contract', status: 'completed', campaign: 'Frontend Engineer · EU', applicants: 126, cpl: 6.91, updated: 'Sep 28' },
]

export const reportingSeed = [
  { id: 'vac-104', vacancy: 'Senior Product Designer', campaign: 'Senior Product Designer · NL', status: 'Active', spend: 404.16, impressions: 28410, clicks: 1242, ctr: 4.37, cpc: 0.33, leads: 48, cpl: 8.42 },
  { id: 'vac-102', vacancy: 'Frontend Engineer', campaign: 'Frontend Engineer · EU', status: 'Completed', spend: 870.66, impressions: 63190, clicks: 2864, ctr: 4.53, cpc: 0.3, leads: 126, cpl: 6.91 },
  { id: 'vac-101', vacancy: 'Customer Success Manager', campaign: 'Customer Success · UK', status: 'Paused', spend: 326.8, impressions: 22420, clicks: 716, ctr: 3.19, cpc: 0.46, leads: 34, cpl: 9.61 },
]
