// main.js

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resultsContainer = document.getElementById("results");

// Load stats keywords (hardcoded here or fetch from stats.json if you want)
const statsKeywords = [
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
  "Crit Defense",
  "Lv."
];

// Helper: map Attribute to color
function getColorByAttribute(attr) {
  switch (attr) {
    case "DEX": return "#1E90FF"; // Blue
    case "VIT": return "#32CD32"; // Green
    case "STR": return "#FF4500"; // Red
    case "INT": return "#FFA500"; // Orange
    default: return "#FFFFFF"; // white fallback
  }
}

// Helper: map Type to emoji
function getEmojiByType(type) {
  switch(type) {
    case "DPS": return "⚔️";     // Sword
    case "VIT": return "❤️";     // Heart
    case "Tank": return "🛡️";    // Shield
    case "Debuffer": return "🌙"; // Moon
    default: return "";
  }
}

// Highlight keywords bold and underline time durations like "0.5s"
function highlightText(text) {
  if (!text) return "";

  // Escape regex special chars in keywords
  const escapedKeywords = statsKeywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  // Match whole keywords ignoring case
  const keywordsRegex = new RegExp(`\\b(${escapedKeywords.join("|")})\\b`, "gi");

  // Replace keywords with bold
  let highlighted = text.replace(keywordsRegex, match => `<strong>${match}</strong>`);

  // Underline time durations like 0.5s, 3s etc.
  const timeRegex = /(\b\d+(\.\d+)?s\b)/gi;
  highlighted = highlighted.replace(timeRegex, match => `<u>${match}</u>`);

  return highlighted;
}

let characters = [];

// Load characters.json from your GitHub Pages /database folder
fetch("database/characters.json")
  .then(res => res.json())
  .then(data => {
    characters = data;
  })
  .catch(err => {
    resultsContainer.innerHTML = `<p>Error loading characters database.</p>`;
    console.error(err);
  });

// Display search results
function displayResults(filtered) {
  resultsContainer.innerHTML = "";

  if (!filtered.length) {
    resultsContainer.innerHTML = "<p>No characters found.</p>";
    return;
  }

  filtered.forEach(char => {
    const card = document.createElement("div");
    card.classList.add("character-card");

    // Name
    const nameEl = document.createElement("h3");
    nameEl.textContent = char.name;
    card.appendChild(nameEl);

    // Attribute and Type with color & emoji
    const attrType = document.createElement("div");
    attrType.classList.add("character-attr-type");

    const attrSpan = document.createElement("span");
    attrSpan.textContent = char.Attribute;
    attrSpan.style.color = getColorByAttribute(char.Attribute);
    attrSpan.style.fontWeight = "bold";

    const typeSpan = document.createElement("span");
    typeSpan.textContent = `${getEmojiByType(char.Type)} ${char.Type}`;
    typeSpan.style.fontWeight = "bold";
    typeSpan.style.marginLeft = "8px";

    attrType.appendChild(attrSpan);
    attrType.appendChild(document.createTextNode(" | "));
    attrType.appendChild(typeSpan);
    card.appendChild(attrType);

    // Image (adjust path if needed)
    if(char.image_path) {
      const img = document.createElement("img");
      // Convert Windows path to relative web path (example)
      // Change accordingly to where your images are hosted
      const filename = char.image_path.split("\\").pop();
      img.src = `assets/characters/${filename}`;
      img.alt = char.name;
      img.style.width = "100%";
      img.style.borderRadius = "8px";
      img.style.marginTop = "8px";
      card.appendChild(img);
    }

    // Skills: Normal_Skill, Special_Skill, Ultimate_Move
    ['Normal_Skill', 'Special_Skill', 'Ultimate_Move'].forEach(skillKey => {
      if(char[skillKey]){
        const skillEl = document.createElement("p");
        // convert \n to <br> and highlight text
        const formatted = highlightText(char[skillKey].replace(/\n/g, "<br>"));
        skillEl.innerHTML = formatted;
        card.appendChild(skillEl);
      }
    });

    resultsContainer.appendChild(card);
  });
}

// Search handler
searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    resultsContainer.innerHTML = "<p>Please enter a search term.</p>";
    return;
  }

  const filtered = characters.filter(char =>
    char.name.toLowerCase().includes(query) ||
    (char.Attribute && char.Attribute.toLowerCase().includes(query)) ||
    (char.Type && char.Type.toLowerCase().includes(query)) ||
    (char.Affiliation && char.Affiliation.toLowerCase().includes(query)) ||
    (char.Rank && char.Rank.toLowerCase().includes(query))
  );

  displayResults(filtered);
});

// Optional: allow search on pressing Enter key
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchButton.click();
  }
});
