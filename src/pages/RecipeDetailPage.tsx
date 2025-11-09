import { useParams, useNavigate } from 'react-router-dom';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeDetail } from '@/components/RecipeDetail';

export function RecipeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { recipes, loading } = useRecipes();

  const recipe = recipes.find(r => r.slug === slug);

  if (loading) {
    return <div className="loading">Laddar recept...</div>;
  }

  if (!recipe) {
    return (
      <div className="error">
        <p>Receptet hittades inte</p>
        <button onClick={() => navigate('/')}>Tillbaka till listan</button>
      </div>
    );
  }

  return (
    <div className="app">
      <RecipeDetail recipe={recipe} />
    </div>
  );
}
