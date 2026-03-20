import { motion } from 'framer-motion';
import { Github, ExternalLink, Star, GitFork } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  image?: string;
  repoName?: string;
  githubUrl?: string;
  demoUrl?: string;
  category: string | string[];
  index: number;
  stars?: number;
  forks?: number;
  isFork?: boolean;
  allLanguages?: string[];
}

// Fallback chain: local jpg → local png → github opengraph → null (placeholder)
function buildFallbacks(repoName?: string, opengraph?: string): string[] {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const list: string[] = [];
  if (repoName) {
    list.push(`${base}/projects/${repoName}.jpg`);
    list.push(`${base}/projects/${repoName}.png`);
  }
  if (opengraph) list.push(opengraph);
  return list;
}

export function ProjectCard({
  title,
  description,
  tags,
  category,
  image,
  repoName,
  githubUrl,
  demoUrl,
  index,
  stars,
  forks,
  isFork,
  allLanguages = [],
}: ProjectCardProps) {
  const fallbacks = buildFallbacks(repoName, image);
  const [imgIndex, setImgIndex] = useState(0);
  const currentSrc = fallbacks[imgIndex];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group relative rounded-[40px] overflow-hidden bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500 flex flex-col h-full"
    >
      {/* Project Image — only rendered when an image is available */}
      {currentSrc && (
        <div className="h-64 w-full bg-slate-50 dark:bg-slate-800/30 relative overflow-hidden">
          <img
            src={currentSrc}
            alt={title}
            onError={() => setImgIndex(i => i + 1)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-8 flex flex-col flex-1">
        {/* Category badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Array.isArray(category) ? category : [category]).filter(Boolean).map(cat => (
            <span
              key={cat}
              className="px-3 py-1 text-xs font-bold tracking-wider bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary rounded-full border border-brand-primary/20 dark:border-brand-primary/30"
            >
              {cat}
            </span>
          ))}
          {isFork && (
            <span className="px-3 py-1 text-xs font-bold tracking-wider bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full border border-amber-200/50 dark:border-amber-600/30 flex items-center gap-1">
              <GitFork size={11} /> Forked
            </span>
          )}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-brand-primary transition-colors leading-none">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 font-normal line-clamp-3 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-8 mt-auto">
          {tags.map(tag => (
            <span
              key={tag}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-primary/30 transition-all duration-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Languages */}
        {allLanguages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {allLanguages.map(lang => (
              <span key={lang} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
                {lang}
              </span>
            ))}
          </div>
        )}

        {/* Stats bar */}
        {(stars !== undefined || forks !== undefined) && (
          <div className="flex items-center gap-4 mb-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
            {stars !== undefined && (
              <span className="flex items-center gap-1">
                <Star size={12} /> {stars}
              </span>
            )}
            {forks !== undefined && (
              <span className="flex items-center gap-1">
                <GitFork size={12} /> {forks}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-4">
          {demoUrl && (
            <Button
              size="sm"
              className="bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full px-6 transition-all duration-300 shadow-[0_0_20px_var(--brand-primary-glow)]"
              onClick={() => window.open(demoUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Demo
            </Button>
          )}
          {githubUrl && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full px-6 transition-all duration-300 border-2"
              onClick={() => window.open(githubUrl, '_blank')}
            >
              <Github className="w-4 h-4 mr-2" />
              Code
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
