// The tech stack of each of my repositories (public and private), keyed by repo name.
// GitHub's language API only returns source languages, so these manifest-checked
// stacks keep project chips aligned with the actual frameworks/tools in each repo.
// Ordered most-significant first: featured cards show 6 chips, grid cards show 5.
export const REPO_STACKS: Record<string, string[]> = {
  'just-for-fun-website': ['Next.js', 'TypeScript', 'Supabase', 'Prisma', 'Neon', 'PostgreSQL', 'Tailwind CSS', 'Spline', 'Nodemailer'],
  'travel_genie': ['React', 'Vite', 'Node.js', 'Express', 'PostgreSQL', 'Sequelize', 'Flask', 'Scikit-learn', 'Pandas', 'Leaflet', 'Google Maps API', 'SQLAlchemy'],
  'travel_genie_app': ['Expo', 'React Native', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'JWT', 'Cloudinary', 'React Navigation'],
  'web-voting-system': ['Spring Boot', 'Spring Security', 'React', 'Vite', 'MS SQL Server', 'JWT', 'Hibernate / JPA', 'Recharts'],
  'mazora-network': ['Next.js', 'TypeScript', 'Tailwind CSS', 'Drizzle ORM', 'Supabase', 'Zod', 'PostgreSQL', 'Vercel Cron'],
  'vero_salon_website': ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Zod', 'React Hook Form', 'Resend', 'Vitest', 'Playwright'],
  'salon_vero_app': ['Expo', 'React Native', 'TypeScript', 'Supabase', 'Expo Router', 'Reanimated', 'Zod', 'Jest'],
  'brakmasra': ['Next.js', 'TypeScript', 'Supabase', 'Drizzle ORM', 'Tailwind CSS', 'Zod', 'PostgreSQL', 'Vitest'],
  'weekly-report-dashboard': ['Next.js', 'TypeScript', 'Prisma', 'Neon', 'NextAuth', 'Recharts', 'Tailwind CSS', 'Zod'],
  'thilak_products_website': ['Next.js', 'TypeScript', 'Prisma', 'Supabase', 'PostgreSQL', 'Resend', 'Tailwind CSS', 'Playwright'],
  'skillbridge-lk': ['React', 'Vite', 'Express', 'Supabase', 'Tailwind CSS', 'React Hook Form', 'Zod', 'React Router'],
  'stremio_discord_rich_presence': ['Electron', 'Node.js', 'Discord RPC', 'electron-builder', 'NSIS', 'GitHub Actions'],
  'valheim-auto-cleanup': ['C#', '.NET', 'BepInEx', 'Harmony', 'Unity', 'xUnit'],
  'job-hunting-tracker': ['JavaScript', 'HTML', 'CSS', 'SheetJS', 'Tesseract.js', 'Gemini API', 'OpenAI API'],
  'kavisha_portfolio-v2': ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Spline', 'Vercel'],
  'kavisha_portfolio': ['HTML', 'CSS', 'JavaScript'],
  'discord_music_bot': ['Node.js', 'Discord.js', 'Docker', 'yt-dlp', 'FFmpeg', 'Cloudflare Tunnel', 'AWS EC2', 'GitHub Actions'],
  'discord-youtube-status-bot': ['Python', 'Discord.py', 'Flask', 'aiohttp', 'Docker', 'GitHub Actions'],
  'discord-j4fn-server-bot': ['Python', 'Discord.py', 'Flask', 'Docker', 'Cloudflare Tunnel', 'AWS EC2', 'GitHub Actions'],
  'home-tutor': ['Java', 'Servlets', 'JSP / JSTL', 'Maven', 'Tomcat'],
  'denguerisk': ['Python', 'Pandas', 'Scikit-learn', 'NumPy', 'Matplotlib', 'Seaborn', 'Jupyter'],
};

// Display names for repos whose name doesn't title-case cleanly.
const REPO_NAMES: Record<string, string> = {
  'just-for-fun-website': 'Just For Fun',
  travel_genie: 'TravelGenie',
  travel_genie_app: 'TravelGenie App',
  vero_salon_website: 'Vero Salon',
  salon_vero_app: 'Vero Salon App',
  brakmasra: 'Brakmasra',
  'kavisha_portfolio-v2': 'This portfolio',
  kavisha_portfolio: 'Portfolio v1',
  'skillbridge-lk': 'SkillBridge LK',
  denguerisk: 'DengueRisk',
  'discord-j4fn-server-bot': 'J4FN Discord Bot',
  'discord-youtube-status-bot': 'YouTube Status Bot',
};

export const repoDisplayName = (repo: string) =>
  REPO_NAMES[repo] ?? repo.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
