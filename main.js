// main.js

// Load characters and stats data
async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

let characters = [];
let stats = [];

async function init() {
  try {
    characters = await loadJSON('database/characters.json');
    const statsData = await loadJSON('database/stats.json');
    stats = statsData.keywords.map(k => k.toLowerCase());

    renderCharacters(characters);

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = characters.filter(char => 
        char.name.toLowerCase().includes(term) ||
        (char.Attribute && char.Attribute.toLowerCase().includes(term)) ||
        (char.Type && char.Type.toLowerCase().includes(term))
      );
      renderCharacters(filtered);
    });
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Helper: Highlight stats and underline durations
function highlightText(text) {
  if (!text) return '';

  // Escape HTML
  text = text.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
    }
  });

  // Highlight keywords with bold
  stats.forEach(keyword => {
    // Escape special regex characters in keyword
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Support Lv. <number> style with regex wildcard
    const regexStr = escaped.includes('<number>') 
      ? escaped.replace('<number>', '\\d+') 
      : escaped;
    const regex = new RegExp(`\\b(${regexStr})\\b`, 'gi');
    text = text.replace(regex, '<strong>$1</strong>');
  });

  // Underline time durations like 0.5s, 2s etc.
  const durationRegex = /(\d+(\.\d+)?s)/gi;
  text = text.replace(durationRegex, '<u>$1</u>');

  return text;
}

// Render characters in the results container
function renderCharacters(chars) {
  const container = document.getElementById('results');
  container.innerHTML = '';

  if (chars.length === 0) {
    container.innerHTML = '<p>No characters found.</p>';
    return;
  }

  chars.forEach(char => {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.tabIndex = 0;

    // Attribute color class
    const attrClass = `attribute-${char.Attribute ? char.Attribute.toUpperCase() : ''}`;
    const typeClass = `type-${char.Type ? char.Type : ''}`;

    card.innerHTML = `
      <img src="${char.image_path || 'https://via.placeholder.com/150?text=No+Image'}" alt="${char.name}" />
      <div class="name">${char.name}</div>
      <div class="attribute-type">
        <span class="attribute ${attrClass}">${char.Attribute || 'N/A'}</span>
        <span class="type ${typeClass}">${char.Type || 'N/A'}</span>
      </div>
      <div class="skills">
        <h4>Normal Skill</h4>
        <p>${highlightText(char.Normal_Skill)}</p>
        <h4>Special Skill</h4>
        <p>${highlightText(char.Special_Skill)}</p>
        <h4>Ultimate Move</h4>
        <p>${highlightText(char.Ultimate_Move)}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

window.addEventListener('DOMContentLoaded', init);
