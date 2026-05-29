import { motion } from 'framer-motion';
import { ExternalLink, Star, GitFork, ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { Github } from './BrandIcons';

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
  const [imgFailed, setImgFailed] = useState(false);
  const currentSrc = fallbacks[imgIndex];
  const cats = (Array.isArray(category) ? category : [category]).filter(Boolean);

  return (
    <motion.article
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 hover:border-brand-primary/40 hover:shadow-xl hover:shadow-brand-primary/5 transition-all overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="aspect-[16/9] w-full bg-white dark:bg-slate-900 overflow-hidden relative">
        {currentSrc && !imgFailed ? (
          <img
            src={currentSrc}
            alt={title}
            onError={() => {
              if (imgIndex < fallbacks.length - 1) setImgIndex(i => i + 1);
              else setImgFailed(true);
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
            <ImageIcon size={32} />
          </div>
        )}
        {isFork && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100/90 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 backdrop-blur">
            <GitFork size={10} /> Forked
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Categories */}
        {cats.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cats.slice(0, 2).map(c => (
              <span key={c} className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary tracking-wide uppercase">
                {c}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-brand-primary transition-colors">
          {title}
        </h3>

        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-5 line-clamp-2">
          {description}
        </p>

        {/* Languages */}
        {allLanguages.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4 text-[11px] text-slate-500 dark:text-slate-500">
            {allLanguages.slice(0, 4).map(lang => (
              <span key={lang} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                {lang}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-1 mb-5 text-[11px] text-slate-400 dark:text-slate-600">
            {tags.slice(0, 4).map(tag => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
            {stars !== undefined && stars > 0 && (
              <span className="flex items-center gap-1"><Star size={11} /> {stars}</span>
            )}
            {forks !== undefined && forks > 0 && (
              <span className="flex items-center gap-1"><GitFork size={11} /> {forks}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-brand-primary transition-colors"
                aria-label="View source"
              >
                <Github size={15} />
              </a>
            )}
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:gap-2 transition-all"
              >
                <ExternalLink size={12} /> Live
                <ArrowUpRight size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
