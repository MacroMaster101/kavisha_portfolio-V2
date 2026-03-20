import { Section } from '../ui/Section';
import { Code2, Layers, Cpu, GitMerge } from 'lucide-react';
import { motion } from 'framer-motion';

const interests = [
  {
    icon: Cpu,
    label: 'AI & Machine Learning',
    desc: 'Developing intelligent systems that learn from real-world data',
  },
  {
    icon: Layers,
    label: 'Full Stack Development',
    desc: 'Building end-to-end web applications from database to UI',
  },
  {
    icon: Code2,
    label: 'Software Engineering',
    desc: 'Engineering robust systems through clean code and best practices',
  },
  {
    icon: GitMerge,
    label: 'Open Source & Collaboration',
    desc: 'Contributing to collaborative projects and building in public on GitHub',
  },
];

export function About() {
  return (
    <Section id="about" className="transition-colors duration-300">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">About Me</h2>
        <div className="h-2 w-24 bg-brand-primary mx-auto rounded-full" />
      </div>

      <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-start">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed text-lg"
        >
          <p className="font-semibold text-slate-900 dark:text-white">
            I am <span className="text-brand-primary">J.L. Kavisha Lakshan Liyanage</span>, a passionate{' '}
            <span className="text-brand-primary">Information Technology undergraduate</span> at the Sri Lanka
            Institute of Information Technology (SLIIT), specializing in{' '}
            <span className="text-brand-primary">Artificial Intelligence</span>.
          </p>
          <p>
            I thrive on building full-stack web applications and exploring AI/ML solutions that
            solve real-world problems. From crafting responsive front-ends with React to designing
            robust back-end APIs with Java and Node.js — I love every part of the development
            lifecycle.
          </p>
          <p>
            As an <strong className="text-slate-700 dark:text-slate-300">IEEE Student Member</strong>, I
            actively engage with the tech community and stay current with emerging technologies.
            I&apos;m focused on building a strong project portfolio and am currently seeking
            internship opportunities where I can contribute and grow.
          </p>
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary font-semibold text-sm tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
            Available for Internships
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {interests.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/5 transition-all group"
            >
              <item.icon className="w-10 h-10 text-brand-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{item.label}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
