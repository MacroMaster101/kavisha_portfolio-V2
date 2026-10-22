// Voice-guide script, one clip per page section, in page order. `id` matches the
// section's anchor AND the audio file name: src/assets/narration/<id>.mp3.
//
// The clips are pre-rendered with ElevenLabs (`npm run narration`) and shipped as
// static files, so no API key ever reaches the browser and playback costs nothing.
// After editing a `text` below, re-run the script to regenerate that clip.
//
// Written in the third person: this is a guide talking about Kavisha, not a synthetic
// voice pretending to be Kavisha.
interface NarrationClip {
  id: string;
  label: string;
  text: string;
}

export const NARRATION: NarrationClip[] = [
  {
    id: 'hero',
    label: 'Welcome',
    text:
      "Welcome to Kavisha Liyanage's portfolio. I'm your voice guide. Kavisha is a third-year undergraduate at the Sri Lanka Institute of Information Technology, specializing in Artificial Intelligence. He builds AI-powered applications, full-stack web and mobile apps, and secure APIs. Let me walk you through the site.",
  },
  {
    id: 'about',
    label: 'About',
    text:
      "About Kavisha. Based in Nittambuwa, Sri Lanka, Kavisha builds full-stack web, mobile, and machine-learning products, with a focus on useful interfaces, dependable backends, and real-world problem solving. Recent work includes Mazora Network, a production community platform; Vero Salon, a complete booking system; TravelGenie, an AI-powered travel planner; and DengueRisk, a public-health prediction project. Right now, he's looking for a first internship with a real engineering team.",
  },
  {
    id: 'skills',
    label: 'Skills',
    text:
      "The toolkit. Every technology here comes from a real project. It spans languages like TypeScript, Python, Java, and C sharp; frontend work with React and Next.js; mobile and desktop apps with React Native and Electron; and backends, databases, AI and data tooling, testing, DevOps and cloud, developer tools, and media and design.",
  },
  {
    id: 'projects',
    label: 'Projects',
    text:
      "Projects. This section is pulled live from GitHub, so it is always up to date. The featured projects come first, including Just For Fun, Mazora Network, the TravelGenie web and mobile apps, and the Vero Salon website. Below them is everything else he has shipped, which you can filter by category, from full-stack apps to Discord bots and machine-learning work.",
  },
  {
    id: 'experience',
    label: 'Experience',
    text:
      "Industry experience. Kavisha hasn't started industry work yet, but he has been preparing for it, spending the last three years shipping real projects across web, mobile, and AI. The roles of interest are software engineering, AI and machine learning, full-stack, and backend internships. If you're hiring an intern, he would love to talk.",
  },
  {
    id: 'education',
    label: 'Education',
    text:
      "The academic journey. Kavisha is reading for a Bachelor of Science Honours degree in Information Technology at SLIIT, specializing in Artificial Intelligence, and is an I triple E student member. Before that came Advanced Levels in the Physical Science stream, and Ordinary Levels, both at St. Mary's National College in Veyangoda.",
  },
  {
    id: 'certifications',
    label: 'Certifications',
    text:
      "Certifications and awards. This one is on the roadmap. The focus right now is on shipping real projects, and AI, machine learning, and cloud certifications will appear here as they're earned.",
  },
  {
    id: 'blogs',
    label: 'Writing',
    text:
      "Writing. Project breakdowns and engineering notes are coming soon, covering AI, full-stack development, and software engineering, including write-ups on the projects you've just seen.",
  },
  {
    id: 'contact',
    label: 'Contact',
    text:
      "And that's the tour. Kavisha is currently looking for internship opportunities, and his inbox is always open. Whether you have a question, a project idea, or just want to say hi, press Say Hello to get in touch. Thanks for listening.",
  },
];
