import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { Section } from '../ui/Section';
import { REPO_STACKS, repoDisplayName } from '../../data/repoStacks';
import { SKILL_NOTES } from '../../data/skillNotes';

// A logo comes either from Simple Icons (slug + brand colour) or from a direct URL.
interface SimpleIconSkill {
  name: string;
  slug: string; // simple-icons slug (cdn.simpleicons.org)
  color: string; // hex without # — used in dark mode (also used in light if lightColor not set)
  lightColor?: string; // optional override hex for light mode (when `color` is too pale on white)
}

interface UrlSkill {
  name: string;
  url: string; // used when simple-icons doesn't have the logo
  darkUrl?: string; // separate artwork for dark mode when the project ships one
  darkInvert?: boolean; // render the logo as white in dark mode (for dark-only artwork)
  darkBoost?: boolean; // brighten a multi-colour logo in dark mode (keeps brand hues)
}

type Skill = SimpleIconSkill | UrlSkill;

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
      { name: 'Python', slug: 'python', color: '3776AB' },
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

// What the voice guide says for a skill or group, where it differs from the label on
// the page (see lib/narrationHighlights). Unlisted ones are spoken as labelled.
const SPOKEN: Record<string, string> = {
  'C#': 'C#|C sharp',
  'Mobile & Desktop': 'mobile and desktop',
  Backend: 'backends|backend',
  'Databases & ORMs': 'databases',
  'AI & Data': 'AI and data',
  'DevOps & Cloud': 'DevOps and cloud|DevOps',
  Tools: 'developer tools',
  'Media & Design': 'media and design',
};

function logoUrl(skill: Skill, mode: 'dark' | 'light') {
  if ('url' in skill) return (mode === 'dark' && skill.darkUrl) || skill.url;
  const color = mode === 'light' ? (skill.lightColor ?? skill.color) : skill.color;
  return `https://cdn.simpleicons.org/${skill.slug}/${color}`;
}

// "Tesseract OCR" → "TO", "Seaborn" → "Se". The fallback when a logo fails to load,
// so a tile never renders with an empty icon slot.
const monogram = (name: string) => {
  const words = name.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2);
};

function SkillLogo({ skill, large = false }: { skill: Skill; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const light = logoUrl(skill, 'light');
  const dark = logoUrl(skill, 'dark');

  if (failed) {
    return (
      <span
        aria-hidden="true"
        className={`${large ? 'w-11 h-11 text-sm' : 'w-8 h-8 text-[11px]'} flex items-center justify-center rounded-md bg-brand-primary/10 ring-1 ring-brand-primary/30 font-mono font-bold text-brand-primary group-hover:scale-110 transition-transform`}
      >
        {monogram(skill.name)}
      </span>
    );
  }

  const imgClass = `${large ? 'w-11 h-11' : 'w-8 h-8'} object-contain group-hover:scale-110 transition-transform`;
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
        className={`${imgClass} hidden dark:block ${'url' in skill && skill.darkInvert ? 'brightness-0 invert' : ''} ${'url' in skill && skill.darkBoost ? 'brightness-200' : ''}`}
      />
    </>
  );
}

// Skill names that appear under a different name in the repo stacks.
const STACK_ALIASES: Record<string, string[]> = {
  'Tesseract OCR': ['Tesseract.js'],
  SQL: ['PostgreSQL', 'MySQL', 'MS SQL Server'],
};

interface Usage {
  /** Repos whose stack includes the skill. */
  repos: string[];
  /** Tools most often used alongside it in those repos. */
  pairs: string[];
}

function usageOf(name: string): Usage {
  const keys = STACK_ALIASES[name] ?? [name];
  const repos = Object.keys(REPO_STACKS).filter((repo) => REPO_STACKS[repo].some((t) => keys.includes(t)));
  const counts = new Map<string, number>();
  for (const repo of repos) {
    for (const tool of REPO_STACKS[repo]) {
      if (!keys.includes(tool) && tool !== name) counts.set(tool, (counts.get(tool) ?? 0) + 1);
    }
  }
  const pairs = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tool]) => tool);
  return { repos, pairs };
}

const USAGE = new Map(groups.flatMap((g) => g.items).map((s) => [s.name, usageOf(s.name)]));

interface ActiveSkill {
  skill: Skill;
  group: string;
}

