import { useState } from 'react';
import { Section } from '../ui/Section';
import { motion } from 'framer-motion';

interface Skill {
  name: string;
  slug?: string; // simple-icons slug (cdn.simpleicons.org)
  color?: string; // hex without # — used in dark mode (also used in light if lightColor not set)
  lightColor?: string; // optional override hex for light mode (when `color` is too pale on white)
  url?: string; // full URL override — used when simple-icons doesn't have the logo
  darkUrl?: string; // separate artwork for dark mode when the project ships one
  darkInvert?: boolean; // render a `url` logo as white in dark mode (for dark-only artwork)
  darkBoost?: boolean; // brighten a multi-colour `url` logo in dark mode (keeps brand hues)
}

interface SkillGroup {
  title: string;
  items: Skill[];
}

// simple-icons.org — slug = lowercase name, special chars removed.
// Every colour pair is checked for ≥ 2.2:1 contrast against both tile backgrounds
// (white, and slate-900/60 in dark mode) so no logo disappears in either theme.
// devicon is a fallback for logos that Simple Icons removed (Adobe, Canva, MS SQL Server, etc.).
// Pinned to a published npm version: the unpinned GitHub path exceeds jsDelivr's
// 50 MB package limit, so uncached files there fail with 403.
const devicon = (name: string, variant = 'original') =>
  `https://cdn.jsdelivr.net/npm/devicon@2.17.0/icons/${name}/${name}-${variant}.svg`;

// Official artwork for tools neither icon set carries, served from each project's own
// repository via jsDelivr at a pinned tag/commit so the files can never change under us.
// OpenAI comes from the last simple-icons release that still shipped it.
const SEABORN = 'https://cdn.jsdelivr.net/gh/mwaskom/seaborn@v0.13.2/doc/_static';
const EXTERNAL_LOGOS = {
  seabornLight: `${SEABORN}/logo-mark-lightbg.png`,
  seabornDark: `${SEABORN}/logo-mark-darkbg.png`,
  openai: 'https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/openai.svg',
  // The blue mark has an opaque white background (fine on white tiles); the dark
  // variant is a white mark on transparency.
  tesseractLight: 'https://cdn.jsdelivr.net/gh/naptha/tesseract.js@v7.0.0/docs/images/tesseract.png',
  tesseractDark: 'https://cdn.jsdelivr.net/gh/naptha/tesseract.js@v7.0.0/docs/images/tesseract_dark.png',
  xunit: 'https://cdn.jsdelivr.net/gh/xunit/media@1c51fd67f551/logo-transparent.svg',
};

