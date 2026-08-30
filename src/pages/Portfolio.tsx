import { Navbar } from '../components/ui/Navbar';
import { SideRails } from '../components/ui/SideRails';
import { PageBackground } from '../components/ui/PageBackground';
import { BottomNav } from '../components/ui/BottomNav';
import { Hero } from '../components/sections/Hero';
import { About } from '../components/sections/About';
import { Skills } from '../components/sections/Skills';
import { Projects } from '../components/sections/Projects';
import { Experience } from '../components/sections/Experience';
import { Education } from '../components/sections/Education';
import { Certifications } from '../components/sections/Certifications';
import { Blogs } from '../components/sections/Blogs';
import { Contact } from '../components/sections/Contact';

export function Portfolio({ interactiveReady }: { interactiveReady: boolean }) {
  return (
    <div className="relative bg-[#f6f7fb] dark:bg-[#030014] min-h-screen text-slate-900 dark:text-slate-300 selection:bg-brand-primary/20 transition-colors duration-300 font-sans">
      <a href="#main-content" className="fixed left-4 top-4 z-[200] -translate-y-24 rounded bg-brand-primary px-4 py-2 text-white focus:translate-y-0">
        Skip to content
      </a>
      <PageBackground animate={interactiveReady} />
      <Navbar />
      <SideRails />
      <BottomNav />
      <main id="main-content" tabIndex={-1} className="relative lg:px-[100px] xl:px-[120px] pb-24 lg:pb-0 focus:outline-none">
        <Hero interactiveReady={interactiveReady} />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Education />
        <Certifications />
        <Blogs />
        <Contact />
      </main>
    </div>
  );
}
