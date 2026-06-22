import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Github, Linkedin, Facebook, Instagram, Discord, DiscordServer } from '../ui/BrandIcons';

const EMAIL = 'lakshan.kavishatt@gmail.com';

const socials = [
  { Icon: Github, href: 'https://github.com/MacroMaster101', label: 'GitHub' },
  { Icon: Linkedin, href: 'https://www.linkedin.com/in/kavisha-liyanage04/', label: 'LinkedIn' },
  { Icon: Facebook, href: 'https://www.facebook.com/kavisha.lakshan11/', label: 'Facebook' },
  { Icon: Instagram, href: 'https://www.instagram.com/kavisha_lakshan', label: 'Instagram' },
  { Icon: Discord, href: 'https://discord.com/users/507947944301953025', label: 'Discord Friend' },
  { Icon: DiscordServer, href: 'https://discord.gg/4ZdNrdMZhM', label: 'Discord Server' },
];

export function Contact() {
  return (
    <>
      <section id="contact" className="py-32 md:py-40 px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="max-w-[640px] mx-auto text-center"
        >
          <p className="font-mono text-brand-primary text-sm mb-4">08. What&apos;s Next?</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6 tracking-tight">
            Get In Touch
          </h2>
          <p className="text-[15px] md:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-12 max-w-md mx-auto">
            I&apos;m currently looking for internship opportunities — but my inbox is always open.
            Whether you have a question, a project idea, or just want to say hi, I&apos;ll do my best to get back to you.
          </p>
          <a
            href={`mailto:${EMAIL}`}
            className="group inline-flex items-center gap-2.5 px-8 py-4 text-sm md:text-base font-mono font-medium text-brand-primary border border-brand-primary rounded hover:bg-brand-primary/10 hover:-translate-y-1 hover:shadow-[6px_6px_0_0] hover:shadow-brand-primary/30 transition-all"
          >
            <Mail size={16} />
            Say Hello
          </a>

          {/* Mobile-only social row (desktop has the side rail) */}
          <ul className="lg:hidden mt-12 flex items-center justify-center gap-6 text-slate-500 dark:text-slate-400">
            {socials.map(({ Icon, href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="hover:text-brand-primary transition-colors"
                >
                  <Icon size={20} />
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${EMAIL}`} aria-label="Email" className="hover:text-brand-primary transition-colors">
                <Mail size={20} />
              </a>
            </li>
          </ul>
        </motion.div>
      </section>

      <footer className="py-8 px-6 text-center">
        <a
          href="https://github.com/MacroMaster101/kavisha_portfolio-V2"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-col items-center gap-1 font-mono text-xs text-slate-500 dark:text-slate-400 hover:text-brand-primary transition-colors"
        >
          <span>Designed &amp; Built by Kavisha Lakshan</span>
          <span className="opacity-70">© 2026 · v2</span>
        </a>
      </footer>
    </>
  );
}
