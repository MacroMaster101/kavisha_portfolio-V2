import { Github, Linkedin, Facebook, Instagram, Discord, DiscordServer } from '../components/ui/BrandIcons';

// Single source of truth for contact details. These are rendered in two places —
// the fixed side rails and the Contact section — which previously each kept their
// own byte-identical copy, so changing a handle meant remembering to edit both.
export const EMAIL = 'lakshan.kavishatt@gmail.com';

export const SOCIALS = [
  { Icon: Github, href: 'https://github.com/MacroMaster101', label: 'GitHub' },
  { Icon: Linkedin, href: 'https://www.linkedin.com/in/kavisha-liyanage04/', label: 'LinkedIn' },
  { Icon: Facebook, href: 'https://www.facebook.com/kavisha.lakshan11/', label: 'Facebook' },
  { Icon: Instagram, href: 'https://www.instagram.com/kavisha_lakshan', label: 'Instagram' },
  { Icon: Discord, href: 'https://discord.com/users/507947944301953025', label: 'Discord Friend' },
  { Icon: DiscordServer, href: 'https://discord.gg/4ZdNrdMZhM', label: 'Discord Server' },
];
