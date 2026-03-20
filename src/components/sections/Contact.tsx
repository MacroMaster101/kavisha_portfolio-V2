import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Facebook, Instagram, Send } from 'lucide-react';
import { Section } from '../ui/Section';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

const socialLinks = [
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/kavisha-liyanage04/',
  },
  {
    icon: Facebook,
    label: 'Facebook',
    href: 'https://www.facebook.com/kavisha.lakshan11/',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    href: 'https://www.instagram.com/kavisha_lakshan',
  },
];

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID as string | undefined;

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!FORMSPREE_ID) {
      // Fallback: open email client if Formspree not configured
      const subject = encodeURIComponent(`Portfolio Contact from ${form.name}`);
      const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`);
      window.location.href = `mailto:lakshan.kavishatt@gmail.com?subject=${subject}&body=${body}`;
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message }),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Section id="contact" className="transition-colors duration-300">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Get In Touch</h2>
          <div className="h-2 w-24 bg-brand-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                Let's work together
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                I'm always open to discussing new projects, creative ideas, or opportunities to be part of something great. Whether you have a question or just want to say hi, feel free to reach out!
              </p>
            </div>

            <div className="flex items-center gap-4 p-6 bg-white dark:bg-slate-900/50 rounded-[28px] border border-slate-200 dark:border-slate-800 group hover:shadow-lg hover:shadow-brand-primary/10 transition-all">
              <div className="w-14 h-14 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-2xl flex items-center justify-center group-hover:bg-brand-primary transition-all duration-300 flex-shrink-0">
                <Mail size={24} className="text-brand-primary group-hover:text-white transition-all duration-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <a
                  href="mailto:lakshan.kavishatt@gmail.com"
                  className="text-slate-900 dark:text-white font-semibold hover:text-brand-primary transition-colors"
                >
                  lakshan.kavishatt@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 bg-white dark:bg-slate-900/50 rounded-[28px] border border-slate-200 dark:border-slate-800 group hover:shadow-lg hover:shadow-brand-primary/10 transition-all">
              <div className="w-14 h-14 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-2xl flex items-center justify-center group-hover:bg-brand-primary transition-all duration-300 flex-shrink-0">
                <Github size={24} className="text-brand-primary group-hover:text-white transition-all duration-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">GitHub</p>
                <a
                  href="https://github.com/MacroMaster101"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 dark:text-white font-semibold hover:text-brand-primary transition-colors"
                >
                  github.com/MacroMaster101
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Social Media</p>
              <div className="flex items-center gap-4">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    whileHover={{ scale: 1.15, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-primary hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/20 transition-all duration-300"
                  >
                    <Icon size={20} />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 space-y-6"
            >
              <Input
                label="Name"
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Textarea
                label="Message"
                name="message"
                placeholder="Tell me about your project or just say hello..."
                value={form.message}
                onChange={handleChange}
                required
              />

              {status === 'success' && (
                <p className="text-green-500 font-semibold text-sm text-center">
                  ✓ Message sent! I'll get back to you soon.
                </p>
              )}
              {status === 'error' && (
                <p className="text-red-500 font-semibold text-sm text-center">
                  Something went wrong. Try emailing me directly.
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                disabled={status === 'sending' || status === 'success'}
              >
                {status === 'sending' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : status === 'success' ? (
                  <>✓ Sent</>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © 2026 <span className="text-brand-primary font-semibold">Kavisha Lakshan</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
