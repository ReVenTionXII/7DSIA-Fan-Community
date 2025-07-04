// main.js

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

      filtered.forEach(character => {
        // Extract just the filename from full image path
        let imgName = '';
        if (character.image_path) {
          imgName = character.image_path.split(/[/\\]/).pop(); // get filename
          imgName = imgName.replace(/\s/g, '_'); // replace spaces with underscores
        }

        // Prepend the assets folder once
        const imgSrc = `assets/characters/${imgName}`;

        // Attribute and Type emojis and colors
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

        // Build card HTML with emojis and colors
        const attributeEmoji = attributeEmojis[character.Attribute] || '';
        const typeEmoji = typeEmojis[character.Type] || '';

        const card = document.createElement('div');
        card.classList.add('character-card');
        card.innerHTML = `
          <img src="${imgSrc}" alt="${character.name}" style="max-width:100%; border-radius:8px;">
          <h2>${character.name}</h2>
          <p><b>Attribute:</b> <span>${attributeEmoji} <b style="color:inherit;">${character.Attribute || ''}</b></span></p>
          <p><b>Type:</b> ${typeEmoji} <b style="color:inherit;">${character.Type || ''}</b></p>
          <p><b>Normal Skill:</b><br>${character.Normal_Skill.replace(/\n/g, '<br>')}</p>
          <p><b>Special Move:</b><br>${character.Special_Skill.replace(/\n/g, '<br>')}</p>
          <p><b>Ultimate Move:</b><br>${character.Ultimate_Move.replace(/\n/g, '<br>')}</p>
        `;

        resultsContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Error fetching character data:', err);
      document.getElementById('results').innerHTML = '<p>Failed to load character data.</p>';
    });
});
