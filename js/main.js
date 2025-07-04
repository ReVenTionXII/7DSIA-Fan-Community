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

      // Filter characters by name, affiliation, attribute, or type
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

      // Emojis for attribute and type
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
        // Extract just the filename from full image path
        let imgName = '';
        if (character.image_path) {
          imgName = character.image_path.split(/[/\\]/).pop(); // filename only
          imgName = imgName.replace(/\s/g, '_'); // spaces to underscores
        }
        const imgSrc = `assets/characters/${imgName}`;

        // Emojis for this character
        const attributeEmoji = attributeEmojis[character.Attribute] || '';
        const typeEmoji = typeEmojis[character.Type] || '';

        const card = document.createElement('div');
        card.classList.add('character-card');
        card.innerHTML = `
          <img src="${imgSrc}" alt="${character.name}">
          <h2>${character.name}</h2>
          <p class="attribute"><span>${attributeEmoji} ${character.Attribute || ''}</span></p>
          <p class="type"><span>${typeEmoji} ${character.Type || ''}</span></p>
          <p class="skill"><b>Normal Skill:</b><br>${character.Normal_Skill.replace(/\n/g, '<br>')}</p>
          <p class="skill"><b>Special Move:</b><br>${character.Special_Skill.replace(/\n/g, '<br>')}</p>
          <p class="skill"><b>Ultimate Move:</b><br>${character.Ultimate_Move.replace(/\n/g, '<br>')}</p>
        `;

        resultsContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Error fetching character data:', err);
      document.getElementById('results').innerHTML = '<p>Failed to load character data.</p>';
    });
});
