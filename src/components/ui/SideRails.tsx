import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Github, Linkedin, Facebook, Instagram, Discord, DiscordServer } from './BrandIcons';

const socials = [
  { Icon: Github, href: 'https://github.com/MacroMaster101', label: 'GitHub' },
  { Icon: Linkedin, href: 'https://www.linkedin.com/in/kavisha-liyanage04/', label: 'LinkedIn' },
  { Icon: Facebook, href: 'https://www.facebook.com/kavisha.lakshan11/', label: 'Facebook' },
  { Icon: Instagram, href: 'https://www.instagram.com/kavisha_lakshan', label: 'Instagram' },
  { Icon: Discord, href: 'https://discord.com/users/507947944301953025', label: 'Discord Friend' },
  { Icon: DiscordServer, href: 'https://discord.gg/4ZdNrdMZhM', label: 'Discord Server' },
];

const EMAIL = 'lakshan.kavishatt@gmail.com';

export function SideRails() {
  return (
    <>
      {/* Left rail — social icons */}
      <motion.aside
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="hidden lg:flex fixed left-10 xl:left-12 bottom-0 z-30 flex-col items-center gap-6 after:content-[''] after:block after:w-px after:h-24 after:bg-slate-400 dark:after:bg-slate-500"
      >
        <ul className="flex flex-col items-center gap-5 text-slate-500 dark:text-slate-400">
          {socials.map(({ Icon, href, label }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="inline-block p-1 hover:text-brand-primary hover:-translate-y-1 transition-all duration-200"
              >
                <Icon size={20} />
              </a>
            </li>
          ))}
        </ul>
      </motion.aside>

      {/* Right rail — vertical email */}
      <motion.aside
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="hidden lg:flex fixed right-10 xl:right-12 bottom-0 z-30 flex-col items-center gap-6 after:content-[''] after:block after:w-px after:h-24 after:bg-slate-400 dark:after:bg-slate-500"
      >
        <a
          href={`mailto:${EMAIL}`}
          className="font-mono text-xs tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-brand-primary hover:-translate-y-1 transition-all duration-200 [writing-mode:vertical-rl] flex items-center gap-2"
        >
          <Mail size={14} />
          {EMAIL}
        </a>
      </motion.aside>
    </>
  );
}
