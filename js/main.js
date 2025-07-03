const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resultsContainer = document.getElementById("results");

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

// Attribute colors
function getColorByAttribute(attr) {
  switch (attr) {
    case "DEX": return "#1E90FF"; // Blue
    case "VIT": return "#32CD32"; // Green
    case "STR": return "#FF4500"; // Red
    case "INT": return "#FFA500"; // Orange
    default: return "#fff";
  }
}

// Type emojis
function getEmojiByType(type) {
  switch(type) {
    case "DPS": return "⚔️";
    case "VIT": return "❤️";
    case "Tank": return "🛡️";
    case "Debuffer": return "🌙";
    default: return "";
  }
}

// Highlight keywords bold and underline durations
function highlightText(text) {
  if (!text) return "";
  const escapedKeywords = statsKeywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const keywordsRegex = new RegExp(`\\b(${escapedKeywords.join("|")})\\b`, "gi");
  let highlighted = text.replace(keywordsRegex, match => `<strong>${match}</strong>`);
  const timeRegex = /(\b\d+(\.\d+)?s\b)/gi;
  highlighted = highlighted.replace(timeRegex, match => `<u>${match}</u>`);
  return highlighted;
}

let characters = [];

fetch("database/characters.json")
  .then(res => res.json())
  .then(data => {
    characters = data;
  })
  .catch(err => {
    resultsContainer.innerHTML = `<p>Error loading characters database.</p>`;
    console.error(err);
  });

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

    // Attribute | Type with colors and emoji
    const attrType = document.createElement("div");
    attrType.classList.add("character-attr-type");

    const attrSpan = document.createElement("span");
    attrSpan.textContent = char.Attribute;
    attrSpan.style.color = getColorByAttribute(char.Attribute);
    attrSpan.style.fontWeight = "bold";

    const typeSpan = document.createElement("span");
    typeSpan.textContent = `${getEmojiByType(char.Type)} ${char.Type}`;
    typeSpan.style.fontWeight = "normal";  // not bold in dropdown, but bold here you can switch to bold if preferred
    typeSpan.style.marginLeft = "6px";

    attrType.appendChild(attrSpan);
    attrType.appendChild(document.createTextNode(" | "));
    attrType.appendChild(typeSpan);
    card.appendChild(attrType);

    // Image
    if (char.image_path) {
      const img = document.createElement("img");
      const filename = char.image_path.split("\\").pop();
      img.src = `assets/characters/${filename}`;
      img.alt = char.name;
      card.appendChild(img);
    }

    // Skills
    ["Normal_Skill", "Special_Skill", "Ultimate_Move"].forEach(skillKey => {
      if (char[skillKey]) {
        const p = document.createElement("p");
        p.innerHTML = highlightText(char[skillKey].replace(/\n/g, "<br>"));
        card.appendChild(p);
      }
    });

    resultsContainer.appendChild(card);
  });
}

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    resultsContainer.innerHTML = "<p>Please enter a search term.</p>";
    return;
  }

  const filtered = characters.filter(char =>
    (char.name && char.name.toLowerCase().includes(query)) ||
    (char.Attribute && char.Attribute.toLowerCase().includes(query)) ||
    (char.Type && char.Type.toLowerCase().includes(query)) ||
    (char.Affiliation && char.Affiliation.toLowerCase().includes(query)) ||
    (char.Rank && char.Rank.toLowerCase().includes(query))
  );

  displayResults(filtered);
});

searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") searchButton.click();
});
