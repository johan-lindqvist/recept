import { useNavigate } from 'react-router-dom';

export function RecipeCreatorPage() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <div className="recipe-creator">
        <h1>Skapa Nytt Recept</h1>
        <p>Recipe creator page - To be implemented</p>
        <button onClick={() => navigate('/')}>Tillbaka</button>
      </div>
    </div>
  );
}
