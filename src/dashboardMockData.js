// Central demo-data boundary for the authenticated workspace.
// Replace this module with API adapters when backend endpoints are ready; the UI
// intentionally does not embed placeholder records in its components.

export const connectedChannels = [
  { id: 'instagram', name: 'Instagram', handle: '@marketeer.studio', connected: true, color: 'pink', detail: 'Posts, stories and reels via Meta' },
  { id: 'facebook', name: 'Facebook', handle: 'Marketeer Studio', connected: true, color: 'blue', detail: 'Page, feed and reels via Meta' },
]

export const metaConnection = {
  connected: true,
  userName: 'Alex Morgan',
  businessName: 'Marketeer Studio',
  connectedAt: 'Sep 12, 2026',
  expiresAt: 'Nov 11, 2026',
  leadDelivery: true,
  account: { id: 'act_240983120', name: 'Marketeer Growth', currency: 'USD', status: 'Ready for ads' },
  page: { id: 'page_83413', name: 'Marketeer Studio' },
}

export const contentVariants = [
  { id: 'variant-1', angle: 'Energy in motion', theme: 'MOVE / WITH PURPOSE', caption: 'The best ideas rarely arrive while standing still. Here is your reminder to make the first move, learn in public, and build momentum one brave step at a time.', hashtags: ['BuildInPublic', 'CreativeMomentum', 'Marketeer'], palette: 'lime' },
  { id: 'variant-2', angle: 'Quiet confidence', theme: 'LESS / BUT BETTER', caption: 'Less noise. More intention. We are building campaigns that feel considered, human, and impossible to scroll past.', hashtags: ['BrandDesign', 'MarketingIdeas', 'MadeWithMarketeer'], palette: 'blue' },
  { id: 'variant-3', angle: 'Behind the work', theme: 'IDEAS / IN PROGRESS', caption: 'A small look behind the curtain: rough ideas, honest iteration, and the tiny decisions that turn a first draft into work worth sharing.', hashtags: ['BehindTheScenes', 'CreativeProcess', 'SocialContent'], palette: 'orange' },
]

export const contentRecords = [
  { id: 1, title: 'Friday founder note', caption: 'Three lessons from a week of building in public.', status: 'scheduled', format: 'Post', platforms: ['Instagram', 'Facebook'], date: '2026-09-28', time: '6:00 PM', palette: 'pink', source: 'AI', image: '/social-posts/post-atelier.jpg' },
  { id: 2, title: 'Move with purpose', caption: 'The best ideas rarely arrive while standing still.', status: 'published', format: 'Reel', platforms: ['Instagram', 'Facebook'], date: '2026-09-24', time: '12:30 PM', palette: 'lime', source: 'AI', image: '/social-posts/post-purpose.jpg' },
  { id: 3, title: 'Behind the blend', caption: 'What goes into a better morning, from bean to first sip.', status: 'scheduled', format: 'Reel', platforms: ['Instagram'], date: '2026-09-30', time: '8:30 PM', palette: 'orange', source: 'AI', image: '/social-posts/post-table.jpg' },
  { id: 4, title: 'Autumn product edit', caption: 'The pieces we keep reaching for as the weather turns.', status: 'draft', format: 'Carousel', platforms: ['Instagram', 'Facebook'], date: null, time: null, palette: 'blue', source: 'Manual' },
  { id: 5, title: 'Customer spotlight', caption: 'Meet the team who turned one clear idea into a growing community.', status: 'published', format: 'Post', platforms: ['Facebook', 'Instagram'], date: '2026-09-21', time: '10:00 AM', palette: 'violet', source: 'AI', image: '/social-posts/post-spotlight.jpg' },
  { id: 6, title: 'Weekend offer', caption: 'A little something for the people who have been with us since day one.', status: 'failed', format: 'Story', platforms: ['Instagram'], date: '2026-09-20', time: '5:30 PM', palette: 'red', source: 'Manual', image: '/social-posts/post-offer.jpg' },
]

export const calendarContent = [
  ...contentRecords.filter((item) => item.date),
  { id: 7, title: 'Quick tip carousel', status: 'scheduled', format: 'Carousel', platforms: ['Instagram'], date: '2026-10-02', time: '11:00 AM', palette: 'blue', image: '/social-posts/post-form.jpg' },
  { id: 8, title: 'Monthly recap', status: 'scheduled', format: 'Post', platforms: ['Facebook'], date: '2026-10-05', time: '9:00 AM', palette: 'violet', image: '/social-posts/post-lumen.jpg' },
]

