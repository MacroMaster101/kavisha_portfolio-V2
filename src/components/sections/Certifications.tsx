import { motion } from 'framer-motion';
import { Award, Clock } from 'lucide-react';
import { Section } from '../ui/Section';

export function Certifications() {
  return (
    <Section id="certifications" className="transition-colors duration-300">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Certifications</h2>
        <div className="h-2 w-24 bg-brand-primary mx-auto rounded-full" />
      </div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-[40px] p-12 text-center"
        >
          <div className="w-20 h-20 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Award size={36} className="text-brand-primary" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Not Yet — Working On It!
          </h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto mb-8">
            I'm currently focused on completing coursework and building projects. Certifications
            are in my roadmap — this section will be updated as I earn them.
          </p>
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary font-semibold text-sm tracking-wide">
            <Clock size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
            In Progress
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
