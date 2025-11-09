import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

export function Header() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const searchQuery = searchParams.get('q') || '';

  // Only show search on the home page
  const isHomePage = location.pathname === '/';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
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
            <input
              type="text"
              placeholder="Sök recept..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
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
