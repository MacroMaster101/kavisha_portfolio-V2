import { Navbar } from '../components/ui/Navbar';
import { Hero } from '../components/sections/Hero';
import { About } from '../components/sections/About';
import { Skills } from '../components/sections/Skills';
import { Projects } from '../components/sections/Projects';
import { Experience } from '../components/sections/Experience';
import { Education } from '../components/sections/Education';
import { Certifications } from '../components/sections/Certifications';
import { Blogs } from '../components/sections/Blogs';
import { Contact } from '../components/sections/Contact';

export function Portfolio() {
  return (
    <div className="bg-white dark:bg-[#030014] min-h-screen text-slate-900 dark:text-gray-100 selection:bg-brand-primary/20 transition-colors duration-300 overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
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
