document.getElementById('searchButton').addEventListener('click', () => {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!query) {
    alert('Please enter a search term.');
    return;
  }

  Promise.all([
    fetch('database/characters.json').then(res => res.json()),
    fetch('database/stats.json').then(res => res.json())
  ])
  .then(([characters, stats]) => {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    // Keywords from stats.json
    const keywords = stats.keywords.map(k => k.toLowerCase());

    // Highlight function for skills text
    function highlightText(text) {
      if (!text) return '';
      // Escape regex special chars for keywords
      const escapedKeywords = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      // Regex to match keywords, case-insensitive
      const regex = new RegExp(`\\b(${escapedKeywords.join('|')})\\b`, 'gi');
      // Replace keywords with span.highlight
      let highlighted = text.replace(regex, match => `<span class="keyword">${match}</span>`);

      // Underline durations like "0.5s", "2s"
      highlighted = highlighted.replace(/(\d+(\.\d+)?s)/g, '<span class="duration">$1</span>');

      // Remove all \n and use paragraphs, split by two or more spaces or line breaks
      // But since original text may have newlines as linebreak markers, replace them with space first
      highlighted = highlighted.replace(/\n/g, ' ');

      // Wrap whole in <p> if not already, we will handle in caller, so just return string here
      return highlighted;
    }

    // Filter characters by name, affiliation, attribute, or type
    const filtered = characters.filter(char =>
      char.name.toLowerCase().includes(query) ||
      (char.Affiliation && char.Affiliation.toLowerCase().includes(query)) ||
      (char.Attribute && char.Attribute.toLowerCase().includes(query)) ||
      (char.Type && char.Type.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `<p>No characters found for "${query}".</p>`;
      return;
    }

    // Attribute and Type emojis
    const attributeEmojis = {
      "DEX": "🔵",
      "VIT": "🟢",
      "STR": "🔴",
      "INT": "🟠"
    };
    const typeEmojis = {
      "DPS": "🗡️",
      "VIT": "❤️",
      "Tank": "🛡️",
      "Debuffer": "🌙",
      "Support": "🚑"
    };

    filtered.forEach(character => {
      let imgName = '';
      if (character.image_path) {
        imgName = character.image_path.split(/[/\\]/).pop();
        imgName = imgName.replace(/\s/g, '_');
      }
      const imgSrc = `assets/characters/${imgName}`;

      const attributeEmoji = attributeEmojis[character.Attribute] || '';
      const typeEmoji = typeEmojis[character.Type] || '';

      const card = document.createElement('div');
      card.classList.add('character-card');
      card.innerHTML = `
        <img src="${imgSrc}" alt="${character.name}" loading="lazy" />
        <h2>${character.name}</h2>
        <div class="attr-type">
          <p><span>${attributeEmoji}</span> ${character.Attribute || 'Unknown'}</p>
          <p><span>${typeEmoji}</span> ${character.Type || 'Unknown'}</p>
        </div>
        <p class="skill"><b>Normal Skill:</b> ${highlightText(character.NormalSkill)}</p>
        <p class="skill"><b>Special Move:</b> ${highlightText(character.SpecialMove)}</p>
        <p class="skill"><b>Ultimate Move:</b> ${highlightText(character.UltimateMove)}</p>
      `;
      resultsContainer.appendChild(card);
    });
  })
  .catch(() => {
    alert('Failed to load character or stats data.');
  });
});

// Optional: support Enter key for search input
document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('searchButton').click();
});
