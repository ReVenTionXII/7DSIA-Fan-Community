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

  Promise.all([
    fetch('database/characters.json').then(res => res.json()),
    fetch('database/stats.json').then(res => res.json())
  ]).then(([characters, stats]) => {
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

    const statsMap = {};
    stats.forEach(stat => {
      statsMap[stat.id] = stat;
    });

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

      const stat = statsMap[character.id];

      const statsHtml = stat ? `
        <p class="stats">
          <b>HP:</b> ${stat.hp || 'N/A'} &nbsp;&nbsp;
          <b>Attack:</b> ${stat.attack || 'N/A'} &nbsp;&nbsp;
          <b>Defense:</b> ${stat.defense || 'N/A'}
        </p>
      ` : '';

      const card = document.createElement('div');
      card.classList.add('character-card');
      card.innerHTML = `
        <img src="${imgSrc}" alt="${character.name}">
        <h2>${character.name}</h2>
        <div class="attribute-type">
          <p><span class="emoji">${attributeEmoji}</span> <span class="label">${character.Attribute || ''}</span></p>
          <p><span class="emoji">${typeEmoji}</span> <span class="label">${character.Type || ''}</span></p>
        </div>
        ${statsHtml}
        <p class="skill"><b>Normal Skill:</b><br>${formatSkillText(character.Normal_Skill)}</p>
        <p class="skill"><b>Special Move:</b><br>${formatSkillText(character.Special_Skill)}</p>
        <p class="skill"><b>Ultimate Move:</b><br>${formatSkillText(character.Ultimate_Move)}</p>
      `;

      resultsContainer.appendChild(card);
    });
  })
  .catch(err => {
    console.error('Error fetching data:', err);
    document.getElementById('results').innerHTML = '<p>Failed to load character or stats data.</p>';
  });
});
