import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

export function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="header-title">
          <ChefHat size={32} />
          <span>Mina Recept</span>
        </Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">
            Alla Recept
          </Link>
          <Link to="/create" className="btn-primary">
            + Skapa Recept
          </Link>
        </nav>
      </div>
    </header>
  );
}
