import { motion } from 'framer-motion';
import { Briefcase, MapPin, Code2, Sparkles, Mail } from 'lucide-react';
import { Section } from '../ui/Section';

const lookingFor = [
  'Software Engineering Intern',
  'AI / Machine Learning Intern',
  'Full-Stack Developer Intern',
  'Backend Engineering Intern',
];

const stack = [
  'React', 'Next.js', 'React Native', 'Expo', 'Node.js', 'Express', 'Prisma', 'Flask',
  'Java', 'Python', 'JavaScript', 'TypeScript', 'PostgreSQL', 'Supabase', 'Neon',
  'MongoDB', 'MS SQL Server', 'JWT',
];

const strengths = [
  {
    Icon: Code2,
    title: 'Project-tested skills',
    body: 'Shipped 5+ end-to-end projects spanning web, mobile, and ML — TravelGenie (web + app), DengueRisk, and a secure campus E-Voting system.',
  },
  {
    Icon: Sparkles,
    title: 'AI specialization',
    body: 'Pursuing a B.Sc. (Hons) in IT at SLIIT with an AI focus. Comfortable across full-stack development, REST APIs, and ML model workflows.',
  },
  {
    Icon: Briefcase,
    title: 'Ready to contribute',
    body: 'Strong problem-solving, teamwork, and communication. IEEE Student Member. Quick learner, eager to grow inside a real engineering team.',
  },
];

export function Experience() {
  return (
    <Section id="experience" num="04." title="Industry Experience">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-6 md:p-10 overflow-hidden"
      >
        {/* Decorative gradient blob */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-primary/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            <p className="font-mono text-sm text-green-500 dark:text-green-400">Available for Internships</p>
          </div>
          <span className="hidden sm:inline text-slate-400 dark:text-slate-600">·</span>
          <p className="flex items-center gap-2 font-mono text-sm text-slate-500 dark:text-slate-400">
            <MapPin size={14} /> Sri Lanka · Remote-friendly
          </p>
        </div>

        {/* Headline */}
        <h3 className="relative text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-4">
          Looking for my first internship.
        </h3>
        <p className="relative max-w-2xl text-[15px] md:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
          I haven&apos;t started industry work yet — but I&apos;ve been preparing for it.
          For the last two years I&apos;ve been shipping real projects across web, mobile, and AI,
          building the kind of habits and skills a team can actually use from day one. If you&apos;re
          hiring an intern, I&apos;d love to talk.
        </p>

        {/* Strengths grid */}
        <div className="relative grid md:grid-cols-3 gap-4 mb-10">
          {strengths.map(({ Icon, title, body }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: 0.1 + idx * 0.1 }}
              className="p-5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary/50 transition-colors"
            >
              <Icon size={22} className="text-brand-primary mb-3" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">{title}</h4>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>

        {/* Roles + Stack */}
        <div className="relative grid md:grid-cols-2 gap-8 mb-10">
          <div>
            <h4 className="font-mono text-xs text-brand-primary mb-3 uppercase tracking-widest">Roles I&apos;m open to</h4>
            <ul className="space-y-2">
              {lookingFor.map(role => (
                <li key={role} className="flex items-center gap-2 text-[14px] text-slate-700 dark:text-slate-300">
                  <span className="text-brand-primary text-xs">▹</span>
                  {role}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs text-brand-primary mb-3 uppercase tracking-widest">Stack I work in</h4>
            <ul className="flex flex-wrap gap-2">
              {stack.map(tech => (
                <li
                  key={tech}
                  className="px-2.5 py-1 text-[11px] font-mono rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row gap-3">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-mono font-medium text-white bg-brand-primary rounded hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px] hover:shadow-brand-primary/60 transition-all"
          >
            <Mail size={15} />
            Get in touch
          </a>
          <a
            href={`${import.meta.env.BASE_URL}Kavisha_Liyanage_CV.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-mono font-medium text-brand-primary border border-brand-primary rounded hover:bg-brand-primary/10 hover:-translate-y-0.5 transition-all"
          >
            View Resume
          </a>
        </div>
      </motion.div>
    </Section>
  );
}
