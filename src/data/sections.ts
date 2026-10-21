import {
  Home, User, Wrench, FolderGit2, Briefcase, GraduationCap, Award, BookOpen, Mail,
  type LucideIcon,
} from 'lucide-react';

export interface PageSection {
  /** Anchor id of the <section>. */
  id: string;
  /** Number shown before the section heading and in the desktop navbar. */
  num: string;
  /** Desktop navbar label. */
  navName: string;
  /** Mobile bottom-nav label. */
  shortName: string;
  Icon: LucideIcon;
}

// Every numbered section, in page order — the one place to add, remove or reorder a
// section. The navbar, the bottom nav and each section heading all read from here.
export const SECTIONS: readonly PageSection[] = [
  { id: 'about',          num: '01.', navName: 'About',          shortName: 'About',   Icon: User },
  { id: 'skills',         num: '02.', navName: 'Skills',         shortName: 'Skills',  Icon: Wrench },
  { id: 'projects',       num: '03.', navName: 'Projects',       shortName: 'Work',    Icon: FolderGit2 },
  { id: 'experience',     num: '04.', navName: 'Experience',     shortName: 'Exp',     Icon: Briefcase },
  { id: 'education',      num: '05.', navName: 'Education',      shortName: 'Edu',     Icon: GraduationCap },
  { id: 'certifications', num: '06.', navName: 'Certifications', shortName: 'Certs',   Icon: Award },
  { id: 'blogs',          num: '07.', navName: 'Writing',        shortName: 'Writing', Icon: BookOpen },
  { id: 'contact',        num: '08.', navName: 'Contact',        shortName: 'Contact', Icon: Mail },
];

// The top of the page: a nav destination, but not a numbered section.
export const HOME = { id: 'hero', shortName: 'Home', Icon: Home } as const;

export const sectionNum = (id: string) => SECTIONS.find((section) => section.id === id)?.num ?? '';
