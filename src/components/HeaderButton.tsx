import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface HeaderButtonBaseProps {
  icon?: LucideIcon;
  children: React.ReactNode;
}

interface HeaderButtonAsButton extends HeaderButtonBaseProps {
  as?: 'button';
  onClick: () => void;
  to?: never;
}

interface HeaderButtonAsLink extends HeaderButtonBaseProps {
  as: 'link';
  to: string;
  onClick?: never;
}

type HeaderButtonProps = HeaderButtonAsButton | HeaderButtonAsLink;

export function HeaderButton({ icon: Icon, children, ...props }: HeaderButtonProps) {
  const content = (
    <>
      {Icon && <Icon size={18} />}
      <span>{children}</span>
    </>
  );

  if (props.as === 'link') {
    return (
      <Link to={props.to} className="header-btn">
        {content}
      </Link>
    );
  }

  return (
    <button className="header-btn" onClick={props.onClick}>
      {content}
    </button>
  );
}
