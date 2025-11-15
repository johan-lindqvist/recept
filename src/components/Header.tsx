import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { ChefHat, X } from 'lucide-react';

export function Header() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const searchQuery = searchParams.get('q') || '';
  const tagFilter = searchParams.get('tag') || '';

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

  const clearTagFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tag');
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
              {tagFilter && (
                <div className="inline-tag-filter">
                  <span className="filter-tag">{tagFilter}</span>
                  <button
                    className="clear-filter-btn"
                    onClick={clearTagFilter}
                    aria-label="Rensa taggfilter"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
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
