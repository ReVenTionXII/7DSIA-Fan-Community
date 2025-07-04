document.getElementById('searchButton').addEventListener('click', () => {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!query) {
    alert('Please enter a search term.');
    return;
  }
  fetch('database/characters.json')
    .then(res => res.json())
    .then(characters => {
      const resultsContainer = document.getElementById('results');
      resultsContainer.innerHTML = '';

      // Filter characters by name, affiliation, attribute, or type
      const filtered = characters.filter(char =>
        char.name.toLowerCase().includes(query) ||
        (char.Affiliation && char.Affiliation.toLowerCase().includes(query)) ||
        (char.Attribute && char.Attribute.toLowerCase().includes(query)) ||
        (char.Type && char.Type.toLowerCase().includes(query))
      );

      if (filtered.length === 0) {
        resultsContainer.innerHTML = `<p>No characters found for "<b>${query}</b>".</p>`;
        return;
      }

      // Emoji and color maps
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

      const attributeClasses = {
        "DEX": "attribute-dex",
        "VIT": "attribute-vit",
        "STR": "attribute-str",
        "INT": "attribute-int"
      };

      // Regex to highlight keywords and % and time durations
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
      const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
      const percentRegex = /(\d+(\.\d+)?%)/g;
      const timeRegex = /(\d+(\.\d+)?s)/g;

      function highlightText(text) {
        return text
          .replace(keywordRegex, '<span class="highlight-keyword">$1</span>')
          .replace(percentRegex, '<span class="highlight-percent">$1</span>')
          .replace(timeRegex, '<span class="underline-time">$1</span>')
          .replace(/\n/g, '<br>');
      }

      filtered.forEach(char => {
        // Extract filename from image_path
        let imgName = '';
        if (char.image_path) {
          imgName = char.image_path.split(/[/\\]/).pop().replace(/\s/g, '_');
        }
        const imgSrc = `assets/characters/${imgName}`;

        const attrEmoji = attributeEmojis[char.Attribute] || '';
        const typeEmoji = typeEmojis[char.Type] || '';
        const attrClass = attributeClasses[char.Attribute] || '';

        const card = document.createElement('div');
        card.classList.add('character-card');
        card.innerHTML = `
          <img src="${imgSrc}" alt="${char.name}" loading="lazy">
          <h2>${char.name}</h2>
          <p><b>Attribute:</b> <span class="${attrClass}">${attrEmoji} <b>${char.Attribute || ''}</b></span></p>
          <p><b>Type:</b> ${typeEmoji} <b>${char.Type || ''}</b></p>
          <p><b>Normal Skill:</b><br>${highlightText(char.Normal_Skill)}</p>
          <p><b>Special Move:</b><br>${highlightText(char.Special_Skill)}</p>
          <p><b>Ultimate Move:</b><br>${highlightText(char.Ultimate_Move)}</p>
        `;

        resultsContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById('results').innerHTML = '<p>Failed to load character data.</p>';
    });
});
