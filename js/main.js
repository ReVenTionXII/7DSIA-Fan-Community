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

  // Check if Build_Recommendations is an object or string
  if (typeof data.Build_Recommendations === 'object' && data.Build_Recommendations) {
    p2pContent = data.Build_Recommendations.P2P || `Edit P2P recommendations for ${characterName} here (e.g., strategies for paid players)`;
    f2pContent = data.Build_Recommendations.F2P || `Edit F2P recommendations for ${characterName} here (e.g., strategies for free-to-play players)`;
  } else {
    // Fallback for current "Build tips coming soon!" string
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
    card.style.animationDelay = `${index * 0.1}s`; // Staggered animation

    card.innerHTML = `
      <img src="${imgSrc}" alt="${char.name}">
      <h2>${char.name}</h2>

      <div class="attribute-type">
        <p>${attrEmoji[char.Attribute] || ""} ${char.Attribute || ""}  
           ${typeEmoji[char.Type] || ""} ${char.Type || ""}</p>
      </div>

      ${skillHTML(char.Normal_Skill, "Normal Skill")}
      ${skillHTML(char.Special_Skill, "Special Move")}
      ${skillHTML(char.Ultimate_Move, "Ultimate Move")}
      ${BuildHTML(char, char.name)}
    `;

    results.appendChild(card);
  });
}

// Fetch all characters but don't render
function fetchCharacters() {
  fetch("database/characters.json")
    .then(r => r.json())
    .then(data => {
      window.allCharacters = data; // Store globally for filtering
      document.getElementById("results").innerHTML = "<p>Please use the search bar to find characters.</p>";
    })
    .catch(err => {
      console.error(err);
      document.getElementById("results").innerHTML = "<p>Failed to load character data. Please try again later.</p>";
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

// Setup event listeners
document.getElementById("searchButton").addEventListener("click", () => {
  const query = document.getElementById("searchInput").value.trim();
  searchCharacters(query);
});

// Also filter on Enter key inside search box
document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    document.getElementById("searchButton").click();
  }
});

// Initial load - fetch data but don't render
fetchCharacters();