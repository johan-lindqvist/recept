import { useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

export interface CheckableItem {
  index: number;
  text: string;
  isChecked: boolean;
}

interface CheckableListProps {
  items: CheckableItem[];
  onToggle: (index: number) => void;
  currentIndex?: number;
  showNumbers?: boolean;
  className?: string;
}

export function CheckableList({
  items,
  onToggle,
  currentIndex,
  showNumbers = false,
  className = '',
}: CheckableListProps) {
  const currentItemRef = useRef<HTMLLIElement>(null);

  // Auto-scroll to current item when it changes
  useEffect(() => {
    if (currentIndex !== undefined && currentItemRef.current) {
      currentItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentIndex]);

  return (
    <ul className={`checkable-list ${className}`}>
      {items.map((item) => {
        const isCurrent = currentIndex !== undefined && item.index === currentIndex;
        return (
          <li
            key={item.index}
            ref={isCurrent ? currentItemRef : null}
            className={`checkable-item ${item.isChecked ? 'checked' : ''} ${isCurrent ? 'current' : ''}`}
          >
            <button
              type="button"
              className="checkable-button"
              onClick={() => onToggle(item.index)}
              aria-pressed={item.isChecked}
            >
              <span className="checkable-checkbox">
                {item.isChecked && <Check size={16} />}
              </span>
              <span className="checkable-text">
                {showNumbers && <span className="checkable-number">{item.index + 1}.</span>}
                <span dangerouslySetInnerHTML={{ __html: item.text }} />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
