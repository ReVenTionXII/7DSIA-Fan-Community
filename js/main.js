function formatSkillText(text) {
  if (!text) return '';
  return text
    .replace(/\n{2,}/g, '<br><br>')  // multiple newlines => paragraph break
    .replace(/\n/g, ' ');             // single newline => space
}

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

      // Filter characters by name or affiliation or attribute or type
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
        // Extract filename from full image path and fix spaces
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
          <img src="${imgSrc}" alt="${character.name}">
          <h2>${character.name}</h2>
          <div class="attribute-type">
            <p><span class="emoji">${attributeEmoji}</span> <span class="label">${character.Attribute || ''}</span></p>
            <p><span class="emoji">${typeEmoji}</span> <span class="label">${character.Type || ''}</span></p>
          </div>
          <p class="skill"><b>Normal Skill:</b><br>${formatSkillText(character.Normal_Skill)}</p>
          <p class="skill"><b>Special Move:</b><br>${formatSkillText(character.Special_Skill)}</p>
          <p class="skill"><b>Ultimate Move:</b><br>${formatSkillText(character.Ultimate_Move)}</p>
        `;

        resultsContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Error fetching character data:', err);
      document.getElementById('results').innerHTML = '<p>Failed to load character data.</p>';
    });
});
