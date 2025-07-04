const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const dropdown = document.getElementById('dropdown');
const resultsContainer = document.getElementById('results');

let characters = [];
let statsKeywords = [];

const attributeColors = {
  DEX: 'blue',
  VIT: 'green',
  STR: 'red',
  INT: 'orange',
};

const typeEmojis = {
  DPS: '🗡️',
  VIT: '❤️',
  Tank: '🛡️',
  Debuffer: '🌙',
  Support: '🚑',
};

// Load character and stats JSON
async function loadData() {
  try {
    const [charsResp, statsResp] = await Promise.all([
      fetch('database/characters.json'),
      fetch('database/stats.json')
    ]);
    characters = await charsResp.json();
    const statsData = await statsResp.json();
    statsKeywords = statsData.keywords || [];
  } catch (e) {
    console.error('Error loading JSON:', e);
  }
}

// Highlight stats and underline durations
function formatText(text) {
  if (!text) return '';
  let safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const keywordsPattern = statsKeywords
    .map(k => k.replace(/<number>/g, '\\d+'))
    .join('|');
  const keywordsRegex = new RegExp(keywordsPattern, 'gi');
  const percentRegex = /(\d+%)/g;
  const timeRegex = /(\d+(\.\d+)?s)/gi;

  safeText = safeText.replace(keywordsRegex, '<b>$&</b>');
  safeText = safeText.replace(percentRegex, '<b>$&</b>');
  safeText = safeText.replace(timeRegex, '<u>$&</u>');
  safeText = safeText.replace(/\n/g, '<br>');

  return safeText;
}

function getColoredAttribute(attr) {
  const color = attributeColors[attr] || 'white';
  return `<span style="color:${color}; font-weight:bold;">${attr}</span>`;
}

function getEmojiType(type) {
  return `${typeEmojis[type] || ''} ${type || ''}`;
}

function renderDropdown(matches) {
  if (matches.length === 0) {
    dropdown.innerHTML = '<div class="dropdown-item">No results found</div>';
    dropdown.style.display = 'block';
    return;
  }
  dropdown.innerHTML = matches.map(c => {
    return `<div class="dropdown-item" data-id="${c.id}" style="cursor:pointer; padding:5px;">
      ${c.name}<br>
      <small>${getColoredAttribute(c.Attribute)} | ${getEmojiType(c.Type)}</small>
    </div>`;
  }).join('');
  dropdown.style.display = 'block';

  // Add click listeners to dropdown items
  [...dropdown.children].forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      const char = characters.find(c => c.id.toString() === id);
      if (char) {
        renderCharacterDetails(char);
      }
      dropdown.style.display = 'none';
    });
  });
}

function renderCharacterDetails(c) {
  resultsContainer.innerHTML = `
    <div class="character-card" style="max-width:600px; margin:auto; background:#222; padding:1em; border-radius:8px; box-shadow:0 0 10px gold;">
      <h2>${c.name}</h2>
      <p>${getColoredAttribute(c.Attribute)} | <b>${getEmojiType(c.Type)}</b></p>
      <img src="${imagePath}" alt="${character.name}" style="max-width:100%; border-radius:8px;">
      <h3>Normal Skill</h3>
      <p>${formatText(c.Normal_Skill)}</p>
      <h3>Special Skill</h3>
      <p>${formatText(c.Special_Skill)}</p>
      <h3>Ultimate Move</h3>
      <p>${formatText(c.Ultimate_Move)}</p>
    </div>
  `;
}

// Search button click handler
searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim().toLowerCase();
  resultsContainer.innerHTML = '';
  if (!query) {
    dropdown.style.display = 'none';
    return;
  }
  const matches = characters.filter(c => c.name.toLowerCase().includes(query));
  renderDropdown(matches);
});

// Hide dropdown when clicking outside
document.addEventListener('click', e => {
  if (!dropdown.contains(e.target) && e.target !== searchInput && e.target !== searchButton) {
    dropdown.style.display = 'none';
  }
});

// Load data on page load
loadData();
