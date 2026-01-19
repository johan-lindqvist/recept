import { useEffect } from 'react';
import { X, Shuffle, ChefHat, Users } from 'lucide-react';

interface FeaturesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  {
    icon: Shuffle,
    title: 'Slumpa recept',
    description: 'Kan inte bestämma dig? Klicka på "Slumpa recept" i menyn för att få ett slumpmässigt recept. Du kan även filtrera på taggar först.',
  },
  {
    icon: ChefHat,
    title: 'Matlagningsläge',
    description: 'När du tittar på ett recept kan du aktivera matlagningsläge för att följa receptet steg för steg. Bocka av ingredienser och instruktioner medan du lagar mat.',
  },
  {
    icon: Users,
    title: 'Anpassa portioner',
    description: 'Ändra antalet portioner på receptsidan så räknas alla ingredienser om automatiskt.',
  },
];

export function FeaturesDialog({ isOpen, onClose }: FeaturesDialogProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="features-dialog-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="features-dialog-title"
    >
      <div className="features-dialog">
        <div className="features-dialog-header">
          <h2 id="features-dialog-title">Nyheter</h2>
          <button
            className="features-dialog-close"
            onClick={onClose}
            aria-label="Stäng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="features-dialog-content">
          <ul className="features-list">
            {features.map((feature) => (
              <li key={feature.title} className="feature-item">
                <div className="feature-icon">
                  <feature.icon size={24} />
                </div>
                <div className="feature-text">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