export const campaigns = [
  { id: 'cmp-1048', name: 'Senior Product Designer', objective: 'Applications', status: 'active', delivery: 'Healthy', spend: 404.16, impressions: 28410, clicks: 1242, leads: 48, cpl: 8.42, ctr: 4.37, budget: 45, updated: '18 min ago', palette: 'lime', image: '/social-posts/post-form.jpg', start: '2026-09-08', end: '2026-10-09' },
  { id: 'cmp-1047', name: 'Growth Marketing Lead', objective: 'Applications', status: 'learning', delivery: 'Learning', spend: 298.1, impressions: 20104, clicks: 742, leads: 31, cpl: 9.62, ctr: 3.69, budget: 38, updated: '1 hr ago', palette: 'orange', image: '/social-posts/post-maison.jpg', start: '2026-09-15', end: '2026-10-04' },
  { id: 'cmp-1039', name: 'Frontend Engineer EU', objective: 'Applications', status: 'active', delivery: 'Healthy', spend: 870.66, impressions: 63190, clicks: 2864, leads: 126, cpl: 6.91, ctr: 4.53, budget: 50, updated: '3 hrs ago', palette: 'blue', image: '/social-posts/post-coast.jpg', start: '2026-09-01', end: '2026-09-30' },
  { id: 'cmp-1028', name: 'Customer Success UK', objective: 'Applications', status: 'paused', delivery: 'Paused', spend: 326.8, impressions: 22420, clicks: 716, leads: 34, cpl: 9.61, ctr: 3.19, budget: 30, updated: 'Yesterday', palette: 'pink' },
  { id: 'cmp-1012', name: 'Engineering Manager', objective: 'Applications', status: 'completed', delivery: 'Completed', spend: 684.7, impressions: 49311, clicks: 1392, leads: 72, cpl: 9.51, ctr: 2.82, budget: 35, updated: 'Sep 18', palette: 'violet' },
]

export const leadRecords = [
  { id: 'lead-301', name: 'Maya Thompson', email: 'maya@example.com', phone: '+31 6 555 0139', campaign: 'Senior Product Designer', status: 'new', received: '12 min ago', source: 'Instagram Feed', timeline: 'Available in 30 days', avatar: '/reference/avatar-victoria.webp' },
  { id: 'lead-300', name: 'Noah Williams', email: 'noah@example.com', phone: '+44 20 555 0192', campaign: 'Senior Product Designer', status: 'contacted', received: '48 min ago', source: 'Facebook Feed', timeline: 'Available now', avatar: '/reference/avatar-thomas.webp' },
  { id: 'lead-299', name: 'Sophia Garcia', email: 'sophia@example.com', phone: '+31 6 555 0108', campaign: 'Growth Marketing Lead', status: 'qualified', received: '2 hrs ago', source: 'Instagram Story', timeline: 'Available in 60 days', avatar: '/reference/avatar-shelby.webp' },
  { id: 'lead-298', name: 'Ethan Chen', email: 'ethan@example.com', phone: '+49 30 555 0171', campaign: 'Frontend Engineer EU', status: 'new', received: '4 hrs ago', source: 'Facebook Feed', timeline: 'Available now' },
  { id: 'lead-297', name: 'Olivia Brown', email: 'olivia@example.com', phone: '+44 20 555 0156', campaign: 'Customer Success UK', status: 'closed', received: 'Yesterday', source: 'Instagram Feed', timeline: 'Available in 30 days' },
  { id: 'lead-296', name: 'Liam Davis', email: 'liam@example.com', phone: '+31 6 555 0114', campaign: 'Engineering Manager', status: 'qualified', received: 'Yesterday', source: 'Facebook Feed', timeline: 'Available in 60 days' },
]

export const adCopyVariants = [
  { id: 'copy-1', angle: 'Impact-led', headline: 'Design work that shapes how people work', primary: 'Join a product team where research, systems thinking, and craft carry equal weight. We are hiring a Senior Product Designer in Amsterdam.', cta: 'APPLY_NOW', selected: true },
  { id: 'copy-2', angle: 'Team & culture', headline: 'Your next product team is waiting', primary: 'Do your best work with kind, ambitious people, meaningful ownership, and a flexible hybrid rhythm. Explore the Senior Product Designer role.', cta: 'LEARN_MORE', selected: true },
  { id: 'copy-3', angle: 'Challenge-led', headline: 'Ready to make complex work feel simple?', primary: 'Help turn ambitious workflows into clear, human product experiences. Bring your perspective, your process, and your portfolio.', cta: 'APPLY_NOW', selected: false },
]

export const adCreativeVariants = [
  { id: 'creative-1', name: 'Meaningful work', kind: 'AI styled', palette: 'lime', selected: true, theme: 'MAKE / WORK MATTER' },
  { id: 'creative-2', name: 'Studio culture', kind: 'Brand asset', palette: 'blue', selected: true, theme: 'DESIGN / WITH IMPACT' },
  { id: 'creative-3', name: 'Amsterdam team', kind: 'AI styled', palette: 'orange', selected: false, theme: 'YOUR / NEXT MOVE' },
]

