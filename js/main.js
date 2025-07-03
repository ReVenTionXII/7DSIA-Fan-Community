const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('results');

let characters = [];
let stats = [];

// Load characters and stats JSON
async function loadData() {
  try {
    const charactersResponse = await fetch('database/characters.json');
    characters = await charactersResponse.json();

    const statsResponse = await fetch('database/stats.json');
    const statsData = await statsResponse.json();
    stats = statsData.keywords.map(k => k.toLowerCase());
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Highlight keywords and underline time durations
function highlightText(text) {
  if (!text) return '';

  // Escape HTML special characters
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Highlight keywords (case-insensitive)
  stats.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword.replace('<number>', '\\d+')})\\b`, 'gi');
    text = text.replace(regex, '<strong>$1</strong>');
  });

  // Underline time durations like "0.5s"
  text = text.replace(/(\d+(\.\d+)?s)/g, '<u>$1</u>');

  // Replace newlines with <br>
  text = text.replace(/\n/g, '<br>');

  return text;
}

function renderCharacterCard(character) {
  // Make sure image path works for web hosting (assumes you updated paths accordingly)
  let imgPath = character.image_path;
  if (!imgPath.startsWith('http')) {
    imgPath = imgPath.replace(/\\/g, '/');
  }

  return `
    <div class="character-card">
      <h2>${character.name}</h2>
      <p><strong>${character.Attribute} | ${character.Type}</strong></p>
      <img src="${imgPath}" alt="${character.name}" class="character-image" />

      <h3>Normal Skill</h3>
      <p>${highlightText(character.Normal_Skill)}</p>

      <h3>Special Skill</h3>
      <p>${highlightText(character.Special_Skill)}</p>

      <h3>Ultimate Move</h3>
      <p>${highlightText(character.Ultimate_Move)}</p>
    </div>
  `;
}

function displayResults(filteredCharacters) {
  if (filteredCharacters.length === 0) {
    resultsContainer.innerHTML = '<p>No characters found.</p>';
    return;
  }

  resultsContainer.innerHTML = filteredCharacters.map(renderCharacterCard).join('');
}

function searchCharacters() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    resultsContainer.innerHTML = '';
    return;
  }

  const filtered = characters.filter(char => 
    char.name.toLowerCase().includes(query) ||
    (char.Attribute && char.Attribute.toLowerCase().includes(query)) ||
    (char.Type && char.Type.toLowerCase().includes(query)) ||
    (char.Affiliation && char.Affiliation.toLowerCase().includes(query))
  );

  displayResults(filtered);
}

searchButton.addEventListener('click', searchCharacters);

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    searchCharacters();
  }
});

loadData();
