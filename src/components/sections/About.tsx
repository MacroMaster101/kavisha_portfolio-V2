import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from '../ui/Section';
import { countShippedProjects, fetchPublicGithubRepos, readGithubRepoCache } from '../../lib/github';
import { PulseDot } from '../ui/PulseDot';

const FALLBACK_PROJECT_COUNT = 19;

const skills = [
  'TypeScript',
  'Next.js',
  'React Native',
  'Expo',
  'Supabase',
  'Drizzle ORM',
  'PostgreSQL',
  'Electron',
  'C# / .NET',
  'Docker',
  'Python',
  'GitHub Actions',
];

// Floating tech badges around the portrait — tighter offsets on mobile so they don't clip.
const FLOAT = { y: [0, -6, 0] };
const techBadges = [
  {
    label: 'React',
    position: '-top-2 -left-2 md:-top-3 md:-left-4',
    duration: 3.5,
    delay: 0,
    // React's cyan is too pale on the white light-mode badge; use react.dev's darker blue there.
    icon: (
      <>
        <img src="https://cdn.simpleicons.org/react/087EA4" alt="React" className="w-3.5 h-3.5 block dark:hidden" />
        <img src="https://cdn.simpleicons.org/react/61DAFB" alt="React" className="w-3.5 h-3.5 hidden dark:block" />
      </>
    ),
  },
  {
    label: 'Python',
    position: 'top-1/4 -right-3 md:-right-6',
    duration: 4,
    delay: 0.5,
    icon: <img src="https://cdn.simpleicons.org/python/3776AB" alt="Python" className="w-3.5 h-3.5" />,
  },
  {
    label: 'Node.js',
    position: 'bottom-1/4 -left-3 md:-left-7',
    duration: 4.2,
    delay: 1,
    icon: <img src="https://cdn.simpleicons.org/nodedotjs/5FA04E" alt="Node.js" className="w-3.5 h-3.5" />,
  },
];

export function About() {
  const [cachedRepos] = useState(readGithubRepoCache);
  const [projectsShipped, setProjectsShipped] = useState(() =>
    cachedRepos ? countShippedProjects(cachedRepos) : FALLBACK_PROJECT_COUNT,
  );

  // Shares Projects' request (see fetchPublicGithubRepos), and skips it when cached.
  useEffect(() => {
    if (cachedRepos) return;
    let active = true;
    fetchPublicGithubRepos()
      .then((repos) => { if (active) setProjectsShipped(countShippedProjects(repos)); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [cachedRepos]);

  const stats = [
    { value: String(projectsShipped), label: 'Projects shipped' },
    { value: '3rd', label: 'Year @ SLIIT' },
    { value: 'AI', label: 'Specialization' },
    { value: 'LK', label: 'Based in Sri Lanka' },
  ];

  return (
    <Section id="about" title="About Me">
      <div className="grid md:grid-cols-[3fr_2fr] gap-12 md:gap-16 items-start">
        {/* Left column: prose + stats + skills */}
        <div className="space-y-5 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
          <p>
            Hello! I&apos;m Kavisha, a third-year Information Technology undergraduate at SLIIT,
            specializing in Artificial Intelligence and based in Nittambuwa, Sri Lanka.
          </p>
          <p>
            I build full-stack web, mobile, and machine-learning products with a focus on useful interfaces,
            dependable backends, and real-world problem solving. My recent work includes{' '}
            <span className="text-brand-primary">Mazora Network</span>, a production community platform;{' '}
            <span className="text-brand-primary">Vero Salon</span>, a complete booking system;{' '}
            <span className="text-brand-primary">TravelGenie</span>, an AI-powered travel planner; and{' '}
            <span className="text-brand-primary">DengueRisk</span>, a public-health prediction project.
          </p>
          <p>
            Right now I&apos;m actively looking for a first internship where I can contribute to a real engineering team,
            keep learning, and help ship things people actually use.
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4" aria-live="polite">
            {stats.map((s, idx) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-3 rounded-md bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-brand-primary/50 transition-colors text-center"
              >
                <p className="font-mono text-xl md:text-2xl font-bold text-brand-primary leading-none">{s.value}</p>
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">{s.label}</p>
              </motion.div>
            ))}
          </div>
          {/* Skills strip */}
          <div className="pt-4">
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-2">A few technologies I&apos;ve been working with recently:</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] font-mono text-slate-600 dark:text-slate-400">
              {skills.map(s => (
                <li key={s} className="flex items-center gap-2">
                  <span className="text-brand-primary text-xs">▹</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column: portrait with floating tech badges */}
        <div className="relative w-full max-w-[320px] mx-auto md:mx-0 md:justify-self-end pt-6 pb-10 px-6">
          <div className="group relative">
            {/* Offset border frame */}
            <div className="absolute inset-0 translate-x-4 translate-y-4 border-2 border-brand-primary rounded transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />

            {/* Image with subtle brand tint on hover */}
            <div className="relative rounded overflow-hidden">
              <div className="absolute inset-0 bg-brand-primary/25 dark:bg-brand-primary/35 mix-blend-multiply group-hover:bg-transparent transition-colors duration-300 z-10" />
              <img
                src={`${import.meta.env.BASE_URL}portrait.webp`}
                alt="Kavisha Liyanage"
                width="800"
                height="1067"
                loading="lazy"
                decoding="async"
                className="block w-full h-auto rounded group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>

            {techBadges.map(({ label, position, duration, delay, icon }) => (
              <motion.div
                key={label}
                animate={FLOAT}
                transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute ${position} z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md shadow-slate-900/10 dark:shadow-black/40`}
              >
                {icon}
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{label}</span>
              </motion.div>
            ))}

            <motion.div
              animate={FLOAT}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-brand-primary text-white shadow-lg shadow-brand-primary/40"
            >
              <span className="text-[10px]">✦</span>
              <span className="font-mono text-[11px] font-medium">AI / ML</span>
            </motion.div>
          </div>

          {/* Available pulse dot at top */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute -top-1 right-2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/40 backdrop-blur-sm"
          >
            <PulseDot className="h-2 w-2" />
            <span className="font-mono text-[10px] text-green-600 dark:text-green-400">Available</span>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
