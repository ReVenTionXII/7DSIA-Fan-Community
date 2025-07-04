const attributeEmojis = {
  DEX: "🔵",
  VIT: "🟢",
  STR: "🔴",
  INT: "🟠",
};

const typeEmojis = {
  DPS: '🗡️',
  VIT: '❤️',
  Tank: '🛡️',
  Debuffer: '🌙',
  Support: '🚑',
};

let characters = [];
let statsKeywords = [];

async function loadData() {
  try {
    const charResp = await fetch('database/characters.json');
    characters = await charResp.json();

    const statsResp = await fetch('database/stats.json');
    const statsData = await statsResp.json();
    statsKeywords = statsData.keywords.map(k => k.toLowerCase());

  } catch (e) {
    console.error('Error loading data:', e);
  }
}

function highlightStats(text) {
  if (!text) return '';

  // Bold percentages
  text = text.replace(/(\d+%)/g, '<b>$1</b>');

  // Bold keywords (including those with numbers)
  statsKeywords.forEach(keyword => {
    const kw = keyword.replace('<number>', '\\d+');
    const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
    text = text.replace(regex, '<b>$1</b>');
  });

  // Underline time durations (e.g. 0.5s, 3s)
  text = text.replace(/(\d+(\.\d+)?s)/g, '<u>$1</u>');

  // Replace newlines with <br> for HTML display
  return text.replace(/\n/g, '<br>');
}

function createCharacterCard(character) {
  const attr = character.Attribute || '';
  const type = character.Type || '';

  const attrEmoji = attributeEmojis[attr] || '';
  const typeEmoji = typeEmojis[type] || '';

  let imgName = character.image_path ? character.image_path.split('\\').pop() : '';
  imgName = imgName.replace(/\s/g, '_');

  return `
    <div class="character-card">
      <img src="assets/characters/${imgName}" alt="${character.name}" />
      <h2>${character.name}</h2>
      <p><b>Attribute:</b> <span>${attrEmoji} <b>${attr}</b></span></p>
      <p><b>Type:</b> ${typeEmoji} <b>${type}</b></p>
      <p><b>Normal Skill:</b><br>${highlightStats(character.Normal_Skill)}</p>
      <p><b>Special Move:</b><br>${highlightStats(character.Special_Skill)}</p>
      <p><b>Ultimate Move:</b><br>${highlightStats(character.Ultimate_Move)}</p>
    </div>
  `;
}

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const dropdown = document.getElementById('dropdown');
const resultsContainer = document.getElementById('results');

function filterCharacters(query) {
  const lowerQ = query.toLowerCase();
  return characters.filter(c => c.name.toLowerCase().includes(lowerQ));
}

function clearResults() {
  resultsContainer.innerHTML = '';
  dropdown.style.display = 'none';
  dropdown.innerHTML = '';
}

function showDropdown(matches) {
  dropdown.innerHTML = '';
  if (matches.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

  matches.forEach(character => {
    const div = document.createElement('div');
    const attrEmoji = attributeEmojis[character.Attribute] || '';
    const typeEmoji = typeEmojis[character.Type] || '';
    div.className = 'custom-dropdown-item';
    div.innerHTML = `${character.name} — ${attrEmoji} ${character.Attribute} | ${typeEmoji} ${character.Type}`;
    div.addEventListener('click', () => {
      dropdown.style.display = 'none';
      resultsContainer.innerHTML = createCharacterCard(character);
    });
    dropdown.appendChild(div);
  });
  dropdown.style.display = 'block';
}

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  clearResults();
  if (!query) return;

  const matches = filterCharacters(query);
  if (matches.length === 1) {
    resultsContainer.innerHTML = createCharacterCard(matches[0]);
  } else if (matches.length > 1) {
    showDropdown(matches);
  } else {
    resultsContainer.innerHTML = `<p>No characters found for "${query}"</p>`;
  }
});

loadData();
