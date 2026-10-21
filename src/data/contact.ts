import { Github, Linkedin, Facebook, Instagram, Discord, DiscordServer } from '../components/ui/BrandIcons';

// Single source of truth for contact details and links used across the site. The
// JSON-LD `sameAs` list in index.html can't import this, so keep it in sync by hand.
export const EMAIL = 'lakshan.kavishatt@gmail.com';
export const GITHUB_URL = 'https://github.com/MacroMaster101';
export const CV_URL = `${import.meta.env.BASE_URL}Kavisha_Liyanage_CV.pdf`;

export const SOCIALS = [
  { Icon: Github, href: GITHUB_URL, label: 'GitHub' },
  { Icon: Linkedin, href: 'https://www.linkedin.com/in/kavisha-liyanage04/', label: 'LinkedIn' },
  { Icon: Facebook, href: 'https://www.facebook.com/kavisha.lakshan11/', label: 'Facebook' },
  { Icon: Instagram, href: 'https://www.instagram.com/kavisha_lakshan', label: 'Instagram' },
  { Icon: Discord, href: 'https://discord.com/users/507947944301953025', label: 'Discord Friend' },
  { Icon: DiscordServer, href: 'https://discord.gg/4ZdNrdMZhM', label: 'Discord Server' },
];
