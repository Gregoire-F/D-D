document.addEventListener("DOMContentLoaded", () => {
  const searchComponent = document.querySelector("dnd-search");

  searchComponent.render = (spell) => {
    return `
          <div class="monster-card">
            <div class="monster-header">
                <h2>${spell.name}</h2>
                <p><em>${spell.level === 0 ? "Cantrip" : "Niveau " + spell.level} • ${spell.school.name}</em></p>
            </div>
            <div class="monster-stats-top">
                <p><strong>Temps:</strong> ${spell.casting_time}</p>
                <p><strong>Portée:</strong> ${spell.range}</p>
                <p><strong>Durée:</strong> ${spell.duration}</p>
            </div>
            <div class="monster-details">
                 <p><strong>Composants:</strong> ${spell.components.join(", ")}</p>
                 <p><strong>Classes:</strong> ${spell.classes.map(c => c.name).join(", ")}</p>
            </div>
            <div class="monster-actions">
                <h3>Description</h3>
                <p>${spell.desc.join("<br><br>")}</p>
                ${spell.higher_level ? `<h3>À plus haut niveau</h3><p>${spell.higher_level.join("<br>")}</p>` : ""}
            </div>
          </div>
        `;
  };
});