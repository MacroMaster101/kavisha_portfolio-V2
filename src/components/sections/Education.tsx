import { Section } from '../ui/Section';

interface Edu {
  degree: string;
  institution: string;
  period: string;
  location: string;
  description: string;
  badges?: string[];
}

const education: Edu[] = [
  {
    degree: 'B.Sc. (Hons) in Information Technology',
    institution: 'Sri Lanka Institute of Information Technology (SLIIT)',
    period: '2024 — Present',
    location: 'Malabe, Sri Lanka',
    description:
      'Specializing in Artificial Intelligence. Relevant coursework: OOP, Data Structures & Algorithms, Database Management Systems, Web Development, Software Engineering, AI, and Machine Learning Fundamentals. IEEE Student Member.',
    badges: ['AI Specialization', 'IEEE Member'],
  },
  {
    degree: 'G.C.E. Advanced Level',
    institution: "St. Mary's National College, Veyangoda",
    period: '2021 — 2023',
    location: 'Veyangoda, Sri Lanka',
    description:
      'Physical Science stream. The analytical foundation behind my approach to problem solving.',
    badges: ['Physical Science'],
  },
  {
    degree: 'G.C.E. Ordinary Level',
    institution: "St. Mary's National College, Veyangoda",
    period: '2020',
    location: 'Veyangoda, Sri Lanka',
    description: 'Completed 9 subjects with a strong focus on science and mathematics — where it all started.',
  },
];

export function Education() {
  return (
    <Section id="education" num="05." title="Academic Journey">
      <ol className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 md:ml-4 space-y-12">
        {education.map((edu, i) => (
          <li key={i} className="relative pl-8 md:pl-12 group">
            {/* Marker */}
            <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-[#030014] border-2 border-brand-primary group-hover:scale-125 transition-transform" />

            <p className="font-mono text-sm text-brand-primary mb-1">{edu.period}</p>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {edu.degree}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {edu.institution} <span className="text-slate-400 dark:text-slate-600">·</span> {edu.location}
            </p>
            <p className="mt-3 text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              {edu.description}
            </p>
            {edu.badges && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {edu.badges.map(b => (
                  <li
                    key={b}
                    className="px-3 py-1 text-xs font-mono rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
