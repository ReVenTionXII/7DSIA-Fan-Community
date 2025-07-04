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
        char.name?.toLowerCase().includes(query) ||
        char.Affiliation?.toLowerCase().includes(query) ||
        char.Attribute?.toLowerCase().includes(query) ||
        char.Type?.toLowerCase().includes(query)
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
        // Extract and clean image filename
        let imgName = character.image_path?.split(/[/\\]/).pop() || '';
        imgName = imgName.replace(/\s/g, '_');

        const imgSrc = `assets/characters/${imgName}`;
        const attributeEmoji = attributeEmojis[character.Attribute] || '';
        const typeEmoji = typeEmojis[character.Type] || '';

        const formatText = (text = '') =>
          text
            .replace(/\n/g, '<br>')
            .replace(/(\d+(\.\d+)?%)/g, '<b>$1</b>')      // Bold percentages
            .replace(/(\d+(\.\d+)?s)/g, '<u>$1</u>');      // Underline durations

        const card = document.createElement('div');
        card.classList.add('character-card');
        card.innerHTML = `
          <img src="${imgSrc}" alt="${character.name}" style="max-width:100%; border-radius:8px;">
          <h2>${character.name}</h2>
          <p><b>Attribute:</b> ${attributeEmoji} <b>${character.Attribute || ''}</b></p>
          <p><b>Type:</b> ${typeEmoji} <b>${character.Type || ''}</b></p>
          <p><b>Normal Skill:</b><br>${formatText(character.Normal_Skill)}</p>
          <p><b>Special Move:</b><br>${formatText(character.Special_Skill)}</p>
          <p><b>Ultimate Move:</b><br>${formatText(character.Ultimate_Move)}</p>
        `;

        resultsContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Error fetching character data:', err);
      document.getElementById('results').innerHTML = '<p>Failed to load character data.</p>';
    });
});
