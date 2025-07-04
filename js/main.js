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

// Mentor recommendation box
function mentorHTML(data) {
  const icon = "🎓";
  const p2pContent = "Mentor tips coming soon! Stay tuned.";
  const f2pContent = "Mentor tips coming soon! Stay tuned.";
  
  return `
    <div class="skill-section mentor-highlight">
      <p class="skill-header" style="font-size:1.15rem;color:#ffd700;">
        ${icon} Mentor Recommendations
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
    results.innerHTML = `<p>No characters found.</p>`;
    return;
  }

  characters.forEach(char => {
    const imgSrc = char.image_path || "assets/characters/placeholder.png";

    const card = document.createElement("div");
    card.classList.add("character-card");
    card.style.setProperty("--glow-color", glowColor[char.Attribute] || "#5865f2");

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
      ${mentorHTML(char.Mentor_Recommendations, "Mentor Recommendations")}
    `;

    results.appendChild(card);
  });
}

// Fetch all characters and render
function fetchAndRenderAll() {
  fetch("database/characters.json")
    .then(r => r.json())
    .then(data => {
      window.allCharacters = data; // store globally for filtering
      renderCharacters(data);
    })
    .catch(err => {
      console.error(err);
      document.getElementById("results").innerHTML = "<p>Failed to load character data.</p>";
    });
}

// Filter characters by search query and render
function searchCharacters(query) {
  if (!query) {
    renderCharacters(window.allCharacters || []);
    return;
  }
  query = query.toLowerCase();
  const filtered = (window.allCharacters || []).filter(c =>
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
  if (!query) {
    alert("Please enter a search term.");
    return;
  }
  searchCharacters(query);
});

// Also filter on Enter key inside search box
document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    document.getElementById("searchButton").click();
  }
});

// Initial load
fetchAndRenderAll();