// Everything the portfolio chatbot knows about Kavisha. It is sent in full with every
// question (no retrieval step: the whole site fits easily in the context window) and
// prompt-cached, so repeat questions only pay a fraction of its cost.
//
// Written from the site's own copy (sections, voice-guide script) and the public GitHub
// repos. Keep it in step with the site: when a section or a project changes, update it
// here too, or the chatbot will describe the old version.
export const KNOWLEDGE = `
# Kavisha Liyanage

## Summary
- Full name: Kavisha Liyanage (also goes by Kavisha Lakshan). Website: https://kavisha.online
- Third-year undergraduate at SLIIT (Sri Lanka Institute of Information Technology), reading for a B.Sc. (Hons) in Information Technology, specializing in Artificial Intelligence.
- Based in Nittambuwa, Sri Lanka. Remote-friendly.
- Builds full-stack web, mobile, and machine-learning products, with a focus on useful interfaces, dependable backends, and real-world problem solving. Works mostly with React, Node.js, Java, and Python.
- Currently looking for a first internship with a real engineering team: Software Engineering, AI / Machine Learning, Full-Stack Developer, or Backend Engineering intern.
- Has not started industry work yet. For the last three years he has been shipping real projects across web, mobile, and AI.
- IEEE Student Member.
- Strengths: project-tested skills, strong problem-solving, teamwork, and communication; a quick learner, eager to grow inside a real engineering team.

## Contact
- Email: lakshan.kavishatt@gmail.com (best way to reach him; the site's "Say Hello" button opens it)
- Resume / CV (PDF): https://kavisha.online/Kavisha_Liyanage_CV.pdf
- GitHub: https://github.com/MacroMaster101
- LinkedIn: https://www.linkedin.com/in/kavisha-liyanage04/
- Discord server: https://discord.gg/4ZdNrdMZhM

## Education
- B.Sc. (Hons) in Information Technology, SLIIT, Malabe, Sri Lanka, 2024 to present. Specializing in Artificial Intelligence. Relevant coursework: OOP, Data Structures & Algorithms, Database Management Systems, Web Development, Software Engineering, AI, and Machine Learning Fundamentals.
- G.C.E. Advanced Level, St. Mary's National College, Veyangoda, 2021 to 2023. Physical Science stream.
- G.C.E. Ordinary Level, St. Mary's National College, Veyangoda, 2020. Completed 9 subjects with a strong focus on science and mathematics.

## Skills (every one comes from a real project)
- Languages: Java, Python, JavaScript, TypeScript, C#, SQL
- Frontend: React, Next.js, Vite, Tailwind CSS, Framer Motion, React Router, React Hook Form, Zod, Leaflet, HTML, CSS
- Mobile & desktop: React Native, Expo, Electron, .NET
- Backend: Node.js, Express, Spring Boot, Spring Security, Hibernate / JPA, Flask, Gunicorn, Discord.js, Discord.py, REST APIs, JWT
- Databases & ORMs: PostgreSQL, Supabase, Neon, MongoDB, MySQL, MS SQL Server, Prisma, Drizzle ORM, Sequelize, Mongoose, SQLAlchemy
- AI & data: Pandas, NumPy, Scikit-learn, Matplotlib, Seaborn, Jupyter, OpenCV, Gemini API, OpenAI API, Tesseract OCR
- Testing: Vitest, Jest, Playwright, Testing Library, JUnit, xUnit
- DevOps & cloud: Docker, GitHub Actions, AWS EC2, Cloudflare Tunnel, Vercel, Cloudinary, Resend, FFmpeg
- Tools: Git, GitHub, Maven, VS Code, IntelliJ IDEA, Postman, Figma

## Featured projects
- Mazora Network (https://mazora.us): the official Mazora Network community platform, a production Minecraft server website with live status, Discord integration, a storefront, member dashboards, and role-based staff administration. Next.js 15, React 19, TypeScript, Tailwind CSS, Drizzle ORM, Supabase Auth, PostgreSQL, Zod, Vercel Cron.
- Vero Salon website (https://verosalon.lk): full-stack salon booking platform. Online booking with race-proof slots, customer accounts, ratings and reviews, and a role-based admin and staff dashboard. Next.js 16, TypeScript, Supabase, PostgreSQL, Tailwind v4, Zod, React Hook Form, Resend, Vitest, Playwright.
- Just For Fun (J4FN) website (https://j4fn.site): official web hub for the Just For Fun Sri Lankan gaming crew, with a live YouTube feed, squad profiles, a challenge slot, a soundboard, and a full admin panel. Next.js, TypeScript, Supabase, Prisma, Neon PostgreSQL, Tailwind CSS, Spline.
- TravelGenie web (https://travel-genie-da1t.vercel.app): full-stack AI-powered travel planner with personalized destination recommendations, optimized itineraries, hotel suggestions, expense management, and travel budget analysis, using content-based filtering and rule-based decision logic. React + Vite frontend, Express API, PostgreSQL / Neon, Sequelize, a Flask ML service (Scikit-learn, Pandas), JWT auth, role-based admin, Leaflet and Google Maps.
- TravelGenie mobile app: React Native / Expo app with a Node.js, Express, and MongoDB backend for planning trips, managing expenses, exploring places and hotels, tracking transport, adding reviews, and receiving notifications through a secure REST API. Mongoose, JWT, Cloudinary, React Navigation.

## Other projects
- DengueRisk (https://macromaster101.github.io/DengueRisk/): machine-learning project that classifies dengue risk in Sri Lankan districts as high or low from weekly dengue case data and weather features, to help spot outbreak-prone periods early. Python, Pandas, Scikit-learn, NumPy, Matplotlib, Seaborn, Jupyter.
- Campus E-Voting system (web-voting-system): Spring Boot web voting system for academic award nominations, with role-based access, real-time monitoring, and email notifications. Spring Security, React + Vite, MS SQL Server, JWT, Hibernate / JPA, Recharts. Built by a 6-member team as a second-year project.
- Brakmasra (https://brakmasra.com): official BRAKMASRA merchandise storefront, a high-performance dark-luxury e-commerce platform. Next.js 16, React 19, TypeScript, Supabase, Drizzle ORM, Tailwind CSS, Zod, Vitest.
- AstraPair: a couples-first astrology platform for birth charts, compatibility insights, and AI-powered relationship readings. TypeScript.
- Pac-Man search visualizer (https://macromaster101.github.io/pacman-search-visualizer/): watch DFS, BFS, UCS, and A* search the Pac-Man maze live in the browser. CS188 Python search code running on Pyodide / WebAssembly, with compare and play modes.
- Vero Salon mobile app: React Native + Expo app for Vero Salon with role-based dashboards for customers, staff, and admins, real-time Supabase chat, a live scheduling and booking wizard, and push notifications. TypeScript, Expo Router, Reanimated, Zod, Jest.
- Weekly report dashboard (https://weekly-report-dashboard-six.vercel.app): team members submit structured weekly reports; managers track submissions, analyze progress, manage projects, and view dashboard insights. Next.js, TypeScript, Prisma, Neon PostgreSQL, NextAuth, Recharts.
- Job hunting tracker: zero-backend job-hunting CRM and application tracker with Excel import/export (SheetJS), screenshot OCR (Tesseract.js), and multi-LLM AI auto-fill (Gemini, Groq, OpenAI, Claude, OpenRouter, DeepSeek). HTML, CSS, vanilla JavaScript.
- Stremio Discord Rich Presence: lightweight Windows tray app that shows what you're watching on Stremio as Discord Rich Presence, with real poster art and smart title parsing. Electron, Node.js, Discord RPC, electron-builder, GitHub Actions.
- Valheim auto cleanup: safe, server-side automatic cleanup of old dropped items for Valheim dedicated servers; players install nothing. C#, .NET, BepInEx, Harmony, Unity, xUnit.
- Discord music bot (https://music.j4fn.site): self-hosted Discord music bot with yt-dlp playback, interactive controls, queue management, a web dashboard, and Docker Compose. Node.js, Discord.js, FFmpeg, Cloudflare Tunnel, AWS EC2, GitHub Actions.
- J4FN Discord server bot (https://bot.j4fn.site): moderation bot and web portal for the J4FN Discord server, with anti-spam, a member warnings system, welcome embeds, rotating presence, and a Cloudflare Zero Trust protected admin console. Runs 24/7 on Oracle Cloud and Cloudflare Tunnels. Python, Discord.py, Flask, Docker.
- Discord YouTube status bot: posts a YouTube channel's uploads and live streams, shows live channel stats in its status, and has a web dashboard. Self-hosted with Docker and auto-deployed over SSH by GitHub Actions. Python, Discord.py, Flask, aiohttp.
- CampusEats (https://campuseats-it24101927.vercel.app): SLIIT SE3090 lab project with a React frontend, an ASP.NET Core API, CI, and cloud deployment.
- SkillBridge LK (https://skill-bridge-lk.vercel.app): React, Vite, Express, Supabase, Tailwind CSS, React Hook Form, Zod, React Router.
- Thilak Products website (https://thilak-products-website.vercel.app): Next.js, TypeScript, Prisma, Supabase, PostgreSQL, Resend, Tailwind CSS, Playwright.
- EcoCycle web app (https://eco-cycle-webapp.vercel.app): no description published yet.
- Home Tutor: Java web application built with Maven, Servlets, JSP / JSTL, and Tomcat.
- This portfolio (https://kavisha.online): React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, and Spline 3D, deployed on Vercel, with a live GitHub project feed, a voice-guided tour, and this chat assistant.
- Earlier portfolio (https://macromaster101.github.io/kavisha_portfolio/): HTML, CSS, and vanilla JavaScript.

The Projects section of the site pulls the full, current list live from GitHub, so it may include work newer than this list.

## Certifications and writing
- Certifications: none listed yet. The focus right now is shipping real projects; AI, machine learning, and cloud certifications will be added as they are earned.
- Writing: project breakdowns and engineering notes are coming soon, covering AI, full-stack development, and software engineering.
`.trim();
