// Search button event
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

      filtered.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';

        card.innerHTML = `
          <img src="${char.image}" alt="${char.name}" />
          <div class="character-header">
            <h2>${char.name}</h2>
            <div class="attr-type">
              <span>${char.Attribute}</span>
              <span>${char.Type}</span>
            </div>
          </div>
          <p class="skill"><b>Normal Skill:</b><br>${char.Skill}</p>
          <p class="skill"><b>Special Move:</b><br>${char.Special}</p>
          <p class="skill"><b>Ultimate Move:</b><br>${char.Ultimate}</p>
        `;
        resultsContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error loading characters:', error);
    });
});

// Share dropdown toggle
document.addEventListener('click', (e) => {
  const shareContainer = document.querySelector('.share-container');
  const shareList = document.querySelector('.share-list');
  if (!shareContainer || !shareList) return;

  if (e.target.classList.contains('btn-share')) {
    shareList.classList.toggle('active');
  } else if (!shareContainer.contains(e.target)) {
    shareList.classList.remove('active');
  }
});

// Share Facebook
document.querySelector('.btn-share-facebook').addEventListener('click', () => {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
});

// Share Twitter (X)
document.querySelector('.btn-share-twitter').addEventListener('click', () => {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://twitter.com/intent/tweet?url=${url}`, '_blank');
});

// Copy Link to Clipboard
document.querySelector('.btn-share-link').addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href)
    .then(() => alert('Link copied to clipboard!'))
    .catch(() => alert('Failed to copy link.'));
});
