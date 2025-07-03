const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('results');

let characters = [];
let stats = [];

// Load data from JSON files
async function loadData() {
  try {
    const charResponse = await fetch('database/characters.json');
    characters = await charResponse.json();

    const statsResponse = await fetch('database/stats.json');
    stats = await statsResponse.json();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function highlightKeywords(text) {
  if (!text) return '';

  // Highlight percentage numbers (bold)
  text = text.replace(/(\d+(\.\d+)?%)/g, '<strong>$1</strong>');

  // Underline time durations (e.g., 0.5s)
  text = text.replace(/(\d+(\.\d+)?s)/g, '<u>$1</u>');

  // Highlight keywords from stats.json (bold)
  stats.keywords.forEach(keyword => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
    text = text.replace(regex, match => `<strong>${match}</strong>`);
  });

  return text;
}

function createCharacterCard(character) {
  const card = document.createElement('div');
  card.classList.add('character-card');

  card.innerHTML = `
    <img src="${character.image_path}" alt="${character.name}" />
    <h3>${character.name}</h3>
    <p><strong>Attribute:</strong> ${character.Attribute} | <strong>Type:</strong> ${character.Type}</p>

    <h4>Normal Skill</h4>
    <p>${highlightKeywords(character.Normal_Skill).replace(/\n/g, '<br>')}</p>

    <h4>Special Skill</h4>
    <p>${highlightKeywords(character.Special_Skill).replace(/\n/g, '<br>')}</p>

    <h4>Ultimate Move</h4>
    <p>${highlightKeywords(character.Ultimate_Move).replace(/\n/g, '<br>')}</p>
  `;

  return card;
}

function searchCharacters() {
  const query = searchInput.value.trim().toLowerCase();
  resultsContainer.innerHTML = '';

  if (!query) return;

  const filtered = characters.filter(char =>
    char.name.toLowerCase().includes(query) ||
    char.Attribute.toLowerCase().includes(query) ||
    char.Type.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    resultsContainer.textContent = 'No characters found.';
    return;
  }

  filtered.forEach(character => {
    const card = createCharacterCard(character);
    resultsContainer.appendChild(card);
  });
}

searchButton.addEventListener('click', searchCharacters);

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchCharacters();
});

// Load data on page load
loadData();