// Technologies below are taken from the dependency manifests (package.json,
// requirements.txt, pom.xml, .csproj, Dockerfiles, workflows) across all of my
// repositories, public and private.
const groups: SkillGroup[] = [
  {
    title: 'Languages',
    items: [
      { name: 'Java', url: devicon('java'), darkBoost: true },
      { name: 'Python', slug: 'python', color: '3776AB', lightColor: '3776AB' },
      { name: 'JavaScript', slug: 'javascript', color: 'F7DF1E', lightColor: 'A18A00' },
      { name: 'TypeScript', slug: 'typescript', color: '3178C6' },
      { name: 'C#', url: devicon('csharp') },
      { name: 'SQL', url: devicon('mysql'), darkBoost: true },
    ],
  },
  {
    title: 'Frontend',
    items: [
      { name: 'React', slug: 'react', color: '61DAFB', lightColor: '087EA4' },
      { name: 'Next.js', slug: 'nextdotjs', color: 'FFFFFF', lightColor: '000000' },
      { name: 'Vite', slug: 'vite', color: '646CFF' },
      { name: 'Tailwind CSS', slug: 'tailwindcss', color: '06B6D4', lightColor: '0891B2' },
      { name: 'Framer Motion', slug: 'framer', color: 'FFFFFF', lightColor: '0055FF' },
      { name: 'React Router', slug: 'reactrouter', color: 'F44250', lightColor: 'CA4245' },
      { name: 'React Hook Form', slug: 'reacthookform', color: 'EC5990' },
      { name: 'Zod', slug: 'zod', color: '6E8FD8', lightColor: '3E67B1' },
      { name: 'Leaflet', slug: 'leaflet', color: '4CAF50', lightColor: '199900' },
      { name: 'HTML', slug: 'html5', color: 'E34F26' },
      { name: 'CSS', url: devicon('css3') },
    ],
  },
  {
    title: 'Mobile & Desktop',
    items: [
      { name: 'React Native', slug: 'react', color: '61DAFB', lightColor: '087EA4' },
      { name: 'Expo', slug: 'expo', color: 'FFFFFF', lightColor: '000020' },
      { name: 'Electron', slug: 'electron', color: '9FEAF9', lightColor: '47848F' },
      { name: '.NET', slug: 'dotnet', color: '9B7BF0', lightColor: '512BD4' },
    ],
  },
  {
    title: 'Backend',
    items: [
      { name: 'Node.js', slug: 'nodedotjs', color: '5FA04E' },
      { name: 'Express', slug: 'express', color: 'FFFFFF', lightColor: '000000' },
      { name: 'Spring Boot', slug: 'springboot', color: '6DB33F' },
      { name: 'Spring Security', slug: 'springsecurity', color: '6DB33F' },
      { name: 'Hibernate / JPA', slug: 'hibernate', color: 'BCAE79', lightColor: '59666C' },
      { name: 'Flask', slug: 'flask', color: 'FFFFFF', lightColor: '000000' },
      { name: 'Gunicorn', slug: 'gunicorn', color: '6CC24A', lightColor: '499848' },
      { name: 'Discord.js', slug: 'discord', color: '5865F2' },
      { name: 'Discord.py', slug: 'discord', color: '5865F2' },
      { name: 'REST APIs', slug: 'fastapi', color: '009688' },
      { name: 'JWT', slug: 'jsonwebtokens', color: 'D63AFF' },
    ],
  },
  {
    title: 'Databases & ORMs',
    items: [
      { name: 'PostgreSQL', slug: 'postgresql', color: '6B8FF0', lightColor: '4169E1' },
      { name: 'Supabase', slug: 'supabase', color: '3FCF8E', lightColor: '249361' },
      { name: 'Neon', slug: 'neon', color: '00E599', lightColor: '00A36C' },
      { name: 'MongoDB', slug: 'mongodb', color: '47A248' },
      { name: 'MySQL', slug: 'mysql', color: '5B9BD5', lightColor: '4479A1' },
      { name: 'MS SQL Server', url: devicon('microsoftsqlserver'), darkBoost: true },
      { name: 'Prisma', slug: 'prisma', color: 'FFFFFF', lightColor: '2D3748' },
      { name: 'Drizzle ORM', slug: 'drizzle', color: 'C5F74F', lightColor: '5C7A00' },
      { name: 'Sequelize', slug: 'sequelize', color: '52B0E7', lightColor: '2F81B7' },
      { name: 'Mongoose', slug: 'mongoose', color: 'E0564B', lightColor: '880000' },
      { name: 'SQLAlchemy', slug: 'sqlalchemy', color: 'FF5A36', lightColor: 'D71F00' },
    ],
  },
  {
    title: 'AI & Data',
    items: [
      { name: 'Pandas', slug: 'pandas', color: 'FFCA00', lightColor: '150458' },
      { name: 'NumPy', slug: 'numpy', color: '4DABCF', lightColor: '013243' },
      { name: 'Scikit-learn', slug: 'scikitlearn', color: 'F7931E' },
      { name: 'Matplotlib', url: devicon('matplotlib') },
      { name: 'Seaborn', url: EXTERNAL_LOGOS.seabornLight, darkUrl: EXTERNAL_LOGOS.seabornDark },
      { name: 'Jupyter', slug: 'jupyter', color: 'F37626' },
      { name: 'OpenCV', slug: 'opencv', color: '8B75F2', lightColor: '5C3EE8' },
      { name: 'Gemini API', slug: 'googlegemini', color: 'A48BD6', lightColor: '8E75B2' },
      { name: 'OpenAI API', url: EXTERNAL_LOGOS.openai, darkInvert: true },
      { name: 'Tesseract OCR', url: EXTERNAL_LOGOS.tesseractLight, darkUrl: EXTERNAL_LOGOS.tesseractDark },
    ],
  },
  {
    title: 'Testing',
    items: [
      { name: 'Vitest', slug: 'vitest', color: '729B1B', lightColor: '6E9F18' },
      { name: 'Jest', slug: 'jest', color: 'E0433F', lightColor: 'C21325' },
      { name: 'Playwright', url: devicon('playwright') },
      { name: 'Testing Library', slug: 'testinglibrary', color: 'E33332' },
      { name: 'JUnit', slug: 'junit5', color: '25A162' },
      { name: 'xUnit', url: EXTERNAL_LOGOS.xunit },
    ],
  },
  {
    title: 'DevOps & Cloud',
    items: [
      { name: 'Docker', slug: 'docker', color: '2496ED' },
      { name: 'GitHub Actions', slug: 'githubactions', color: '2088FF' },
      { name: 'AWS EC2', url: devicon('amazonwebservices', 'original-wordmark'), darkInvert: true },
      { name: 'Cloudflare Tunnel', slug: 'cloudflare', color: 'F38020' },
      { name: 'Vercel', slug: 'vercel', color: 'FFFFFF', lightColor: '000000' },
      { name: 'Cloudinary', slug: 'cloudinary', color: '6D8FF0', lightColor: '3448C5' },
      { name: 'Resend', slug: 'resend', color: 'FFFFFF', lightColor: '000000' },
      { name: 'FFmpeg', slug: 'ffmpeg', color: '3DB83D', lightColor: '007808' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { name: 'Git', slug: 'git', color: 'F05032' },
      { name: 'GitHub', slug: 'github', color: 'FFFFFF', lightColor: '181717' },
      { name: 'Maven', url: devicon('maven') },
      { name: 'VS Code', url: devicon('vscode') },
      { name: 'IntelliJ IDEA', url: devicon('intellij') },
      { name: 'Postman', slug: 'postman', color: 'FF6C37' },
      { name: 'Figma', slug: 'figma', color: 'F24E1E' },
    ],
  },
  {
    title: 'Media & Design',
    items: [
      { name: 'Premiere Pro', url: devicon('premierepro') },
      { name: 'DaVinci Resolve', slug: 'davinciresolve', color: 'FFFFFF', lightColor: '233A51' },
      { name: 'OBS Studio', slug: 'obsstudio', color: 'FFFFFF', lightColor: '302E31' },
      { name: 'Canva', url: devicon('canva') },
    ],
  },
];

function logoUrl(skill: Skill, mode: 'dark' | 'light' = 'dark') {
  if (mode === 'dark' && skill.darkUrl) return skill.darkUrl;
  if (skill.url) return skill.url;
  if (!skill.slug) return '';
  const color = mode === 'light' ? (skill.lightColor ?? skill.color) : skill.color;
  return color
    ? `https://cdn.simpleicons.org/${skill.slug}/${color}`
    : `https://cdn.simpleicons.org/${skill.slug}`;
}

// "Tesseract OCR" → "TO", "Seaborn" → "Se". Shown when a technology has no public
// logo, or its logo fails to load, so a tile never renders with an empty icon slot.
const monogram = (name: string) => {
  const words = name.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2);
};

