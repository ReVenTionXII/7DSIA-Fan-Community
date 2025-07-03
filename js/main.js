document.addEventListener("DOMContentLoaded", () => {
  let characters = [];

  // Fetch character data
  fetch("database/characters.json")
    .then((response) => response.json())
    .then((data) => {
      characters = data;
    })
    .catch((error) => {
      console.error("Error fetching characters:", error);
    });

  // Set up search handler
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");

  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    const result = characters.find((char) => char.name.toLowerCase() === query);
    if (result) {
      displayCharacter(result);
    } else {
      displayNotFound();
    }
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchButton.click();
    }
  });
});

function displayCharacter(character) {
  const container = document.getElementById("character-results");
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "character-card";

  // Name
  const name = document.createElement("h2");
  name.textContent = character.name;

  // Info section
  const info = document.createElement("p");
  info.innerHTML = `
    <strong>Attribute:</strong> ${character.Attribute}<br>
    <strong>Type:</strong> ${character.Type}<br>
    <strong>Affiliation:</strong> ${character.Affiliation || "N/A"}<br>
    <strong>Rank:</strong> ${character.Rank || "N/A"}<br><br>

    <strong>Normal Skill:</strong><br>${highlightStats(character.Normal_Skill || "N/A")}<br><br>
    <strong>Special Skill:</strong><br>${highlightStats(character.Special_Skill || "N/A")}<br><br>
    <strong>Ultimate Move:</strong><br>${highlightStats(character.Ultimate_Move || "N/A")}
  `;

  // Image
  if (character.image_path) {
    const img = document.createElement("img");
    img.src = character.image_path;
    img.alt = character.name;
    img.classList.add("character-image");
    card.appendChild(img);
  }

  card.appendChild(name);
  card.appendChild(info);
  container.appendChild(card);
}

function displayNotFound() {
  const container = document.getElementById("character-results");
  container.innerHTML = "<p>No character found. Try a different name.</p>";
}

function highlightStats(text) {
  if (!text) return "";

  const keywords = [
    "Attack", "Attack Speed", "Accuracy", "Crit Chance", "Crit Damage",
    "Movement Speed", "Defense", "HP", "Evasion", "Crit Resistance", 
    "Crit Defense", "Lv\\.\\s?\\d+"
  ];

  // Highlight keywords
  const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
  text = text.replace(keywordRegex, '<strong>$1</strong>');

  // Highlight percentages
  text = text.replace(/(\d+(\.\d+)?%)/g, "<strong>$1</strong>");

  // Underline durations
  text = text.replace(/(\d+(\.\d+)?s)/g, "<u>$1</u>");

  return text;
}
