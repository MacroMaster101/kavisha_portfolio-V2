import { motion } from 'framer-motion';
import { Section } from '../ui/Section';

const stats = [
  { value: '5+', label: 'Projects shipped' },
  { value: '2nd', label: 'Year @ SLIIT' },
  { value: 'AI', label: 'Specialization' },
  { value: 'LK', label: 'Based in Sri Lanka' },
];

const skills = [
  'TypeScript',
  'Next.js',
  'React Native',
  'Expo',
  'React',
  'Node.js',
  'Supabase',
  'Neon',
  'PostgreSQL',
  'Python',
];

export function About() {
  return (
    <Section id="about" num="01." title="About Me">
      <div className="grid md:grid-cols-[3fr_2fr] gap-12 md:gap-16 items-start">
        {/* Left column: prose + tags + stats + skills */}
        <div className="space-y-5 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
          <p>
            Hello! My name is Kavisha and I&apos;m a software engineering &amp; AI intern candidate based in Nittambuwa, Sri Lanka.
            I enjoy building things that live on the web and on mobile — whether that&apos;s a slick UI,
            a secure backend, or a prediction model that turns raw data into something useful.
          </p>
          <p>
            I&apos;m pursuing a <span className="text-slate-900 dark:text-slate-100">B.Sc. (Hons) in Information Technology</span> at{' '}
            <a
              href="https://sliit.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:underline underline-offset-4"
            >
              SLIIT
            </a>
            , specializing in Artificial Intelligence. Along the way I&apos;ve shipped projects like{' '}
            <span className="text-brand-primary">TravelGenie</span> (full-stack web + mobile travel planner),{' '}
            <span className="text-brand-primary">DengueRisk</span> (ML for public health), and a{' '}
            <span className="text-brand-primary">secure campus E-Voting system</span>.
          </p>
          <p>
            Right now I&apos;m actively looking for a first internship where I can contribute to a real engineering team,
            keep learning, and help ship things people actually use.
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
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
                src={`${import.meta.env.BASE_URL}image.jpg`}
                alt="Kavisha Liyanage"
                className="block w-full h-auto rounded group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>

            {/* Floating tech badges — tighter offsets on mobile so they don't clip the viewport */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-2 -left-2 md:-top-3 md:-left-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md shadow-slate-900/10 dark:shadow-black/40"
            >
              <img src="https://cdn.simpleicons.org/react/61DAFB" alt="React" className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">React</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-1/4 -right-3 md:-right-6 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md shadow-slate-900/10 dark:shadow-black/40"
            >
              <img src="https://cdn.simpleicons.org/python/3776AB" alt="Python" className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">Python</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-1/4 -left-3 md:-left-7 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md shadow-slate-900/10 dark:shadow-black/40"
            >
              <img src="https://cdn.simpleicons.org/nodedotjs/5FA04E" alt="Node.js" className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">Node.js</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
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
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="font-mono text-[10px] text-green-600 dark:text-green-400">Available</span>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
