import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Header';
import { RecipeListPage } from '@/pages/RecipeListPage';

// Lazy load pages that aren't immediately needed
const RecipeDetailPage = lazy(() => import('@/pages/RecipeDetailPage'));
const RecipeCreatorPage = lazy(() => import('@/pages/RecipeCreatorPage'));

function App() {
  return (
    <BrowserRouter basename="/recept">
      <Header />
      <Suspense fallback={<div className="loading">Laddar...</div>}>
        <Routes>
          <Route path="/" element={<RecipeListPage />} />
          <Route path="/recipe/:slug" element={<RecipeDetailPage />} />
          <Route path="/create" element={<RecipeCreatorPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
