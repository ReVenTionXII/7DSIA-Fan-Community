// js/main.js
document.getElementById("searchButton").addEventListener("click", () => {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!query) { alert("Please enter a search term."); return; }

  fetch("database/characters.json")
    .then(r => r.json())
    .then(data => {
      const results = document.getElementById("results");
      results.innerHTML = "";

      /* ── simple text‑match filter ─────────────────────────── */
      const filtered = data.filter(c =>
        c.name.toLowerCase().includes(query) ||
        (c.Affiliation && c.Affiliation.toLowerCase().includes(query)) ||
        (c.Attribute   && c.Attribute  .toLowerCase().includes(query)) ||
        (c.Type        && c.Type       .toLowerCase().includes(query))
      );
      if (!filtered.length) {
        results.innerHTML = `<p>No characters found for “${query}”.</p>`; return;
      }

      /* ── emoji / colour maps ──────────────────────────────── */
      const attrEmoji = { DEX:"🔵", VIT:"🟢", STR:"🔴", INT:"🟠" };
      const typeEmoji = { DPS:"🗡️", Tank:"🛡️", Debuffer:"🌙", Support:"🚑" };
      const glowColor = { DEX:"#3b82f6", VIT:"#22c55e", STR:"#ef4444", INT:"#f97316" };

      /* ── highlighter helpers ──────────────────────────────── */
      const keyWords = [
        "Attack","Attack Speed","Accuracy","Crit Chance","Crit Damage",
        "Movement Speed","Defense","HP","Evasion","Crit Resistance","Crit Defense"
      ];
      function highlight(txt="") {
        txt = txt.replace(/\n/g," ");
        keyWords.forEach(k => {
          txt = txt.replace(new RegExp(`\\b${k}\\b`,"g"), `<span class="keyword">${k}</span>`);
        });
        txt = txt.replace(/(\d+(\.\d+)?%)/g,'<span class="percentage">$1</span>');
        txt = txt.replace(/\b\d+(\.\d+)?s\b/g,'<span class="duration">$&</span>');
        txt = txt.replace(/\b\d+(\.\d+)?m(\s*x\s*\d+(\.\d+)?m)?\b/g,
                          m=>`<span class="area-range">${m}</span>`);
        return txt;
      }

      /* ── boxed skill section helper ───────────────────────── */
      const skillHTML = obj => {
        if (!obj) return "";
        const cat = obj.Category || "";
        const nm  = obj.Name     || "";
        const des = highlight(obj.Description || "");
        return `
          <div class="skill-section">
            <p class="skill-header"><b>${cat}</b> – ${nm}</p>
            <p class="skill-desc">${des}</p>
          </div>`;
      };

      /* ── mentor recommendation box ────────────────────────── */
      const mentorHTML = data => {
        const icon = "🎓";
        let content;
        if (!data) {
          content = "<em>No mentor recommendation.</em>";
        } else if (typeof data === "string") {
          content = data.replace(/\n/g,"<br>");
        } else {
          try       { content = `<pre style="white-space:pre-wrap;">${JSON.stringify(data,null,2)}</pre>`; }
          catch {    content = "<em>Invalid mentor recommendation data.</em>"; }
        }
        return `
          <div class="skill-section mentor-highlight">
            <p class="skill-header" style="font-size:1.15rem;color:#ffd700;">
              ${icon} Mentor Recommendation
            </p>
            <p class="skill-desc">${content}</p>
          </div>`;
      };

      /* ── render each card ─────────────────────────────────── */
      filtered.forEach(char => {
        const imgFile = char.image_path
          ? char.image_path.split(/[/\\]/).pop().replace(/\s/g,"_")
          : "placeholder.png";
        const imgSrc = `assets/characters/${imgFile}`;

        const card = document.createElement("div");
        card.classList.add("character-card");
        card.style.setProperty("--glow-color", glowColor[char.Attribute] || "#5865f2");

        card.innerHTML = `
          <img src="${imgSrc}" alt="${char.name}">
          <h2>${char.name}</h2>

          <div class="attribute-type">
            <p>${attrEmoji[char.Attribute]||""} ${char.Attribute||""}  
               ${typeEmoji[char.Type]||""} ${char.Type||""}</p>
          </div>

          ${skillHTML(char.Normal_Skill)}
          ${skillHTML(char.Special_Skill)}
          ${skillHTML(char.Ultimate_Move)}
          ${mentorHTML(char.Mentor_Recommendations)}
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
