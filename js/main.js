// js/main.js
document.getElementById("searchButton").addEventListener("click", () => {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!query) {
    alert("Please enter a search term."); return;
  }

  fetch("database/characters.json")
    .then(res => res.json())
    .then(data => {
      const results = document.getElementById("results");
      results.innerHTML = "";

      /* ── simple text‑match filter ───────────────────────────── */
      const filtered = data.filter(c =>
        c.name.toLowerCase().includes(query) ||
        (c.Affiliation  && c.Affiliation .toLowerCase().includes(query)) ||
        (c.Attribute    && c.Attribute   .toLowerCase().includes(query)) ||
        (c.Type         && c.Type        .toLowerCase().includes(query))
      );
      if (!filtered.length) {
        results.innerHTML = `<p>No characters found for “${query}”.</p>`; return;
      }

      /* ── emoji & colour maps ───────────────────────────────── */
      const attrEmoji = { DEX:"🔵", VIT:"🟢", STR:"🔴", INT:"🟠" };
      const typeEmoji = { DPS:"🗡️", Tank:"🛡️", Debuffer:"🌙", Support:"🚑" };
      const glowColor = { DEX:"#3b82f6", VIT:"#22c55e", STR:"#ef4444", INT:"#f97316" };

      /* ── keyword / highlighter helpers ─────────────────────── */
      const keyWords = [
        "Attack","Attack Speed","Accuracy","Crit Chance","Crit Damage",
        "Movement Speed","Defense","HP","Evasion","Crit Resistance","Crit Defense"
      ];
      function highlight(txt="") {
        txt = txt.replace(/\n/g," ");

        keyWords.forEach(k=>{
          txt = txt.replace(new RegExp(`\\b${k}\\b`,"g"),`<span class="keyword">${k}</span>`);
        });
        // % numbers
        txt = txt.replace(/(\d+(\.\d+)?%)/g,'<span class="percentage">$1</span>');
        // time  0.5s / 2s  (avoid 1st etc.)
        txt = txt.replace(/\b\d+(\.\d+)?s\b/g,'<span class="duration">$&</span>');
        // area 6m  or 1.5m x 7m
        txt = txt.replace(/\b\d+(\.\d+)?m(\s*x\s*\d+(\.\d+)?m)?\b/g,
                          m=>`<span class="area-range">${m}</span>`);
        return txt;
      }

      /* ── build one <section> per skill ─────────────────────── */
      const skillHTML = skillObj => {
        if(!skillObj) return "";
        const cat = skillObj.Category   || "";
        const nm  = skillObj.Name       || "";
        const des = highlight(skillObj.Description||"");
        return `
          <div class="skill-section">
            <p class="skill-header"><b>${cat}</b> – ${nm}</p>
            <p class="skill-desc">${des}</p>
          </div>`;
      };

      /* ── render each character card ────────────────────────── */
      filtered.forEach(char => {
        const imgFile = char.image_path
          ? char.image_path.split(/[/\\]/).pop().replace(/\s/g,"_")
          : "placeholder.png";
        const imgSrc  = `assets/characters/${imgFile}`;

        const card = document.createElement("div");
        card.classList.add("character-card");
        card.style.setProperty("--glow-color", glowColor[char.Attribute] || "#5865f2");

        card.innerHTML = `
          <img src="${imgSrc}" alt="${char.name}">
          <h2>${char.name}</h2>
          <div class="attribute-type">
            <p>${attrEmoji[char.Attribute]||""} ${char.Attribute || ""}  
               ${typeEmoji[char.Type]||""} ${char.Type || ""}</p>
          </div>

          ${skillHTML(char.Normal_Skill)}
          ${skillHTML(char.Special_Skill)}
          ${skillHTML(char.Ultimate_Move)}
        `;
        results.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById("results").innerHTML =
        "<p>Failed to load character data.</p>";
    });
});