// The panel a toolkit card opens: what the tool is for, which of my projects use it, and
// what it usually ships with. A bottom sheet on phones, a centred card
// on larger screens. The logo flies in from the card (shared layoutId).
function SkillDetail({ active, onClose }: { active: ActiveSkill; onClose: () => void }) {
  const { skill, group } = active;
  const usage = USAGE.get(skill.name) ?? { repos: [], pairs: [] };
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [onClose]);

  const seeProjects = () => {
    onClose();
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm dark:bg-[#04040e]/70"
      />
      <div className="pointer-events-none fixed inset-0 z-[71] flex items-end justify-center p-3 sm:items-center sm:p-6">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="skill-detail-title"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_64px_-12px_rgba(2,12,27,0.45)] dark:border-brand-primary/25 dark:bg-[#0c0c1c]"
        >
          {/* Accent glow */}
          <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-primary/20 blur-3xl" />

          <div className="relative p-6">
            <div className="flex items-start gap-4">
              <motion.div
                layoutId={`skill-logo-${skill.name}`}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80"
              >
                <SkillLogo skill={skill} large />
              </motion.div>
              <div className="min-w-0 flex-1 pt-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-primary">{group}</p>
                <h3 id="skill-detail-title" className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {skill.name}
                </h3>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 -mt-2 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {SKILL_NOTES[skill.name] && (
              <p className="mt-5 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">{SKILL_NOTES[skill.name]}</p>
            )}

            {usage.repos.length > 0 && (
              <>
                <div className="mt-6">
                  <p className="font-mono text-[12px] text-slate-500 dark:text-slate-400">Where I&apos;ve used it</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {usage.repos.map((repo, i) => (
                      <motion.li
                        key={repo}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.04 }}
                        className="rounded-full border border-brand-primary/30 bg-brand-primary/5 px-2.5 py-1 text-[12px] text-brand-primary"
                      >
                        {repoDisplayName(repo)}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {usage.pairs.length > 0 && (
                  <div className="mt-5">
                    <p className="font-mono text-[12px] text-slate-500 dark:text-slate-400">Often paired with</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {usage.pairs.map((tool) => (
                        <li
                          key={tool}
                          className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700 dark:bg-white/[0.06] dark:text-slate-300"
                        >
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="button"
                  onClick={seeProjects}
                  className="mt-6 inline-flex items-center gap-1.5 font-mono text-[13px] text-brand-primary hover:underline underline-offset-4"
                >
                  See the projects <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>,
    document.body,
  );
}

export function Skills() {
  const [active, setActive] = useState<ActiveSkill | null>(null);
  const close = useCallback(() => setActive(null), []);

  return (
    <Section id="skills" title="My Toolkit">
      <p className="text-slate-500 dark:text-slate-400 max-w-2xl mb-14 text-[15px] leading-relaxed">
        Languages, frameworks, and tools I reach for when building real things.{' '}
        <span className="text-slate-500">Tap any card to see where I&apos;ve used it.</span>
      </p>

      <div className="space-y-14">
        {groups.map(group => (
          <div key={group.title}>
            <div className="flex items-center gap-3 mb-5">
              <h3
                data-narration-term={SPOKEN[group.title] ?? group.title}
                className="font-mono text-sm text-brand-primary whitespace-nowrap rounded"
              >
                {group.title}
              </h3>
              <span className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {group.items.map((skill, idx) => {
                return (
                  <motion.li
                    key={skill.name}
                    data-narration-term={SPOKEN[skill.name] ?? skill.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.25) }}
                    whileHover={{ y: -3 }}
                    className="rounded-md"
                  >
                    <button
                      type="button"
                      onClick={() => setActive({ skill, group: group.title })}
                      aria-haspopup="dialog"
                      aria-label={`${skill.name}: details`}
                      className="group relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden p-3 rounded-md bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-brand-primary/60 hover:shadow-[0_8px_20px_-12px] hover:shadow-brand-primary/40 transition-all cursor-pointer"
                    >
                      {/* Hover sheen */}
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand-primary/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      <motion.div layoutId={`skill-logo-${skill.name}`} className="w-9 h-9 flex items-center justify-center">
                        <SkillLogo skill={skill} />
                      </motion.div>
                      <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 text-center group-hover:text-brand-primary transition-colors">
                        {skill.name}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {active && <SkillDetail key={active.skill.name} active={active} onClose={close} />}
      </AnimatePresence>
    </Section>
  );
}
