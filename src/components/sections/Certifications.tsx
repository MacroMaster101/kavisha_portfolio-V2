import { Section } from '../ui/Section';
import { PlaceholderCard } from '../ui/PlaceholderCard';
import { Award } from 'lucide-react';

export function Certifications() {
  return (
    <Section id="certifications" title="Certifications & Awards">
      <PlaceholderCard Icon={Award} heading="On the roadmap — building first, certifying along the way." status="In Progress">
        Focused on shipping real projects right now. AI/ML and cloud certifications will appear here as they&apos;re earned.
      </PlaceholderCard>
    </Section>
  );
}
