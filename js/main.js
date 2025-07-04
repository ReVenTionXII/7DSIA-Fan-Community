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

      const keywordRegex = new RegExp(`\\b(${stats.keywords.join('|').replace(/\./g, '\\.')})\\b`, 'gi');
      const durationRegex = /\b(\d+(\.\d+)?s)\b/gi;

      function formatSkill(text) {
        return text
          .replace(/\n/g, '<br>')
          .replace(keywordRegex, '<span class="keyword">$1</span>')
          .replace(durationRegex, '<span class="duration">$1</span>');
      }

      filtered.forEach(character => {
        const imgName = character.image_path
          ? character.image_path.split(/[/\\]/).pop().replace(/\s/g, '_')
          : '';
        const imgSrc = `assets/characters/${imgName}`;

        const attributeEmoji = attributeEmojis[character.Attribute] || '';
        const typeEmoji = typeEmojis[character.Type] || '';

        const card = document.createElement('div');
        card.classList.add('character-card');
        card.innerHTML = `
          <img src="${imgSrc}" alt="${character.name}">
          <h2>${character.name}</h2>
          <div class="meta">
            <span class="attribute">${attributeEmoji} ${character.Attribute || ''}</span>
            <span class="type">${typeEmoji} ${character.Type || ''}</span>
          </div>
          <p class="skill"><b>Normal Skill:</b><br>${formatSkill(character.Normal_Skill || '')}</p>
          <p class="skill"><b>Special Move:</b><br>${formatSkill(character.Special_Skill || '')}</p>
          <p class="skill"><b>Ultimate Move:</b><br>${formatSkill(character.Ultimate_Move || '')}</p>
        `;
        resultsContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Error loading data:', err);
      document.getElementById('results').innerHTML = '<p>Failed to load character or stats data.</p>';
    });
});
