import { Section } from '../ui/Section';
import { PlaceholderCard } from '../ui/PlaceholderCard';
import { BookOpen } from 'lucide-react';

export function Blogs() {
  return (
    <Section id="blogs" title="Things I've Written">
      <PlaceholderCard Icon={BookOpen} heading="Project breakdowns and engineering notes — soon." status="Coming Soon">
        Planning to share learnings on AI, full-stack development, and software engineering — including
        write-ups on the projects I&apos;m shipping.
      </PlaceholderCard>
    </Section>
  );
}
