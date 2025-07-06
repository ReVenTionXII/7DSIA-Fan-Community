// Initialize particles.js
particlesJS('particles-js', {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: '#00e5ff' },
    shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
    opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1 } },
    size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.3 } },
    line_linked: { enable: false },
    move: { enable: true, speed: 2, direction: 'none', random: true, straight: false, out_mode: 'out' }
  },
  interactivity: {
    detect_on: 'canvas',
    events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
    modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
  },
  retina_detect: true
});

// Parallax effect for banner
window.addEventListener('scroll', () => {
  const banner = document.getElementById('parallax-banner');
  const scrollPosition = window.pageYOffset;
  banner.style.transform = `translateY(${scrollPosition * 0.3}px)`;
});

// Highlighting helper function
function highlight(txt = "") {
  txt = txt.replace(/\n/g, " ");
  const keyWords = [
    "Attack","Attack Speed","Accuracy","Crit Chance","Crit Damage",
    "Movement Speed","Defense","HP","Evasion","Crit Resistance","Crit Defense"
  ];
  keyWords.forEach(k => {
    txt = txt.replace(new RegExp(`\\b${k}\\b`, "g"), `<span class="keyword">${k}</span>`);
  });
  txt = txt.replace(/(\d+(\.\d+)?%)/g, '<span class="percentage">$1</span>');
  txt = txt.replace(/\b\d+(\.\d+)?s\b/g, '<span class="duration">$&</span>');
  txt = txt.replace(/\b\d+(\.\d+)?m(\s*x\s*\d+(\.\d+)?m)?\b/g,
                    m => `<span class="area-range">${m}</span>`);
  return txt;
}

// Create skill HTML with category label
function skillHTML(obj, cat) {
  if (!obj) return "";
  const nm = obj.Name || "";
  const des = highlight(obj.Description || "");
  return `
    <div class="skill-section">
      <p class="skill-header"><b>${cat}</b> – ${nm}</p>
      <p class="skill-desc">${des}</p>
    </div>`;
}

// Build recommendation box
function BuildHTML(data, characterName) {
  const icon = "🎓";
  let p2pContent, f2pContent;

  if (typeof data.Build_Recommendations === 'object' && data.Build_Recommendations) {
    p2pContent = data.Build_Recommendations.P2P || `Edit P2P recommendations for ${characterName} here (e.g., strategies for paid players)`;
    f2pContent = data.Build_Recommendations.F2P || `Edit F2P recommendations for ${characterName} here (e.g., strategies for free-to-play players)`;
  } else {
    p2pContent = `Edit P2P recommendations for ${characterName} here (e.g., strategies for paid players)`;
    f2pContent = `Edit F2P recommendations for ${characterName} here (e.g., strategies for free-to-play players)`;
  }
  
  return `
    <div class="skill-section Build-highlight">
      <p class="skill-header" style="font-size:1.15rem;color:#ffd700;">
        ${icon} Build Recommendations
      </p>
      <p class="skill-desc"><b>P2P:</b> ${p2pContent}</p>
      <p class="skill-desc"><b>F2P:</b> ${f2pContent}</p>
    </div>`;
}

// Emoji & glow color maps
const attrEmoji = { DEX: "🔵", VIT: "🟢", STR: "🔴", INT: "🟠" };
const typeEmoji = { DPS: "🗡️", Tank: "🛡️", Debuffer: "🌙", Support: "🚑" };
const glowColor = { DEX: "#3b82f6", VIT: "#22c55e", STR: "#ef4444", INT: "#f97316" };