export const optimizationRecommendations = [
  { id: 'opt-1', type: 'budget', title: 'Scale Summer Movement by 12%', body: 'Cost per lead is 18% below target with stable delivery over the last seven days.', impact: '+19–27 leads', confidence: 'High', selected: true },
  { id: 'opt-2', type: 'pause', title: 'Pause underperforming Story ad', body: 'This creative spent $84 with a cost per lead 2.4× above the ad set average.', impact: 'Save ~$126/mo', confidence: 'High', selected: true },
  { id: 'opt-3', type: 'creative', title: 'Refresh Cold Brew creative', body: 'Frequency reached 3.8 and click-through rate declined for five consecutive days.', impact: 'Reduce fatigue', confidence: 'Medium', selected: false },
  { id: 'opt-4', type: 'audience', title: 'Broaden the Fall Edit audience', body: 'The current audience is nearing saturation while adjacent interests show lower CPM.', impact: 'Reach +41K', confidence: 'Medium', selected: false },
]

export const optimizationHistory = [
  { id: 1, action: 'Budget increased 10%', target: 'Summer Movement', by: 'Marketeer automation', date: 'Sep 25, 2:10 AM', undone: false },
  { id: 2, action: 'Ad paused', target: 'Cold Brew · Story 02', by: 'Alex Morgan', date: 'Sep 23, 4:42 PM', undone: false },
  { id: 3, action: 'Placement removed', target: 'The Fall Edit · Audience 01', by: 'Marketeer automation', date: 'Sep 22, 2:10 AM', undone: true },
]

export const assetLibrary = [
  { id: 'asset-1', name: 'Movement study', folder: 'Summer launch', kind: 'Generated', palette: 'lime', theme: 'MOVE / WITH PURPOSE' },
  { id: 'asset-2', name: 'Light by design', folder: 'Summer launch', kind: 'Generated', palette: 'blue', theme: 'LIGHT / BY DESIGN' },
  { id: 'asset-3', name: 'Morning ritual', folder: 'Cold brew', kind: 'Uploaded', palette: 'orange', theme: 'START / FRESH' },
  { id: 'asset-4', name: 'Daily dew', folder: 'Skincare', kind: 'Generated', palette: 'pink', theme: 'GOOD / SKIN DAYS' },
  { id: 'asset-5', name: 'Autumn objects', folder: 'Fall edit', kind: 'Generated', palette: 'violet', theme: 'LESS / BUT BETTER' },
  { id: 'asset-6', name: 'Founder portrait', folder: 'Brand', kind: 'Uploaded', palette: 'mono', theme: 'BUILD / IN PUBLIC' },
]

export const campaignTemplates = [
  { id: 'template-1', name: 'Local role launch', description: 'Employment-safe local audience, qualifying lead form, and two proof-led role angles.', uses: 7, copies: 3, images: 2, budget: 35 },
  { id: 'template-2', name: 'Hard-to-hire sprint', description: 'Twenty-one-day recruitment plan with three creative angles and weekly review.', uses: 4, copies: 4, images: 3, budget: 50 },
  { id: 'template-3', name: 'High-volume hiring', description: 'Candidate-first campaign with availability and eligibility questions.', uses: 11, copies: 2, images: 2, budget: 30 },
]

export const overviewMetrics = [
  { label: 'Ad spend', value: '$2,840', delta: '+12.4%', icon: 'wallet', tone: 'lime', series: [42, 46, 44, 51, 49, 58, 55, 63, 68, 74, 71, 82] },
  { label: 'Impressions', value: '184.2K', delta: '+18.2%', icon: 'eye', tone: 'blue', series: [28, 34, 31, 40, 48, 45, 57, 62, 70, 66, 81, 94] },
  { label: 'New leads', value: '327', delta: '+24.1%', icon: 'users', tone: 'pink', series: [22, 26, 24, 30, 36, 33, 41, 52, 49, 61, 74, 88] },
  { label: 'Content published', value: '42', delta: '+8 this month', icon: 'send', tone: 'orange', series: [30, 34, 38, 36, 44, 48, 46, 52, 58, 55, 64, 70] },
]

const clone = (value) => JSON.parse(JSON.stringify(value))
const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

// Async method signatures mirror the eventual network layer.
export const dashboardMockService = {
  async generateContent() { await delay(1450); return clone(contentVariants) },
  async rewriteCaption(caption, tone) { await delay(650); return `${caption.replace(/[.!]?$/, '')}. Written with a ${tone.toLowerCase()} point of view.` },
  async createCampaignPlan() { await delay(1800); return { name: 'Senior Product Designer · Recruitment Campaign', copies: clone(adCopyVariants), creatives: clone(adCreativeVariants) } },
  async launchCampaign() { await delay(1600); return { campaignId: '120209884132', adSetId: '120209884177', leadFormId: '8042199302', ads: 4 } },
  async applyOptimizations(ids) { await delay(700); return { applied: ids } },
  async save() { await delay(350); return { ok: true } },
}
