const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const dropdown = document.getElementById('dropdown');
const characterDetails = document.getElementById('results');

let characters = [];
let statsKeywords = [];

const attributeColors = {
  DEX: 'attribute-blue',
  VIT: 'attribute-green',
  STR: 'attribute-red',
  INT: 'attribute-orange',
};

const typeEmojis = {
  DPS: 'type-sword',
  VIT: 'type-heart',
  Tank: 'type-shield',
  Debuffer: 'type-moon',
  Support: 'type-ambulance',
};

function loadJSON(path) {
  return fetch(path).then(res => res.json());
}

function boldStatsAndUnderlineTimes(text) {
  if (!text) return '';
  const keywords = statsKeywords.map(k => k.replace(/<number>/g, '\\d+'));
  const regexKeywords = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  const regexPercent = /(\d+%)/g;
  const regexTime = /(\d+(\.\d+)?[smh])/gi;

  let escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  escaped = escaped.replace(regexKeywords, '<b>$1</b>');
  escaped = escaped.replace(regexPercent, '<b>$1</b>');
  escaped = escaped.replace(regexTime, '<u>$1</u>');
  escaped = escaped.replace(/\n/g, '<br>');

  return escaped;
}

function getAttributeClass(attr) {
  return attributeColors[attr] || '';
}

function getTypeClass(type) {
  return typeEmojis[type] || '';
}

function renderDropdown(matches) {
  if (matches.length === 0) {
    dropdown.innerHTML = '<div class="dropdown-item">No results found</div>';
    dropdown.style.display = 'block';
    return;
  }
  dropdown.innerHTML = matches.map(c => {
    const attrClass = getAttributeClass(c.Attribute);
    const typeClass = getTypeClass(c.Type);
    return `
      <div class="dropdown-item" data-id="${c.id}">
        <span>${c.name}</span>
        <small><span class="${attrClass}">${c.Attribute || ''}</span> | <span class="${typeClass}">${c.Type || ''}</span></small>
      </div>`;
  }).join('');
  dropdown.style.display = 'block';

  [...dropdown.children].forEach(item => {
    item.addEventListener('click', () => {
      const charId = item.getAttribute('data-id');
      const character = characters.find(c => c.id.toString() === charId);
      if (character) {
        renderCharacterDetails(character);
      }
      dropdown.style.display = 'none';
    });
  });
}

function renderCharacterDetails(character) {
  const attrClass = getAttributeClass(character.Attribute);
  const typeClass = getTypeClass(character.Type);

  characterDetails.innerHTML = `
    <div class="character-card">
      <h2>${character.name}</h2>
      <p><span class="${attrClass}"><b>${character.Attribute || ''}</b></span> | <span class="${typeClass}"><b>${character.Type || ''}</b></span></p>
      <img src="assets/characters/${encodeURIComponent(character.name)}.jpg" alt="${character.name}" />
      <div>
        <div class="character-title">Normal Skill</div>
        <p>${boldStatsAndUnderlineTimes(character.Normal_Skill)}</p>
      </div>
      <div>
        <div class="character-title">Special Skill</div>
        <p>${boldStatsAndUnderlineTimes(character.Special_Skill)}</p>
      </div>
      <div>
        <div class="character-title">Ultimate Move</div>
        <p>${boldStatsAndUnderlineTimes(character.Ultimate_Move)}</p>
      </div>
    </div>`;
}

function clearDropdown() {
  dropdown.innerHTML = '';
  dropdown.style.display = 'none';
}

// Search logic on button click
searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim().toLowerCase();
  characterDetails.innerHTML = ''; // Clear previous result

  if (!query) {
    clearDropdown();
    return;
  }

  // Filter characters whose name includes query
  const matches = characters.filter(c =>
    c.name.toLowerCase().includes(query)
  );

  renderDropdown(matches);
});

// Hide dropdown when clicking outside
document.addEventListener('click', e => {
  if (!dropdown.contains(e.target) && e.target !== searchInput && e.target !== searchButton) {
    clearDropdown();
  }
});

// Load data at start
Promise.all([
  loadJSON('database/characters.json'),
  loadJSON('database/stats.json')
]).then(([chars, statsData]) => {
  characters = chars;
  statsKeywords = statsData.keywords || [];
}).catch(err => {
  console.error('Failed to load data:', err);
});
