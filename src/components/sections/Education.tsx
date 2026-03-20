import { Section } from '../ui/Section';
import { TimelineItem } from '../ui/TimelineItem';

export function Education() {
  const education = [
    {
      degree: 'Bachelor of Science (Honours) in Information Technology',
      institution: 'Sri Lanka Institute of Information Technology (SLIIT)',
      period: '2024 – Present',
      location: 'Malabe, Sri Lanka',
      description:
        'Specializing in Artificial Intelligence. Focused on software engineering, full-stack web development, machine learning, and data science. Actively working on team-based academic projects using agile methodologies.',
      badges: ['AI Specialization', 'Full Stack Development', 'Agile / Scrum', 'IEEE Student Member'],
    },
    {
      degree: 'G.C.E. Advanced Level',
      institution: "St. Mary's National College, Veyangoda",
      period: '2021 – 2023',
      location: 'Veyangoda, Sri Lanka',
      description:
        'Completed the G.C.E. Advanced Level in the Physical Science stream, building a strong foundation in Mathematics, Physics, and Combined Mathematics that underpins computational problem solving.',
      badges: ['Physical Science Stream', 'Combined Mathematics', 'Physics'],
    },
    {
      degree: 'G.C.E. Ordinary Level',
      institution: "St. Mary's National College, Veyangoda",
      period: '2016 – 2021',
      location: 'Veyangoda, Sri Lanka',
      description:
        'Successfully completed G.C.E. Ordinary Level with results across nine subjects, demonstrating a broad academic foundation with an early aptitude for science and mathematics.',
      badges: ['9 Subjects', 'Science', 'Mathematics'],
    },
  ];

  return (
    <Section id="education" className="transition-colors duration-300">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Academic Journey</h2>
        <div className="h-2 w-24 bg-brand-primary mx-auto rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="space-y-0">
          {education.map((item, index) => (
            <TimelineItem key={index} {...item} index={index} />
          ))}
        </div>
      </div>
    </Section>
  );
}
