import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { generateRecipeMarkdown, generateFilename, type RecipeFormData } from '@/utils/markdownGenerator';

export function RecipeCreator() {
  const [formData, setFormData] = useState<RecipeFormData>({ title: '' });
  const [markdown, setMarkdown] = useState('');
  const [filename, setFilename] = useState('recipe-name.md');
  const [copyButtonText, setCopyButtonText] = useState('📋 Kopiera');
  const [copyButtonDisabled, setCopyButtonDisabled] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  useEffect(() => {
    const generated = generateRecipeMarkdown(formData);
    setMarkdown(generated);
  }, [formData]);

  useEffect(() => {
    if (formData.title) {
      setFilename(generateFilename(formData.title) + '.md');
    } else {
      setFilename('recipe-name.md');
    }
  }, [formData.title]);

  const handleInputChange = (
    name: keyof RecipeFormData,
    value: string | number | undefined
  ) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyButtonText('✓ Kopierad!');
      setCopyButtonDisabled(true);
      setTimeout(() => {
        setCopyButtonText('📋 Kopiera');
        setCopyButtonDisabled(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="recipe-creator">
      <form className="recipe-form" onSubmit={(e) => e.preventDefault()}>
        {/* Metadata Section */}
        <div className="form-section">
          <h2>Grundinformation</h2>

          <div className="form-group">
            <label htmlFor="title">Titel *</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="T.ex. Köttbullar med gräddsås"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Beskrivning</label>
            <input
              type="text"
              id="description"
              name="description"
              placeholder="En kort beskrivning av receptet"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalTime">Total tid</label>
            <input
              type="text"
              id="totalTime"
              name="totalTime"
              placeholder="45 minuter"
              value={formData.totalTime || ''}
              onChange={(e) => handleInputChange('totalTime', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="servings">Portioner</label>
            <input
              type="number"
              id="servings"
              name="servings"
              placeholder="4"
              value={formData.servings || ''}
              onChange={(e) => handleInputChange('servings', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Taggar</label>
            <input
              type="text"
              id="tags"
              name="tags"
              placeholder="middag, kött, svensk (separera med komma)"
              value={formData.tags || ''}
              onChange={(e) => handleInputChange('tags', e.target.value)}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="form-section">
          <h2>Innehåll</h2>

          <div className="form-group">
            <label htmlFor="ingredients">Ingredienser</label>
            <textarea
              id="ingredients"
              name="ingredients"
              rows={5}
              placeholder="En ingrediens per rad&#10;500 g nötfärs&#10;1 ägg&#10;1 dl ströbröd"
              value={formData.ingredients || ''}
              onChange={(e) => handleInputChange('ingredients', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="instructions">Instruktioner</label>
            <textarea
              id="instructions"
              name="instructions"
              rows={5}
              placeholder="Ett steg per rad&#10;Blanda alla ingredienser&#10;Forma till bullar&#10;Stek i smör"
              value={formData.instructions || ''}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tips">Tips (valfritt)</label>
            <textarea
              id="tips"
              name="tips"
              rows={5}
              placeholder="Ett tips per rad&#10;Servera med lingon&#10;Går att frysa"
              value={formData.tips || ''}
              onChange={(e) => handleInputChange('tips', e.target.value)}
            />
          </div>
        </div>
      </form>

      {/* Output Section */}
      <div className="output-section">
        <div className="output-header">
          <h2>Genererad Markdown</h2>
          <button
            className="copy-button"
            onClick={handleCopy}
            disabled={copyButtonDisabled}
          >
            {copyButtonText}
          </button>
        </div>

        <textarea
          className="markdown-output"
          readOnly
          rows={20}
          placeholder="Din markdown kommer att visas här..."
          value={markdown}
        />

        <div className="filename-suggestion">
          <strong>Föreslaget filnamn: </strong>
          <span id="suggested-filename">{filename}</span>
        </div>

        <div className="instructions-accordion">
          <button
            className="accordion-header"
            onClick={() => setInstructionsOpen(!instructionsOpen)}
            aria-expanded={instructionsOpen}
          >
            <h3>Instruktioner för att lägga till receptet på GitHub</h3>
            {instructionsOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {instructionsOpen && (
            <div className="accordion-content">
              <ol>
                <li>Kopiera markdown-texten ovan</li>
                <li>Skapa en ny fil i <code>recipes/</code> mappen med det föreslagna filnamnet</li>
                <li>Klistra in markdown-texten i filen</li>
                <li>
                  <strong>Bild (valfritt):</strong> Om du vill lägga till en bild:
                  <ul>
                    <li>Placera bildfilen i <code>public/images/recipes/</code></li>
                    <li>Bildens filnamn <strong>måste</strong> matcha receptets filnamn exakt (t.ex. för <code>kottbullar.md</code>, använd <code>kottbullar.svg</code>)</li>
                  </ul>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
