import { generateRecipeMarkdown, generateFilename, type RecipeFormData } from '@/utils/markdownGenerator';

export function createRecipeCreator(container: HTMLElement, onBack: () => void): void {
  container.innerHTML = '';

  const creator = document.createElement('div');
  creator.className = 'recipe-creator';

  // Header with back button
  const header = document.createElement('div');
  header.className = 'recipe-creator-header';

  const backButton = document.createElement('button');
  backButton.className = 'back-button';
  backButton.textContent = '← Tillbaka';
  backButton.onclick = onBack;
  header.appendChild(backButton);

  const headerTitle = document.createElement('h1');
  headerTitle.textContent = 'Skapa Nytt Recept';
  header.appendChild(headerTitle);

  creator.appendChild(header);

  // Form
  const form = document.createElement('form');
  form.className = 'recipe-form';
  form.onsubmit = (e) => e.preventDefault();

  // Create form data object
  const formData: RecipeFormData = {
    title: ''
  };

  // Helper function to create input groups
  function createInputGroup(
    label: string,
    type: string,
    name: keyof RecipeFormData,
    required = false,
    placeholder = ''
  ): HTMLElement {
    const group = document.createElement('div');
    group.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.textContent = label + (required ? ' *' : '');
    labelEl.htmlFor = name;
    group.appendChild(labelEl);

    let input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    if (type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 5;
    } else if (type === 'select') {
      input = document.createElement('select');
      const options = ['', 'Lätt', 'Medel', 'Svår'];
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt || 'Välj...';
        input.appendChild(option);
      });
    } else {
      input = document.createElement('input');
      input.type = type;
    }

    input.id = name;
    input.name = name;
    if (!(input instanceof HTMLSelectElement)) {
      input.placeholder = placeholder;
    }
    if (required) {
      input.required = true;
    }

    input.oninput = () => {
      if (input instanceof HTMLSelectElement) {
        (formData as any)[name] = input.value;
      } else if (type === 'number') {
        (formData as any)[name] = input.value ? parseInt(input.value) : undefined;
      } else {
        (formData as any)[name] = input.value;
      }
      updateMarkdown();
      updateFilename();
    };

    group.appendChild(input);

    return group;
  }

  // Metadata section
  const metadataSection = document.createElement('div');
  metadataSection.className = 'form-section';

  const metadataTitle = document.createElement('h2');
  metadataTitle.textContent = 'Grundinformation';
  metadataSection.appendChild(metadataTitle);

  metadataSection.appendChild(createInputGroup('Titel', 'text', 'title', true, 'T.ex. Köttbullar med gräddsås'));
  metadataSection.appendChild(createInputGroup('Beskrivning', 'text', 'description', false, 'En kort beskrivning av receptet'));
  metadataSection.appendChild(createInputGroup('Förberedelsetid', 'text', 'prepTime', false, '15 minuter'));
  metadataSection.appendChild(createInputGroup('Tillagningstid', 'text', 'cookTime', false, '30 minuter'));
  metadataSection.appendChild(createInputGroup('Portioner', 'number', 'servings', false, '4'));
  metadataSection.appendChild(createInputGroup('Svårighetsgrad', 'select', 'difficulty'));
  metadataSection.appendChild(createInputGroup('Taggar', 'text', 'tags', false, 'middag, kött, svensk (separera med komma)'));

  form.appendChild(metadataSection);

  // Content section
  const contentSection = document.createElement('div');
  contentSection.className = 'form-section';

  const contentTitle = document.createElement('h2');
  contentTitle.textContent = 'Innehåll';
  contentSection.appendChild(contentTitle);

  contentSection.appendChild(createInputGroup('Ingredienser', 'textarea', 'ingredients', false, 'En ingrediens per rad\n500 g nötfärs\n1 ägg\n1 dl ströbröd'));
  contentSection.appendChild(createInputGroup('Instruktioner', 'textarea', 'instructions', false, 'Ett steg per rad\nBlanda alla ingredienser\nForma till bullar\nStek i smör'));
  contentSection.appendChild(createInputGroup('Tips (valfritt)', 'textarea', 'tips', false, 'Ett tips per rad\nServera med lingon\nGår att frysa'));

  form.appendChild(contentSection);

  creator.appendChild(form);

  // Output section
  const outputSection = document.createElement('div');
  outputSection.className = 'output-section';

  const outputHeader = document.createElement('div');
  outputHeader.className = 'output-header';

  const outputTitle = document.createElement('h2');
  outputTitle.textContent = 'Genererad Markdown';
  outputHeader.appendChild(outputTitle);

  const copyButton = document.createElement('button');
  copyButton.className = 'copy-button';
  copyButton.textContent = '📋 Kopiera';
  copyButton.onclick = () => copyMarkdown();
  outputHeader.appendChild(copyButton);

  outputSection.appendChild(outputHeader);

  const markdownOutput = document.createElement('textarea');
  markdownOutput.className = 'markdown-output';
  markdownOutput.readOnly = true;
  markdownOutput.rows = 20;
  markdownOutput.placeholder = 'Din markdown kommer att visas här...';
  outputSection.appendChild(markdownOutput);

  // Filename suggestion
  const filenameDiv = document.createElement('div');
  filenameDiv.className = 'filename-suggestion';
  const filenameLabel = document.createElement('strong');
  filenameLabel.textContent = 'Föreslaget filnamn: ';
  filenameDiv.appendChild(filenameLabel);
  const filenameSpan = document.createElement('span');
  filenameSpan.id = 'suggested-filename';
  filenameSpan.textContent = 'recipe-name.md';
  filenameDiv.appendChild(filenameSpan);
  outputSection.appendChild(filenameDiv);

  // Instructions
  const instructions = document.createElement('div');
  instructions.className = 'instructions';
  instructions.innerHTML = `
    <h3>Nästa steg:</h3>
    <ol>
      <li>Kopiera markdown-texten ovan</li>
      <li>Skapa en ny fil i <code>recipes/</code> mappen med det föreslagna filnamnet</li>
      <li>Klistra in markdown-texten i filen</li>
      <li><strong>Bild (valfritt):</strong> Om du vill lägga till en bild:
        <ul>
          <li>Placera bildfilen i <code>public/images/recipes/</code></li>
          <li>Bildens filnamn <strong>måste</strong> matcha receptets filnamn exakt (t.ex. för <code>kottbullar.md</code>, använd <code>kottbullar.svg</code>)</li>
          <li>Bilden kommer automatiskt att visas - du behöver inte lägga till någon <code>image:</code>-rad i markdown-filen</li>
          <li>Om ingen bild hittas visas en standardbild</li>
        </ul>
      </li>
      <li>Commit och pusha dina ändringar</li>
    </ol>
  `;
  outputSection.appendChild(instructions);

  creator.appendChild(outputSection);

  container.appendChild(creator);

  // Helper functions
  function updateMarkdown() {
    const markdown = generateRecipeMarkdown(formData);
    markdownOutput.value = markdown;
  }

  function updateFilename() {
    if (formData.title) {
      const filename = generateFilename(formData.title) + '.md';
      filenameSpan.textContent = filename;
    } else {
      filenameSpan.textContent = 'recipe-name.md';
    }
  }

  function copyMarkdown() {
    markdownOutput.select();
    navigator.clipboard.writeText(markdownOutput.value).then(() => {
      const originalText = copyButton.textContent;
      copyButton.textContent = '✓ Kopierad!';
      copyButton.disabled = true;
      setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.disabled = false;
      }, 2000);
    });
  }
}
