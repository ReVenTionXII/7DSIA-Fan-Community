document.getElementById('searchButton').addEventListener('click', () => {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!query) {
    alert('Please enter a search term.');
    return;
  }
  fetch('database/characters.json')
    .then(response => response.json())
    .then(data => {
      const resultsContainer = document.getElementById('results');
      resultsContainer.innerHTML = '';

      const filtered = data.filter(char =>
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

      filtered.forEach(character => {
        let imgName = '';
        if (character.image_path) {
          imgName = character.image_path.split(/[/\\]/).pop();
          imgName = imgName.replace(/\s/g, '_');
        }

        const imgSrc = `assets/characters/${imgName}`;

        const attributeEmoji = attributeEmojis[character.Attribute] || '';
        const typeEmoji = typeEmojis[character.Type] || '';

        function formatSkillText(text) {
          if (!text) return '';
          text = text.replace(/\n/g, ' ');
          const keywords = [
            "Attack",
            "Attack Speed",
            "Accuracy",
            "Crit Chance",
            "Crit Damage",
            "Movement Speed",
            "Defense",
            "HP",
            "Evasion",
            "Crit Resistance",
            "Crit Defense"
          ];
          keywords.forEach(k => {
            // Case sensitive replacement using word boundaries
            const re = new RegExp(`\\b${k}\\b`, 'g');
            text = text.replace(re, `<span class="keyword">${k}</span>`);
          });
          // Underline durations like "2s", "0.5s"
          text = text.replace(/(\d+(\.\d+)?s)/g, '<span class="duration">$1</span>');
          // Highlight percentages like "1093%", "20%"
          text = text.replace(/(\d+(\.\d+)?%)/g, '<span class="percentage">$1</span>');
          return text;
        }

        const card = document.createElement('div');
        card.classList.add('character-card');
        card.innerHTML = `
          <img src="${imgSrc}" alt="${character.name}">
          <h2>${character.name}</h2>
          <div class="attribute-type">
            <p>${attributeEmoji} ${character.Attribute || ''}</p>
            <p>${typeEmoji} ${character.Type || ''}</p>
          </div>
          <p class="skill"><b>Normal Skill:</b> ${formatSkillText(character.Normal_Skill)}</p>
          <p class="skill"><b>Special Move:</b> ${formatSkillText(character.Special_Skill)}</p>
          <p class="skill"><b>Ultimate Move:</b> ${formatSkillText(character.Ultimate_Move)}</p>
        `;

        resultsContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Error fetching character data:', err);
      document.getElementById('results').innerHTML = '<p>Failed to load character data.</p>';
    });
});
