const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resultsContainer = document.getElementById("results");

let characters = [];
let statsKeywords = [];

// Load stats.json first
fetch("database/stats.json")
  .then((res) => res.json())
  .then((data) => {
    statsKeywords = data.keywords || [];
  })
  .catch((err) => {
    console.error("Failed to load stats.json:", err);
  });

// Load characters.json
fetch("database/characters.json")
  .then((response) => response.json())
  .then((data) => {
    characters = data.characters || data;
  })
  .catch((err) => {
    console.error("Failed to load characters.json:", err);
    resultsContainer.innerHTML = "<p style='color:red;'>Failed to load character data.</p>";
  });

// Function to highlight stats keywords and underline time durations
function highlightText(text) {
  if (!text) return "";

  // Escape special regex characters in keywords for safety
  const escapedKeywords = statsKeywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));

  // Create regex for keywords (case insensitive, whole words)
  const keywordsRegex = new RegExp(`\\b(${escapedKeywords.join("|")})\\b`, "gi");

  // Replace stats keywords with bold text
  let highlighted = text.replace(keywordsRegex, (match) => `<strong>${match}</strong>`);

  // Regex to underline time durations (e.g. 0.5s, 3s, 10.25s)
  const timeRegex = /(\b\d+(\.\d+)?s\b)/gi;

  // Replace time durations with underline
  highlighted = highlighted.replace(timeRegex, (match) => `<u>${match}</u>`);

  return highlighted;
}

function displayResults(filtered) {
  resultsContainer.innerHTML = "";

  if (filtered.length === 0) {
    resultsContainer.innerHTML = "<p>No characters found.</p>";
    return;
  }

  filtered.forEach((char) => {
    const card = document.createElement("div");
    card.classList.add("character-card");

    // Name
    const nameEl = document.createElement("h3");
    nameEl.textContent = char.name;
    card.appendChild(nameEl);

    // Attribute and Type
    const attrType = document.createElement("div");
    attrType.classList.add("character-attr-type");

    const attrSpan = document.createElement("span");
    attrSpan.textContent = char.attribute;
    attrSpan.classList.add(`attr-${char.attribute}`);
    attrSpan.style.fontWeight = "bold";

    const typeSpan = document.createElement("span");
    typeSpan.textContent = char.type;
    typeSpan.classList.add(`type-${char.type}`);
    typeSpan.style.fontWeight = "bold";
    typeSpan.style.marginLeft = "8px";

    attrType.appendChild(attrSpan);
    attrType.appendChild(document.createTextNode(" | "));
    attrType.appendChild(typeSpan);

    card.appendChild(attrType);

    // Character Details (optional - if you have a description or stats text)
    if (char.details) {
      const detailsEl = document.createElement("p");
      // Highlight stats keywords and underline time durations in details
      detailsEl.innerHTML = highlightText(char.details);
      card.appendChild(detailsEl);
    }

    resultsContainer.appendChild(card);
  });
}

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    resultsContainer.innerHTML = "<p>Please enter a search term.</p>";
    return;
  }
  const filtered = characters.filter((char) =>
    char.name.toLowerCase().includes(query)
  );
  displayResults(filtered);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchButton.click();
  }
});
