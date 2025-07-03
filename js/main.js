// --- Load characters.json and stats.json ---
let characters = [];
let stats = [];

async function loadData() {
  try {
    const charResponse = await fetch("database/characters.json");
    characters = await charResponse.json();

    const statsResponse = await fetch("database/stats.json");
    const statsData = await statsResponse.json();
    stats = statsData.keywords || [];
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

// --- Highlight keywords and stats ---
function highlightStats(text) {
  if (!text) return "";

  // Highlight keywords from stats.json
  const keywordRegex = new RegExp(`\\b(${stats.join("|")})\\b`, "gi");
  text = text.replace(keywordRegex, "<strong>$1</strong>");

  // Highlight percentage numbers like 15%, 100%
  text = text.replace(/(\d+(\.\d+)?%)/g, "<strong>$1</strong>");

  // Underline time durations like 0.5s
  text = text.replace(/(\d+(\.\d+)?s)/g, "<u>$1</u>");

  return text;
}

// --- Display a character's full details ---
function displayCharacter(character) {
  const container = document.getElementById("character-results");
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "character-card";

  const name = document.createElement("h2");
  name.textContent = character.name;

  const info = document.createElement("p");
  info.innerHTML = `
    <strong>Attribute:</strong> ${character.Attribute || "N/A"}<br>
    <strong>Type:</strong> ${character.Type || "N/A"}<br>
    <strong>Affiliation:</strong> ${character.Affiliation || "N/A"}<br>
    <strong>Rank:</strong> ${character.Rank || "N/A"}<br><br>

    <strong>Normal Skill:</strong><br>${highlightStats(character.Normal_Skill || "N/A")}<br><br>
    <strong>Special Skill:</strong><br>${highlightStats(character.Special_Skill || "N/A")}<br><br>
    <strong>Ultimate Move:</strong><br>${highlightStats(character.Ultimate_Move || "N/A")}
  `;

  if (character.image_path) {
    const img = document.createElement("img");
    img.src = character.image_path;
    img.alt = character.name;
    card.appendChild(img);
  }

  card.appendChild(name);
  card.appendChild(info);
  container.appendChild(card);
}

// --- Handle the search ---
function searchCharacters(term) {
  term = term.toLowerCase().trim();
  if (!term) return [];

  return characters.filter(char => {
    return (
      (char.name && char.name.toLowerCase().includes(term)) ||
      (char.Attribute && char.Attribute.toLowerCase().includes(term)) ||
      (char.Type && char.Type.toLowerCase().includes(term))
    );
  });
}

// --- Handle form submit ---
document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = document.getElementById("search-input").value;
  const results = searchCharacters(searchTerm);

  const container = document.getElementById("character-results");
  container.innerHTML = "";

  if (results.length === 0) {
    container.textContent = "No characters found.";
  } else if (results.length === 1) {
    displayCharacter(results[0]);
  } else {
    // Multiple results: display list with clickable names
    const list = document.createElement("ul");
    results.forEach((char) => {
      const li = document.createElement("li");
      li.textContent = `${char.name} — ${char.Attribute || "N/A"} | ${char.Type || "N/A"}`;
      li.className = "character-list-item";
      li.style.cursor = "pointer";
      li.addEventListener("click", () => displayCharacter(char));
      list.appendChild(li);
    });
    container.appendChild(list);
  }
});

// --- Initialize ---
loadData();
