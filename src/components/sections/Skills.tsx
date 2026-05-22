import { Section } from '../ui/Section';
import { motion } from 'framer-motion';

interface Skill {
  name: string;
  slug?: string; // simple-icons slug (cdn.simpleicons.org)
  color?: string; // hex without # — used in dark mode (also used in light if lightColor not set)
  lightColor?: string; // optional override hex for light mode (useful when `color` is white)
  url?: string; // full URL override — used when simple-icons doesn't have the logo
}

interface SkillGroup {
  title: string;
  items: Skill[];
}

// simple-icons.org — slug = lowercase name, special chars removed
// Brand colors are auto-tinted by the CDN.
// devicon is a fallback for logos that Simple Icons removed (Adobe, Canva, MS SQL Server, etc.)
const devicon = (name: string, variant = 'original') =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-${variant}.svg`;

const groups: SkillGroup[] = [
  {
    title: 'Languages',
    items: [
      { name: 'Java', url: devicon('java') },
      { name: 'Python', slug: 'python', color: '3776AB' },
      { name: 'JavaScript', slug: 'javascript', color: 'F7DF1E' },
      { name: 'TypeScript', slug: 'typescript', color: '3178C6' },
      { name: 'SQL', url: devicon('mysql') },
    ],
  },
  {
    title: 'Frontend',
    items: [
      { name: 'React', slug: 'react', color: '61DAFB' },
      { name: 'React Native', slug: 'react', color: '61DAFB' },
      { name: 'Expo', slug: 'expo', color: 'FFFFFF', lightColor: '000020' },
      { name: 'Vite', slug: 'vite', color: '646CFF' },
      { name: 'Tailwind CSS', slug: 'tailwindcss', color: '06B6D4' },
      { name: 'HTML', slug: 'html5', color: 'E34F26' },
      { name: 'CSS', url: devicon('css3') },
    ],
  },
  {
    title: 'Backend',
    items: [
      { name: 'Node.js', slug: 'nodedotjs', color: '5FA04E' },
      { name: 'Express', url: devicon('express') },
      { name: 'Flask', slug: 'flask', color: 'FFFFFF', lightColor: '000000' },
      { name: 'Spring Boot', slug: 'springboot', color: '6DB33F' },
      { name: 'REST APIs', slug: 'fastapi', color: '009688' },
      { name: 'JWT', slug: 'jsonwebtokens', color: 'D63AFF' },
    ],
  },
  {
    title: 'Databases',
    items: [
      { name: 'PostgreSQL', slug: 'postgresql', color: '4169E1' },
      { name: 'MongoDB', slug: 'mongodb', color: '47A248' },
      { name: 'MySQL', slug: 'mysql', color: '4479A1' },
      { name: 'MS SQL Server', url: devicon('microsoftsqlserver') },
      { name: 'Mongoose', slug: 'mongoose', color: '880000' },
    ],
  },
  {
    title: 'AI & Data',
    items: [
      { name: 'Pandas', slug: 'pandas', color: '150458' },
      { name: 'NumPy', slug: 'numpy', color: '013243' },
      { name: 'Scikit-learn', slug: 'scikitlearn', color: 'F7931E' },
      { name: 'Matplotlib', url: devicon('matplotlib') },
      { name: 'OpenCV', slug: 'opencv', color: '5C3EE8' },
      { name: 'Jupyter', slug: 'jupyter', color: 'F37626' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { name: 'Git', slug: 'git', color: 'F05032' },
      { name: 'GitHub', slug: 'github', color: 'FFFFFF', lightColor: '181717' },
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
  if (skill.url) return skill.url;
  if (!skill.slug) return '';
  const color = mode === 'light' ? (skill.lightColor ?? skill.color) : skill.color;
  return color
    ? `https://cdn.simpleicons.org/${skill.slug}/${color}`
    : `https://cdn.simpleicons.org/${skill.slug}`;
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
                  className="group flex flex-col items-center justify-center gap-2 p-3 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-brand-primary/60 hover:shadow-[0_8px_20px_-12px] hover:shadow-brand-primary/40 transition-all"
                >
                  <div className="w-9 h-9 flex items-center justify-center">
                    {/* Light-mode variant (hidden in dark) */}
                    <img
                      src={logoUrl(skill, 'light')}
                      alt={`${skill.name} logo`}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-8 h-8 object-contain group-hover:scale-110 transition-transform block dark:hidden"
                    />
                    {/* Dark-mode variant */}
                    <img
                      src={logoUrl(skill, 'dark')}
                      alt={`${skill.name} logo`}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-8 h-8 object-contain group-hover:scale-110 transition-transform hidden dark:block"
                    />
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
