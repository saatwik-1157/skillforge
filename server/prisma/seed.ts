/**
 * SkillForge — Prisma seed script.
 *
 * Idempotent / re-runnable: every entity is upserted on a deterministic unique
 * key (slug / name / key / email) so running `npm run seed` repeatedly leaves
 * the database in the same state. Join rows and nested collections are cleared
 * and re-created per business/roadmap/resource so ordering stays deterministic.
 *
 * Run with:  npm run seed   (tsx prisma/seed.ts)
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** kebab-case slug from an arbitrary label. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---------------------------------------------------------------------------
// Static seed data
// ---------------------------------------------------------------------------

const SKILL_NAMES = [
  'Cooking',
  'Baking',
  'Photography',
  'Tailoring',
  'Graphic Design',
  'Digital Marketing',
  'Teaching',
  'Mobile Repair',
  'Agriculture',
  'Jewelry Making',
  'Wood Work',
  'Painting',
  'Fashion Designing',
  'Programming',
  'Handicrafts',
  'Music',
  'Fitness Training',
  'Content Creation',
  'Beauty Services',
];

const INTEREST_NAMES = [
  'Food & Beverage',
  'Arts & Crafts',
  'Technology',
  'Fashion',
  'Health & Wellness',
  'Education',
  'Home Business',
  'Sustainability',
  'Retail & Sales',
  'Media & Content',
];

const CATEGORY_DATA = [
  { name: 'Food', description: 'Cooking, catering, baking and food product businesses.', icon: '🍲' },
  { name: 'Retail', description: 'Selling physical products online or offline.', icon: '🛍️' },
  { name: 'Services', description: 'Skill-based services delivered to customers.', icon: '🔧' },
  { name: 'Creative', description: 'Design, art, crafts and creative studios.', icon: '🎨' },
  { name: 'Tech', description: 'Software, apps, freelancing and digital work.', icon: '💻' },
  { name: 'Education', description: 'Teaching, tutoring and coaching businesses.', icon: '📚' },
  { name: 'Agriculture', description: 'Farming, organic produce and agri-business.', icon: '🌾' },
  { name: 'Beauty', description: 'Salon, cosmetics and personal-care services.', icon: '💄' },
];

const ACHIEVEMENT_DATA = [
  {
    key: 'FIRST_COURSE_COMPLETED',
    title: 'First Course Completed',
    description: 'Completed your first learning resource end to end.',
    icon: '🎓',
    points: 20,
  },
  {
    key: 'FIRST_ROADMAP_COMPLETED',
    title: 'First Roadmap Completed',
    description: 'Finished every step of a business roadmap.',
    icon: '🗺️',
    points: 50,
  },
  {
    key: 'PROFILE_100',
    title: 'Profile Perfectionist',
    description: 'Filled out your profile to 100% completion.',
    icon: '✅',
    points: 15,
  },
  {
    key: 'FIRST_MENTOR_SESSION',
    title: 'First Mentor Session',
    description: 'Completed your first session with a mentor.',
    icon: '🤝',
    points: 25,
  },
  {
    key: 'FIRST_BUSINESS_PLAN',
    title: 'First Business Plan',
    description: 'Created your first structured business plan.',
    icon: '📈',
    points: 30,
  },
  {
    key: 'MILESTONE_10K',
    title: '₹10,000 Milestone',
    description: 'Reached your first ₹10,000 in business revenue.',
    icon: '💰',
    points: 100,
  },
];

const DEMO_PASSWORD = 'Password123';

// The 14 canonical roadmap steps, in order.
const ROADMAP_STEP_TEMPLATE: { title: string; description: string }[] = [
  { title: 'Choose Business', description: 'Decide on the business idea you want to pursue.' },
  { title: 'Market Research', description: 'Study demand, competitors, and your target audience.' },
  { title: 'Validate Idea', description: 'Test the idea with a small group of potential customers.' },
  { title: 'Create Business Plan', description: 'Write a simple plan covering costs, pricing, and goals.' },
  { title: 'Purchase Equipment', description: 'Buy the tools and equipment required to start.' },
  { title: 'Business Registration', description: 'Register the business and obtain required licenses.' },
  { title: 'Brand Name', description: 'Pick a memorable brand name and check availability.' },
  { title: 'Logo', description: 'Design a simple, recognizable logo for your brand.' },
  { title: 'Packaging', description: 'Design product packaging or service presentation.' },
  { title: 'Pricing', description: 'Set competitive prices that keep you profitable.' },
  { title: 'Marketing', description: 'Launch marketing on social media and local channels.' },
  { title: 'First Customer', description: 'Win and delight your very first paying customer.' },
  { title: 'First 10000 Revenue', description: 'Reach your first ₹10,000 in total revenue.' },
  { title: 'Scale Business', description: 'Reinvest, expand offerings, and grow steadily.' },
];

// ---------------------------------------------------------------------------
// Business definitions (skill names are resolved to ids at seed time)
// ---------------------------------------------------------------------------

type BusinessSeed = {
  title: string;
  tagline: string;
  description: string;
  categoryName: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  businessType: 'HOME' | 'ONLINE' | 'OFFLINE' | 'HYBRID';
  minInvestment: number;
  maxInvestment: number;
  expectedProfit: string;
  estimatedTime: string;
  growthPotential: 'LOW' | 'MEDIUM' | 'HIGH';
  targetCustomers: string;
  toolsRequired: string[];
  marketDemand: string;
  requiredSkills: { name: string; weight: number }[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  investmentBreakdown: { item: string; amount: number }[];
  licenses: string[];
  registrations: string[];
  marketingStrategy: string;
  riskFactors: string[];
  revenueModel: string;
  checklist: { label: string; done: boolean }[];
  withRoadmap: boolean;
};

const BUSINESSES: BusinessSeed[] = [
  {
    title: 'Home Catering',
    tagline: 'Serve home-cooked meals to your neighbourhood.',
    description:
      'Prepare and deliver home-cooked meals, tiffins, and party orders from your own kitchen. A low-cost way to turn cooking skills into steady income by serving offices, students, and families nearby.',
    categoryName: 'Food',
    difficulty: 'BEGINNER',
    businessType: 'HOME',
    minInvestment: 10000,
    maxInvestment: 40000,
    expectedProfit: '₹15,000 – ₹40,000 / month',
    estimatedTime: '2-4 weeks to launch',
    growthPotential: 'HIGH',
    targetCustomers: 'Working professionals, students, small offices, and families near your locality who prefer fresh home-cooked food.',
    toolsRequired: ['Kitchen equipment', 'Tiffin boxes', 'Gas stove', 'Storage containers', 'Delivery bags'],
    marketDemand: 'Demand for hygienic, home-style meals is consistently high in urban and semi-urban areas.',
    requiredSkills: [
      { name: 'Cooking', weight: 5 },
      { name: 'Digital Marketing', weight: 2 },
    ],
    swot: {
      strengths: ['Low startup cost', 'Repeat daily customers', 'Home-based operation'],
      weaknesses: ['Time-intensive', 'Limited by kitchen capacity'],
      opportunities: ['Corporate tiffin contracts', 'Festival & party catering'],
      threats: ['Cloud kitchens', 'Food-safety regulations'],
    },
    investmentBreakdown: [
      { item: 'Kitchen upgrades', amount: 15000 },
      { item: 'Utensils & containers', amount: 8000 },
      { item: 'Initial raw material', amount: 7000 },
      { item: 'Marketing & packaging', amount: 5000 },
    ],
    licenses: ['FSSAI Basic Registration'],
    registrations: ['Shop & Establishment (optional)'],
    marketingStrategy: 'Start with WhatsApp groups and local Instagram pages, offer a free trial meal, and build word-of-mouth referrals.',
    riskFactors: ['Perishable inventory', 'Dependence on consistent quality'],
    revenueModel: 'Per-meal pricing, monthly tiffin subscriptions, and bulk party orders.',
    checklist: [
      { label: 'Get FSSAI registration', done: false },
      { label: 'Finalize weekly menu', done: false },
      { label: 'Set up delivery plan', done: false },
    ],
    withRoadmap: true,
  },
  {
    title: 'Cloud Kitchen',
    tagline: 'Delivery-only kitchen powered by food apps.',
    description:
      'Run a delivery-only restaurant that sells exclusively through platforms like Swiggy and Zomato. No dine-in space needed, so you save heavily on rent while reaching a large online audience.',
    categoryName: 'Food',
    difficulty: 'INTERMEDIATE',
    businessType: 'ONLINE',
    minInvestment: 80000,
    maxInvestment: 250000,
    expectedProfit: '₹40,000 – ₹1,20,000 / month',
    estimatedTime: '1-2 months to launch',
    growthPotential: 'HIGH',
    targetCustomers: 'Urban online food-delivery customers ordering lunch and dinner through aggregator apps.',
    toolsRequired: ['Commercial kitchen', 'Packaging materials', 'POS system', 'Refrigeration', 'Cooking range'],
    marketDemand: 'Online food delivery continues to grow rapidly across Indian cities.',
    requiredSkills: [
      { name: 'Cooking', weight: 5 },
      { name: 'Digital Marketing', weight: 3 },
    ],
    swot: {
      strengths: ['No dine-in overhead', 'Scalable menu', 'Data-driven demand'],
      weaknesses: ['High aggregator commissions', 'Setup cost'],
      opportunities: ['Multiple virtual brands', 'Subscription meal plans'],
      threats: ['Platform dependency', 'Intense competition'],
    },
    investmentBreakdown: [
      { item: 'Kitchen setup & equipment', amount: 120000 },
      { item: 'Licenses & deposits', amount: 30000 },
      { item: 'Packaging & branding', amount: 25000 },
      { item: 'Initial inventory', amount: 25000 },
    ],
    licenses: ['FSSAI State License', 'GST Registration'],
    registrations: ['Trade License', 'Fire Safety NOC'],
    marketingStrategy: 'Optimize listings on delivery apps, run in-app ads, and use combo offers to boost order value.',
    riskFactors: ['High platform commission', 'Rider availability'],
    revenueModel: 'Per-order revenue via aggregators plus direct-order discounts.',
    checklist: [
      { label: 'Secure kitchen space', done: false },
      { label: 'Onboard on delivery apps', done: false },
      { label: 'Design menu & pricing', done: false },
    ],
    withRoadmap: true,
  },
  {
    title: 'Pickle Business',
    tagline: 'Sell traditional homemade pickles at scale.',
    description:
      'Produce and sell traditional homemade pickles and condiments. A shelf-stable food product with strong repeat demand that can be sold locally and shipped across the country.',
    categoryName: 'Food',
    difficulty: 'BEGINNER',
    businessType: 'HYBRID',
    minInvestment: 15000,
    maxInvestment: 60000,
    expectedProfit: '₹12,000 – ₹35,000 / month',
    estimatedTime: '3-5 weeks to launch',
    growthPotential: 'MEDIUM',
    targetCustomers: 'Households, gift buyers, expatriates, and specialty grocery stores looking for authentic homemade pickles.',
    toolsRequired: ['Glass jars', 'Mixing vessels', 'Weighing scale', 'Labels', 'Storage racks'],
    marketDemand: 'Homemade, preservative-free pickles enjoy loyal repeat demand and strong gifting appeal.',
    requiredSkills: [
      { name: 'Cooking', weight: 4 },
      { name: 'Handicrafts', weight: 2 },
    ],
    swot: {
      strengths: ['Long shelf life', 'Easy to ship', 'High margins'],
      weaknesses: ['Seasonal ingredients', 'Manual production'],
      opportunities: ['Export & gifting', 'Online marketplaces'],
      threats: ['Established brands', 'Quality consistency'],
    },
    investmentBreakdown: [
      { item: 'Raw ingredients', amount: 20000 },
      { item: 'Jars & packaging', amount: 12000 },
      { item: 'Labels & branding', amount: 8000 },
      { item: 'Licensing', amount: 5000 },
    ],
    licenses: ['FSSAI Registration'],
    registrations: ['Udyam (MSME) Registration'],
    marketingStrategy: 'Sell via local stores, Instagram, and marketplaces; use tasting samples and festival gift packs.',
    riskFactors: ['Ingredient price fluctuation', 'Shelf-life management'],
    revenueModel: 'Per-jar retail sales, wholesale to stores, and seasonal gift hampers.',
    checklist: [
      { label: 'Standardize recipes', done: false },
      { label: 'Source jars in bulk', done: false },
      { label: 'Design product labels', done: false },
    ],
    withRoadmap: true,
  },
  {
    title: 'Custom Tailoring Studio',
    tagline: 'Bespoke stitching and alterations for every fit.',
    description:
      'Offer custom stitching, alterations, and boutique tailoring services. Turn tailoring and fashion-design skills into a studio that serves individual clients and small boutiques.',
    categoryName: 'Services',
    difficulty: 'INTERMEDIATE',
    businessType: 'OFFLINE',
    minInvestment: 30000,
    maxInvestment: 120000,
    expectedProfit: '₹20,000 – ₹60,000 / month',
    estimatedTime: '3-6 weeks to launch',
    growthPotential: 'MEDIUM',
    targetCustomers: 'Individuals wanting custom-fit clothing, wedding outfits, boutiques, and repeat alteration customers.',
    toolsRequired: ['Sewing machines', 'Overlock machine', 'Cutting table', 'Measuring tools', 'Iron & board'],
    marketDemand: 'Custom-fit and occasion wear keeps steady demand despite ready-made competition.',
    requiredSkills: [
      { name: 'Tailoring', weight: 5 },
      { name: 'Fashion Designing', weight: 3 },
    ],
    swot: {
      strengths: ['Repeat clients', 'High-margin custom work', 'Skill-based moat'],
      weaknesses: ['Labour intensive', 'Seasonal peaks'],
      opportunities: ['Boutique tie-ups', 'Online made-to-measure'],
      threats: ['Fast fashion', 'Skilled-labour shortage'],
    },
    investmentBreakdown: [
      { item: 'Sewing machines', amount: 50000 },
      { item: 'Studio furniture', amount: 25000 },
      { item: 'Fabric & supplies', amount: 20000 },
      { item: 'Marketing', amount: 10000 },
    ],
    licenses: ['Shop & Establishment License'],
    registrations: ['Udyam (MSME) Registration'],
    marketingStrategy: 'Partner with local boutiques, showcase work on Instagram, and offer referral discounts.',
    riskFactors: ['Skilled staff retention', 'Seasonal demand swings'],
    revenueModel: 'Per-garment stitching charges, alteration fees, and boutique contracts.',
    checklist: [
      { label: 'Set up studio space', done: false },
      { label: 'Buy machines', done: false },
      { label: 'Build a portfolio', done: false },
    ],
    withRoadmap: false,
  },
  {
    title: 'Freelance Graphic Design',
    tagline: 'Design logos and brand assets for clients worldwide.',
    description:
      'Provide graphic-design services such as logos, social media creatives, and brand kits to clients online. A near-zero-inventory business that scales purely on skill and reputation.',
    categoryName: 'Creative',
    difficulty: 'BEGINNER',
    businessType: 'ONLINE',
    minInvestment: 5000,
    maxInvestment: 50000,
    expectedProfit: '₹20,000 – ₹80,000 / month',
    estimatedTime: '1-3 weeks to launch',
    growthPotential: 'HIGH',
    targetCustomers: 'Startups, small businesses, content creators, and marketing agencies needing design work.',
    toolsRequired: ['Laptop', 'Design software', 'Graphics tablet', 'Portfolio website'],
    marketDemand: 'Every brand needs visual content, keeping design demand strong on freelance platforms.',
    requiredSkills: [
      { name: 'Graphic Design', weight: 5 },
      { name: 'Content Creation', weight: 2 },
      { name: 'Digital Marketing', weight: 2 },
    ],
    swot: {
      strengths: ['Very low overhead', 'Global clients', 'Location independent'],
      weaknesses: ['Income variability', 'Client acquisition'],
      opportunities: ['Retainer contracts', 'Digital products & templates'],
      threats: ['AI design tools', 'Race-to-bottom pricing'],
    },
    investmentBreakdown: [
      { item: 'Laptop / hardware', amount: 40000 },
      { item: 'Software subscriptions', amount: 8000 },
      { item: 'Portfolio & marketing', amount: 5000 },
    ],
    licenses: [],
    registrations: ['GST Registration (if applicable)'],
    marketingStrategy: 'Build a strong portfolio, bid on freelance platforms, and share work daily on social media.',
    riskFactors: ['Inconsistent client pipeline', 'Scope creep'],
    revenueModel: 'Per-project fees, monthly retainers, and template product sales.',
    checklist: [
      { label: 'Build a portfolio site', done: false },
      { label: 'Create freelance profiles', done: false },
      { label: 'Set service packages', done: false },
    ],
    withRoadmap: false,
  },
  {
    title: 'Home Bakery',
    tagline: 'Fresh cakes and bakes made from your kitchen.',
    description:
      'Bake and sell cakes, cookies, and desserts on order from home. Turn baking passion into a business serving birthdays, weddings, and everyday sweet cravings in your locality.',
    categoryName: 'Food',
    difficulty: 'BEGINNER',
    businessType: 'HOME',
    minInvestment: 20000,
    maxInvestment: 80000,
    expectedProfit: '₹18,000 – ₹50,000 / month',
    estimatedTime: '2-4 weeks to launch',
    growthPotential: 'HIGH',
    targetCustomers: 'Families celebrating occasions, cafes, and customers ordering custom cakes and desserts online.',
    toolsRequired: ['Oven', 'Mixer', 'Baking trays', 'Piping tools', 'Cake boxes'],
    marketDemand: 'Custom cakes and artisanal bakes see strong, occasion-driven demand year round.',
    requiredSkills: [
      { name: 'Baking', weight: 5 },
      { name: 'Photography', weight: 2 },
      { name: 'Digital Marketing', weight: 2 },
    ],
    swot: {
      strengths: ['High-margin custom cakes', 'Home-based', 'Visual social appeal'],
      weaknesses: ['Perishable product', 'Order-based income'],
      opportunities: ['Cafe supply contracts', 'Baking workshops'],
      threats: ['Established bakeries', 'Ingredient cost rises'],
    },
    investmentBreakdown: [
      { item: 'Oven & mixer', amount: 45000 },
      { item: 'Baking tools', amount: 15000 },
      { item: 'Ingredients', amount: 12000 },
      { item: 'Packaging & marketing', amount: 8000 },
    ],
    licenses: ['FSSAI Registration'],
    registrations: ['Udyam (MSME) Registration'],
    marketingStrategy: 'Post appetising photos on Instagram, take pre-orders on WhatsApp, and collaborate with local cafes.',
    riskFactors: ['Perishability', 'Peak-day capacity limits'],
    revenueModel: 'Per-order custom cakes, dessert boxes, and cafe wholesale supply.',
    checklist: [
      { label: 'Get FSSAI registration', done: false },
      { label: 'Buy baking equipment', done: false },
      { label: 'Photograph a sample menu', done: false },
    ],
    withRoadmap: false,
  },
];

// ---------------------------------------------------------------------------
// Learning resources (categories resolved at seed time)
// ---------------------------------------------------------------------------

type ResourceSeed = {
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'PDF' | 'TEMPLATE' | 'WORKSHEET' | 'CHECKLIST';
  description: string;
  categoryName: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  contentUrl?: string;
  body?: string;
  durationMin?: number;
  lessons: { title: string; body?: string; durationMin?: number }[];
};

const RESOURCES: ResourceSeed[] = [
  {
    title: 'Starting a Home Food Business',
    type: 'VIDEO',
    description: 'A step-by-step video guide to launching a home-based food business legally and profitably.',
    categoryName: 'Food',
    difficulty: 'BEGINNER',
    contentUrl: 'https://example.com/videos/home-food-business.mp4',
    durationMin: 45,
    lessons: [
      { title: 'Why start a food business', durationMin: 10 },
      { title: 'Getting your FSSAI license', durationMin: 15 },
      { title: 'Pricing your menu', durationMin: 20 },
    ],
  },
  {
    title: 'Digital Marketing Basics for Small Businesses',
    type: 'ARTICLE',
    description: 'Learn the fundamentals of promoting your business on social media and search.',
    categoryName: 'Tech',
    difficulty: 'BEGINNER',
    body: '# Digital Marketing Basics\n\nMarketing is how customers find you. Start with one channel, post consistently, and measure what works.',
    durationMin: 20,
    lessons: [
      { title: 'Understanding your audience', body: 'Define who your customer is before you post.', durationMin: 8 },
      { title: 'Choosing the right channel', body: 'Pick one platform and master it first.', durationMin: 12 },
    ],
  },
  {
    title: 'Business Plan Template',
    type: 'TEMPLATE',
    description: 'A ready-to-use one-page business plan template you can fill in for any idea.',
    categoryName: 'Education',
    difficulty: 'BEGINNER',
    contentUrl: 'https://example.com/templates/business-plan.docx',
    lessons: [
      { title: 'How to use this template', body: 'Fill each section with your own numbers.', durationMin: 5 },
    ],
  },
  {
    title: 'Pricing Your Products Right',
    type: 'PDF',
    description: 'A practical PDF guide to costing, margins, and competitive pricing.',
    categoryName: 'Retail',
    difficulty: 'INTERMEDIATE',
    contentUrl: 'https://example.com/pdfs/pricing-guide.pdf',
    durationMin: 30,
    lessons: [
      { title: 'Calculating your costs', durationMin: 10 },
      { title: 'Setting a healthy margin', durationMin: 10 },
      { title: 'Reading the competition', durationMin: 10 },
    ],
  },
  {
    title: 'Photography for Product Sellers',
    type: 'VIDEO',
    description: 'Shoot beautiful product photos with just a phone and natural light.',
    categoryName: 'Creative',
    difficulty: 'BEGINNER',
    contentUrl: 'https://example.com/videos/product-photography.mp4',
    durationMin: 35,
    lessons: [
      { title: 'Lighting on a budget', durationMin: 12 },
      { title: 'Composition basics', durationMin: 11 },
      { title: 'Editing on your phone', durationMin: 12 },
    ],
  },
  {
    title: 'Launch Readiness Checklist',
    type: 'CHECKLIST',
    description: 'A checklist of everything to verify before you open for business.',
    categoryName: 'Services',
    difficulty: 'BEGINNER',
    body: '- Licenses obtained\n- Pricing finalized\n- Marketing channel ready\n- First customers lined up',
    lessons: [
      { title: 'Pre-launch checks', body: 'Run through every item before day one.', durationMin: 6 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Seed steps
// ---------------------------------------------------------------------------

async function seedSkills() {
  for (const name of SKILL_NAMES) {
    const slug = slugify(name);
    await prisma.skill.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }
  return prisma.skill.findMany();
}

async function seedInterests() {
  for (const name of INTEREST_NAMES) {
    const slug = slugify(name);
    await prisma.interest.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }
  return prisma.interest.findMany();
}

async function seedCategories() {
  for (const cat of CATEGORY_DATA) {
    const slug = slugify(cat.name);
    await prisma.category.upsert({
      where: { slug },
      update: { description: cat.description, icon: cat.icon },
      create: { name: cat.name, slug, description: cat.description, icon: cat.icon },
    });
  }
  return prisma.category.findMany();
}

async function seedAchievements() {
  for (const a of ACHIEVEMENT_DATA) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: { title: a.title, description: a.description, icon: a.icon, points: a.points },
      create: a,
    });
  }
}

async function seedUsers(skills: { id: string; name: string }[]) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@skillforge.app' },
    update: { name: 'SkillForge Admin', role: 'ADMIN', isEmailVerified: true, passwordHash },
    create: {
      email: 'admin@skillforge.app',
      name: 'SkillForge Admin',
      role: 'ADMIN',
      passwordHash,
      isEmailVerified: true,
      profileCompletion: 100,
    },
  });

  // Mentor + VERIFIED mentor profile
  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@skillforge.app' },
    update: { name: 'Rahul Mentor', role: 'MENTOR', isEmailVerified: true, passwordHash },
    create: {
      email: 'mentor@skillforge.app',
      name: 'Rahul Mentor',
      role: 'MENTOR',
      passwordHash,
      isEmailVerified: true,
      bio: 'Serial small-business founder helping first-time entrepreneurs launch.',
      location: 'Bengaluru',
      profileCompletion: 100,
    },
  });

  await prisma.mentorProfile.upsert({
    where: { userId: mentor.id },
    update: {
      headline: 'Small-business launch mentor',
      expertise: ['Food business', 'Marketing', 'Operations'],
      yearsExperience: 8,
      languages: ['English', 'Hindi', 'Kannada'],
      hourlyRate: 0,
      verificationStatus: 'VERIFIED',
    },
    create: {
      userId: mentor.id,
      headline: 'Small-business launch mentor',
      expertise: ['Food business', 'Marketing', 'Operations'],
      yearsExperience: 8,
      languages: ['English', 'Hindi', 'Kannada'],
      hourlyRate: 0,
      verificationStatus: 'VERIFIED',
    },
  });

  // Entrepreneur with skills + assessment
  const priya = await prisma.user.upsert({
    where: { email: 'priya@skillforge.app' },
    update: {
      name: 'Priya Sharma',
      role: 'ENTREPRENEUR',
      isEmailVerified: true,
      passwordHash,
      budget: 50000,
      experienceLevel: 'BEGINNER',
      availableHours: 20,
      preferredType: 'HOME',
      businessGoal: 'Start a home-based food business within three months.',
      readinessScore: 65,
      profileCompletion: 90,
    },
    create: {
      email: 'priya@skillforge.app',
      name: 'Priya Sharma',
      role: 'ENTREPRENEUR',
      passwordHash,
      isEmailVerified: true,
      location: 'Pune',
      budget: 50000,
      experienceLevel: 'BEGINNER',
      availableHours: 20,
      preferredType: 'HOME',
      businessGoal: 'Start a home-based food business within three months.',
      readinessScore: 65,
      profileCompletion: 90,
    },
  });

  // Attach skills to Priya (Cooking, Baking, Digital Marketing).
  const priyaSkillNames = ['Cooking', 'Baking', 'Digital Marketing'];
  const priyaSkills = skills.filter((s) => priyaSkillNames.includes(s.name));
  for (const skill of priyaSkills) {
    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId: priya.id, skillId: skill.id } },
      update: {},
      create: { userId: priya.id, skillId: skill.id, proficiency: 'INTERMEDIATE' },
    });
  }

  return { admin, mentor, priya };
}

async function seedBusinesses(
  categories: { id: string; name: string }[],
  skills: { id: string; name: string }[],
) {
  const categoryByName = new Map(categories.map((c) => [c.name, c.id]));
  const skillByName = new Map(skills.map((s) => [s.name, s.id]));

  for (const b of BUSINESSES) {
    const slug = slugify(b.title);
    const categoryId = categoryByName.get(b.categoryName) ?? null;

    const data = {
      title: b.title,
      tagline: b.tagline,
      description: b.description,
      categoryId,
      difficulty: b.difficulty,
      businessType: b.businessType,
      minInvestment: b.minInvestment,
      maxInvestment: b.maxInvestment,
      expectedProfit: b.expectedProfit,
      estimatedTime: b.estimatedTime,
      growthPotential: b.growthPotential,
      targetCustomers: b.targetCustomers,
      toolsRequired: b.toolsRequired,
      status: 'PUBLISHED' as const,
      marketDemand: b.marketDemand,
      swot: b.swot,
      investmentBreakdown: b.investmentBreakdown,
      licenses: b.licenses,
      registrations: b.registrations,
      marketingStrategy: b.marketingStrategy,
      riskFactors: b.riskFactors,
      revenueModel: b.revenueModel,
      checklist: b.checklist,
    };

    const business = await prisma.business.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });

    // Re-create the required-skill join rows deterministically.
    await prisma.businessSkill.deleteMany({ where: { businessId: business.id } });
    for (const rs of b.requiredSkills) {
      const skillId = skillByName.get(rs.name);
      if (!skillId) continue;
      await prisma.businessSkill.create({
        data: { businessId: business.id, skillId, weight: rs.weight },
      });
    }

    // Roadmap for the flagged businesses.
    if (b.withRoadmap) {
      await seedRoadmap(business.id, b.title);
    }
  }

  return prisma.business.findMany();
}

async function seedRoadmap(businessId: string, businessTitle: string) {
  const roadmap = await prisma.roadmap.upsert({
    where: { businessId },
    update: {
      title: `${businessTitle} Roadmap`,
      description: `A guided, step-by-step roadmap to launch your ${businessTitle} business.`,
    },
    create: {
      businessId,
      title: `${businessTitle} Roadmap`,
      description: `A guided, step-by-step roadmap to launch your ${businessTitle} business.`,
    },
  });

  // Re-create steps deterministically by (roadmapId, order).
  await prisma.roadmapStep.deleteMany({ where: { roadmapId: roadmap.id } });
  await prisma.roadmapStep.createMany({
    data: ROADMAP_STEP_TEMPLATE.map((step, index) => ({
      roadmapId: roadmap.id,
      order: index + 1,
      title: step.title,
      description: step.description,
    })),
    skipDuplicates: true,
  });
}

async function seedResources(categories: { id: string; name: string }[]) {
  const categoryByName = new Map(categories.map((c) => [c.name, c.id]));

  for (const r of RESOURCES) {
    const slug = slugify(r.title);
    const categoryId = categoryByName.get(r.categoryName) ?? null;

    const data = {
      title: r.title,
      type: r.type,
      description: r.description,
      categoryId,
      difficulty: r.difficulty,
      contentUrl: r.contentUrl ?? null,
      body: r.body ?? null,
      durationMin: r.durationMin ?? null,
      status: 'PUBLISHED' as const,
    };

    const resource = await prisma.learningResource.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });

    // Re-create lessons deterministically by (resourceId, order).
    await prisma.lesson.deleteMany({ where: { resourceId: resource.id } });
    await prisma.lesson.createMany({
      data: r.lessons.map((lesson, index) => ({
        resourceId: resource.id,
        order: index + 1,
        title: lesson.title,
        body: lesson.body ?? null,
        durationMin: lesson.durationMin ?? null,
      })),
      skipDuplicates: true,
    });
  }

  return prisma.learningResource.findMany();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌱 Seeding SkillForge database...');

  const skills = await seedSkills();
  console.log(`  ✓ ${skills.length} skills`);

  const interests = await seedInterests();
  console.log(`  ✓ ${interests.length} interests`);

  const categories = await seedCategories();
  console.log(`  ✓ ${categories.length} categories`);

  await seedAchievements();
  console.log(`  ✓ ${ACHIEVEMENT_DATA.length} achievements`);

  const users = await seedUsers(skills);
  console.log(`  ✓ demo users: ${users.admin.email}, ${users.mentor.email}, ${users.priya.email}`);

  const businesses = await seedBusinesses(categories, skills);
  console.log(`  ✓ ${businesses.length} businesses`);

  const roadmaps = await prisma.roadmap.count();
  const steps = await prisma.roadmapStep.count();
  console.log(`  ✓ ${roadmaps} roadmaps (${steps} steps)`);

  const resources = await seedResources(categories);
  const lessons = await prisma.lesson.count();
  console.log(`  ✓ ${resources.length} learning resources (${lessons} lessons)`);

  console.log('✅ Seed complete.');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
