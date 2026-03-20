import { Section } from '../ui/Section';
import { SkillCard } from '../ui/SkillCard';
import { Brain, Code2, Layout, Terminal, Paintbrush } from 'lucide-react';

export function Skills() {
  const skillCategories = [
    {
      title: 'Programming',
      icon: Code2,
      skills: ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'SQL'],
    },
    {
      title: 'Web Development',
      icon: Layout,
      skills: ['React', 'Node.js', 'Spring Boot', 'Tailwind CSS', 'REST APIs', 'Django', 'Flask'],
    },
    {
      title: 'AI & ML',
      icon: Brain,
      skills: ['TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'NumPy', 'Pandas', 'OpenCV'],
    },
    {
      title: 'Tools & DB',
      icon: Terminal,
      skills: ['Git', 'Docker', 'MySQL', 'MongoDB', 'PostgreSQL', 'VS Code', 'IntelliJ IDEA'],
    },
    {
      title: 'Creative Design',
      icon: Paintbrush,
      skills: ['Photoshop', 'Canva', 'Figma'],
    },
  ];

  return (
    <Section id="skills" className="transition-colors duration-300">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Skills</h2>
        <div className="h-2 w-24 bg-brand-primary mx-auto rounded-full" />
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mt-8 font-normal leading-relaxed">
          The technical stack I leverage to transform concepts into reality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {skillCategories.map((category, index) => (
          <SkillCard key={category.title} {...category} delay={index * 0.1} />
        ))}
      </div>
    </Section>
  );
}
