import { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { ChefHat, X, Smartphone, Shuffle, Plus } from 'lucide-react';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useRecipes } from '@/hooks/useRecipes';
import { RandomRecipeDialog } from './RandomRecipeDialog';
import { HeaderButton } from './HeaderButton';

const WAKE_LOCK_TOOLTIP_KEY = 'wakeLockTooltipDismissed';

export function Header() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const searchQuery = searchParams.get('q') || '';
  const tagFilterParam = searchParams.get('tag') || '';
  const timeFilterParam = searchParams.get('time') || '';

  // Recipes for random selection dialog
  const { recipes } = useRecipes();
  const [isRandomDialogOpen, setIsRandomDialogOpen] = useState(false);

  // Wake lock functionality
  const isMobile = useIsMobile();
  const { isActive: wakeLockActive, isSupported: wakeLockSupported, toggle: toggleWakeLock } = useWakeLock();
  const [showWakeLockTooltip, setShowWakeLockTooltip] = useState(false);

  // Parse comma-separated tags from URL
  const selectedTags = tagFilterParam ? tagFilterParam.split(',').filter(t => t.trim()) : [];

  const isHomePage = location.pathname === '/';
  const isCreatePage = location.pathname === '/create';
  const isRecipePage = location.pathname.startsWith('/recept/');

  // Show tooltip on first visit for mobile users on recipe pages
  useEffect(() => {
    if (isMobile && wakeLockSupported && isRecipePage) {
      const dismissed = localStorage.getItem(WAKE_LOCK_TOOLTIP_KEY);
      if (!dismissed) {
        setShowWakeLockTooltip(true);
      }
    } else {
      setShowWakeLockTooltip(false);
    }
  }, [isMobile, wakeLockSupported, isRecipePage]);

  const dismissWakeLockTooltip = () => {
    setShowWakeLockTooltip(false);
    localStorage.setItem(WAKE_LOCK_TOOLTIP_KEY, 'true');
  };

  const handleWakeLockToggle = () => {
    toggleWakeLock();
    if (showWakeLockTooltip) {
      dismissWakeLockTooltip();
    }
  };

  // Get time filter display text
  const getTimeFilterText = (minutes: string) => {
    if (minutes === '40') return '≤ 40 min';
    if (minutes === '60') return '≤ 1 timme';
    return '';
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('q', value);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const removeTag = (tagToRemove: string) => {
    const newParams = new URLSearchParams(searchParams);
    const updatedTags = selectedTags.filter(t => t !== tagToRemove);
    if (updatedTags.length > 0) {
      newParams.set('tag', updatedTags.join(','));
    } else {
      newParams.delete('tag');
    }
    setSearchParams(newParams);
  };

  const removeTimeFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('time');
    setSearchParams(newParams);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="header-title">
          <ChefHat size={32} />
          <span>Mina Recept</span>
        </Link>

        {isHomePage && (
          <div className="header-search">
            <div className="search-input-wrapper">
              {timeFilterParam && (
                <div className="inline-tag-filter time-filter">
                  <span className="filter-tag">{getTimeFilterText(timeFilterParam)}</span>
                  <button
                    className="clear-filter-btn"
                    onClick={removeTimeFilter}
                    aria-label={`Ta bort tidsfilter ${getTimeFilterText(timeFilterParam)}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {selectedTags.map(tag => (
                <div key={tag} className="inline-tag-filter">
                  <span className="filter-tag">{tag}</span>
                  <button
                    className="clear-filter-btn"
                    onClick={() => removeTag(tag)}
                    aria-label={`Ta bort ${tag}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder="Sök recept..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        )}

        {isCreatePage && (
          <div className="header-page-title">
            <h1>Skapa nytt recept</h1>
          </div>
        )}

        <nav className="header-nav">
          {isMobile && wakeLockSupported && isRecipePage && (
            <div className="wake-lock-container">
              <button
                className={`wake-lock-btn ${wakeLockActive ? 'active' : ''}`}
                onClick={handleWakeLockToggle}
                aria-label={wakeLockActive ? 'Stäng av skärmlås' : 'Håll skärmen vaken'}
                aria-pressed={wakeLockActive}
              >
                <Smartphone size={18} />
                <span className="wake-lock-text">
                  {wakeLockActive ? 'Skärm vaken' : 'Håll vaken'}
                </span>
              </button>
              {showWakeLockTooltip && (
                <div className="wake-lock-tooltip">
                  <span>Aktivera för att hålla skärmen tänd medan du lagar mat</span>
                  <button
                    className="wake-lock-tooltip-close"
                    onClick={dismissWakeLockTooltip}
                    aria-label="Stäng tips"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
          <HeaderButton
            icon={Shuffle}
            onClick={() => setIsRandomDialogOpen(true)}
          >
            Slumpa recept
          </HeaderButton>
          <HeaderButton as="link" to="/create" icon={Plus}>
            Skapa Recept
          </HeaderButton>
        </nav>
      </div>

      <RandomRecipeDialog
        isOpen={isRandomDialogOpen}
        onClose={() => setIsRandomDialogOpen(false)}
        recipes={recipes}
      />
    </header>
  );
}
