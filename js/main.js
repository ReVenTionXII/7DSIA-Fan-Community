document.addEventListener("DOMContentLoaded", function () {
  fetch("database/characters.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch characters");
      return res.json();
    })
    .then((characters) => {
      setupSearch(characters);
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("results").innerHTML = "<p>Error loading characters.</p>";
    });

  function setupSearch(characters) {
    const input = document.getElementById("searchInput");
    const button = document.getElementById("searchButton");
    const results = document.getElementById("results");

    button.addEventListener("click", () => {
      const query = input.value.trim().toLowerCase();
      results.innerHTML = "";

      if (!query) return;

      const matches = characters.filter((char) =>
        char.name.toLowerCase().includes(query)
      );

      if (matches.length === 0) {
        results.innerHTML = "<p>No characters found.</p>";
        return;
      }

      matches.forEach((char) => {
        const card = document.createElement("div");
        card.className = "character-card";

        const attributeColor = {
          DEX: "🔵 DEX",
          VIT: "🟢 VIT",
          STR: "🔴 STR",
          INT: "🟠 INT",
        };

        const typeEmoji = {
          DPS: "🗡️ DPS",
          VIT: "❤️ VIT",
          Tank: "🛡️ Tank",
          Debuffer: "🌙 Debuffer",
        };

        card.innerHTML = `
          <h2>${char.name}</h2>
          <p><strong>${attributeColor[char.Attribute] || char.Attribute}</strong></p>
          <p><strong>${typeEmoji[char.Type] || char.Type}</strong></p>
        `;
        results.appendChild(card);
      });
    });
  }
});