function SkillLogo({ skill }: { skill: Skill }) {
  const [failed, setFailed] = useState(false);
  const light = logoUrl(skill, 'light');
  const dark = logoUrl(skill, 'dark');

  if (failed || (!light && !dark)) {
    return (
      <span
        aria-hidden="true"
        className="w-8 h-8 flex items-center justify-center rounded-md bg-brand-primary/10 ring-1 ring-brand-primary/30 font-mono text-[11px] font-bold text-brand-primary group-hover:scale-110 transition-transform"
      >
        {monogram(skill.name)}
      </span>
    );
  }

  const imgClass = 'w-8 h-8 object-contain group-hover:scale-110 transition-transform';
  return (
    <>
      {/* Light-mode variant (hidden in dark) */}
      <img
        src={light}
        alt={`${skill.name} logo`}
        width={32}
        height={32}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${imgClass} block dark:hidden`}
      />
      {/* Dark-mode variant */}
      <img
        src={dark}
        alt={`${skill.name} logo`}
        width={32}
        height={32}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${imgClass} hidden dark:block ${skill.darkInvert ? 'brightness-0 invert' : ''} ${skill.darkBoost ? 'brightness-200' : ''}`}
      />
    </>
  );
}

export function Skills() {
  return (
    <Section id="skills" num="02." title="My Toolkit">
      <p className="text-slate-500 dark:text-slate-400 max-w-2xl mb-14 text-[15px] leading-relaxed">
        Languages, frameworks, and tools I reach for when building real things.
      </p>

      <div className="space-y-14">
        {groups.map(group => (
          <div key={group.title}>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="font-mono text-sm text-brand-primary whitespace-nowrap">
                {group.title}
              </h3>
              <span className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {group.items.map((skill, idx) => (
                <motion.li
                  key={skill.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.25) }}
                  whileHover={{ y: -3 }}
                  className="group flex flex-col items-center justify-center gap-2 p-3 rounded-md bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-brand-primary/60 hover:shadow-[0_8px_20px_-12px] hover:shadow-brand-primary/40 transition-all"
                >
                  <div className="w-9 h-9 flex items-center justify-center">
                    <SkillLogo skill={skill} />
                  </div>
                  <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 text-center group-hover:text-brand-primary transition-colors">
                    {skill.name}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
