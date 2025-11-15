import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { ChefHat, X } from 'lucide-react';

export function Header() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const searchQuery = searchParams.get('q') || '';
  const tagFilterParam = searchParams.get('tag') || '';

  // Parse comma-separated tags from URL
  const selectedTags = tagFilterParam ? tagFilterParam.split(',').filter(t => t.trim()) : [];

  const isHomePage = location.pathname === '/';
  const isCreatePage = location.pathname === '/create';

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
          <Link to="/create" className="btn-primary">
            + Skapa Recept
          </Link>
        </nav>
      </div>
    </header>
  );
}
