import { Mail } from 'lucide-react';
import { EMAIL, SOCIALS } from '../../data/contact';

// The social icon row: the desktop side rail and the mobile row in Contact.
export function SocialLinks({
  className,
  linkClassName,
  withEmail = false,
}: {
  className: string;
  linkClassName: string;
  withEmail?: boolean;
}) {
  return (
    <ul className={className}>
      {SOCIALS.map(({ Icon, href, label }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={linkClassName}>
            <Icon size={20} />
          </a>
        </li>
      ))}
      {withEmail && (
        <li>
          <a href={`mailto:${EMAIL}`} aria-label="Email" className={linkClassName}>
            <Mail size={20} />
          </a>
        </li>
      )}
    </ul>
  );
}