// Render characters array to the page
function renderCharacters(characters) {
  const results = document.getElementById("results");
  results.innerHTML = "";

  if (!characters.length) {
    results.innerHTML = `<p>No characters found. Please try a different search term.</p>`;
    return;
  }

  characters.forEach((char, index) => {
    const imgSrc = char.image_path || "assets/characters/placeholder.png";

    const card = document.createElement("div");
    card.classList.add("character-card");
    card.style.setProperty("--glow-color", glowColor[char.Attribute] || "#5865f2");
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <img src="${imgSrc}" alt="${char.name}">
      <div class="character-header">
        <h2>${char.name}</h2>
        <p class="subtext">${char.Affiliation || "No Affiliation"}</p>
      </div>

      <div class="attribute-type">
        <p>${attrEmoji[char.Attribute] || ""} ${char.Attribute || ""}  
           ${typeEmoji[char.Type] || ""} ${char.Type || ""}</p>
      </div>

      ${skillHTML(char.Normal_Skill, "Normal Skill")}
      ${skillHTML(char.Special_Skill, "Special Move")}
      ${skillHTML(char.Ultimate_Move, "Ultimate Move")}
      ${BuildHTML(char, char.name)}
    `;

    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });

    results.appendChild(card);
  });
}

// Fetch all characters but don't render
function fetchCharacters() {
  const loader = document.getElementById('loader');
  loader.style.display = 'block';
  fetch("database/characters.json")
    .then(r => r.json())
    .then(data => {
      window.allCharacters = data;
      document.getElementById("results").innerHTML = "<p>Please use the search bar to find characters.</p>";
      loader.style.display = 'none';
    })
    .catch(err => {
      console.error(err);
      document.getElementById("results").innerHTML = "<p>Failed to load character data. Please try again later.</p>";
      loader.style.display = 'none';
    });
}

// Filter characters by search query and render
function searchCharacters(query) {
  if (!query) {
    document.getElementById("results").innerHTML = "<p>Please enter a search term.</p>";
    return;
  }
  if (!window.allCharacters) {
    document.getElementById("results").innerHTML = "<p>Loading character data, please try again...</p>";
    return;
  }
  query = query.toLowerCase();
  const filtered = window.allCharacters.filter(c =>
    c.name.toLowerCase().includes(query) ||
    (c.Affiliation && c.Affiliation.toLowerCase().includes(query)) ||
    (c.Attribute && c.Attribute.toLowerCase().includes(query)) ||
    (c.Type && c.Type.toLowerCase().includes(query))
  );
  renderCharacters(filtered);
}

// Enhanced search with suggestions
document.getElementById("searchInput").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  if (query && window.allCharacters) {
    const filtered = window.allCharacters.filter(c => c.name.toLowerCase().includes(query)).slice(0, 5);
    suggestions.innerHTML = filtered.map(c => `<div class="suggestion-item" onclick="document.getElementById('searchInput').value='${c.name}';searchCharacters('${c.name}');suggestions.classList.remove('active');">${c.name}</div>`).join('');
    suggestions.classList.add('active');
  } else {
    suggestions.classList.remove('active');
  }
});

// Setup event listeners
document.getElementById("searchButton").addEventListener("click", () => {
  const query = document.getElementById("searchInput").value.trim();
  searchCharacters(query);
  document.getElementById("suggestions").classList.remove('active');
});

// Also filter on Enter key inside search box
document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    document.getElementById("searchButton").click();
  }
});

// Initial load - fetch data but don't render
fetchCharacters();

// === Leaf Wind Animation ===

// Create the wind overlay container once and append to body
const windOverlay = document.createElement('div');
windOverlay.id = 'wind-overlay';
document.body.appendChild(windOverlay);

// Function to create a single leaf element
function createLeaf() {
  const leaf = document.createElement('div');
  leaf.classList.add('leaf');

  // Random vertical position (0 to 100vh)
  leaf.style.top = `${Math.random() * 100}vh`;

  // Start just off the left side (-30 to -10 px)
  leaf.style.left = `-${10 + Math.random() * 20}px`;

  // Random animation duration between 6 and 12 seconds
  leaf.style.animationDuration = `${6 + Math.random() * 6}s`;

  // Random animation delay up to 10 seconds
  leaf.style.animationDelay = `${Math.random() * 10}s`;

  // Random scale for size variety (0.6 to 1.2)
  const scale = 0.6 + Math.random() * 0.6;
  leaf.style.transform = `scale(${scale})`;

  windOverlay.appendChild(leaf);

  // Remove leaf after animation finishes (12s max)
  setTimeout(() => {
    leaf.remove();
  }, 12000);
}

// Create a leaf every 400 milliseconds
setInterval(createLeaf, 400);