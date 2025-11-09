import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RecipeListPage } from '@/pages/RecipeListPage';
import { RecipeDetailPage } from '@/pages/RecipeDetailPage';
import { RecipeCreatorPage } from '@/pages/RecipeCreatorPage';

function App() {
  return (
    <BrowserRouter basename="/recept">
      <Routes>
        <Route path="/" element={<RecipeListPage />} />
        <Route path="/recipe/:slug" element={<RecipeDetailPage />} />
        <Route path="/create" element={<RecipeCreatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
