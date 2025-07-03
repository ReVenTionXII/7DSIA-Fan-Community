// Path to your data files
const CHARACTERS_URL = './database/characters.json';
const STATS_URL = './database/stats.json';

let characters = [];
let statsKeywords = [];

const searchInput = document.getElementById('searchInput');
const dropdown = document.getElementById('dropdown');
const characterDetails = document.getElementById('characterDetails');

// Load stats keywords from stats.json for highlighting
async function loadStatsKeywords() {
  try {
    const res = await fetch(STATS_URL);
    const data = await res.json();
    statsKeywords = data.keywords || [];
  } catch (error) {
    console.error('Error loading stats.json:', error);
  }
}

// Load characters from JSON
async function loadCharacters() {
  try {
    const res = await fetch(CHARACTERS_URL);
    characters = await res.json();
  } catch (error) {
    console.error('Error loading characters.json:', error);
  }
}

// Highlight percentages and times in text
function highlightStats(text) {
  if (!text) return '';

  // Escape HTML characters
  text = text.replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;");

  // Highlight stats keywords (case-insensitive)
  statsKeywords.forEach(keyword => {
    if (keyword.includes('<number>')) {
      // Special case for patterns like "Lv. <number>"
      const base = keyword.replace('<number>', '');
      const regex = new RegExp(`(${base}\\.?\\s*\\d+)`, 'gi');
      text = text.replace(regex, '<span class="highlight-percent">$1</span>');
    } else {
      const regex = new RegExp(`(${keyword})`, 'gi');
      text = text.replace(regex, '<span class="highlight-percent">$1</span>');
    }
  });

  // Highlight percentages (e.g. 72%, 42.5%)
  text = text.replace(/(\d+(\.\d+)?%)/g, '<span class="highlight-percent">$1</span>');

  // Underline time durations like 0.5s, 3s, 1 second(s)
  text = text.replace(/(\d+(\.\d+)?\s?(s|seconds?|second\(s\)))/gi,
    '<span class="highlight-time">$1</span>');

  // Replace newlines with <br>
  text = text.replace(/\n/g, '<br>');

  return text;
}

// Clear dropdown and hide
function clearDropdown() {
  dropdown.innerHTML = '';
  dropdown.style.display = 'none';
}

// Render dropdown items
function renderDropdown(matches) {
  dropdown.innerHTML = '';
  if (matches.length === 0) {
    clearDropdown();
    return;
  }
  matches.forEach(char => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';

    // Character name bold
    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = char.name;

    // Attribute with color class
    const attrSpan = document.createElement('span');
    attrSpan.className = `character-attribute attribute-${char.Attribute}`;
    attrSpan.textContent = char.Attribute;

    // Type with emoji
    const typeSpan = document.createElement('span');
    typeSpan.className = `character-type type-${char.Type}`;
    typeSpan.textContent = char.Type;

    // Container for attr | type
    const infoSpan = document.createElement('span');
    infoSpan.className = 'info';
    infoSpan.appendChild(attrSpan);
    infoSpan.appendChild(document.createTextNode(' | '));
    infoSpan.appendChild(typeSpan);

    item.appendChild(nameSpan);
    item.appendChild(infoSpan);

    item.addEventListener('click', () => {
      clearDropdown();
      searchInput.value = char.name;
      showCharacterDetails(char);
    });

    dropdown.appendChild(item);
  });
  dropdown.style.display = 'block';
}

// Show character details on page
function showCharacterDetails(char) {
  characterDetails.innerHTML = '';

  const title = document.createElement('h2');
  title.textContent = char.name;
  characterDetails.appendChild(title);

  // Attribute and Type with styles
  const attrTypeDiv = document.createElement('div');
  const attrSpan = document.createElement('span');
  attrSpan.className = `character-attribute attribute-${char.Attribute}`;
  attrSpan.textContent = char.Attribute;
  attrSpan.style.marginRight = '10px';

  const typeSpan = document.createElement('span');
  typeSpan.className = `character-type type-${char.Type}`;
  typeSpan.textContent = char.Type;

  attrTypeDiv.appendChild(attrSpan);
  attrTypeDiv.appendChild(typeSpan);
  characterDetails.appendChild(attrTypeDiv);

  // Character Image
  if (char.image_path) {
    const img = document.createElement('img');
    img.className = 'character-image';
    // Use relative path from assets folder (assumed)
    // Make sure images are correctly referenced relative to site root
    img.src = char.image_path.replace(/\\/g, '/');
    img.alt = char.name;
    characterDetails.appendChild(img);
  }

  // Helper to create skill section
  function createSkillSection(title, content) {
    if (!content) return;
    const skillTitle = document.createElement('div');
    skillTitle.className = 'skill-title';
    skillTitle.textContent = title;
    characterDetails.appendChild(skillTitle);

    const skillContent = document.createElement('p');
    skillContent.innerHTML = highlightStats(content);
    characterDetails.appendChild(skillContent);
  }

  createSkillSection('Normal Skill', char.Normal_Skill);
  createSkillSection('Special Skill', char.Special_Skill);
  createSkillSection('Ultimate Move', char.Ultimate_Move);
}

// On search input change
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    clearDropdown();
    characterDetails.innerHTML = '';
    return;
  }
  const matches = characters.filter(c =>
    c.name.toLowerCase().includes(query) ||
    (c.Attribute && c.Attribute.toLowerCase().includes(query)) ||
    (c.Type && c.Type.toLowerCase().includes(query))
  );
  renderDropdown(matches.slice(0, 15)); // Limit to 15 results max
});

// Hide dropdown if clicking outside
document.addEventListener('click', (e) => {
  if (!dropdown.contains(e.target) && e.target !== searchInput) {
    clearDropdown();
  }
});

// Initialization
async function init() {
  await loadStatsKeywords();
  await loadCharacters();
}

init();
