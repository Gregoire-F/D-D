document.addEventListener("DOMContentLoaded", () => {
  const searchComponent = document.querySelector("dnd-search");

  searchComponent.render = (item) => {
    const cost = item.cost ? `${item.cost.quantity} ${item.cost.unit}` : "-";
    const weight = item.weight ? `${item.weight} lb` : "-";

    let extraInfo = "";
    if (item.armor_class) extraInfo = `<p><strong>AC:</strong> ${item.armor_class.base}</p>`;
    if (item.damage) extraInfo = `<p><strong>Dégâts:</strong> ${item.damage.damage_dice} ${item.damage.damage_type.name}</p>`;

    return `
            <div class="monster-card">
                <div class="monster-header">
                    <h2>${item.name}</h2>
                    <p><em>${item.equipment_category ? item.equipment_category.name : "Item"}</em></p>
                </div>
                <div class="monster-stats-top">
                    <p><strong>Coût:</strong> ${cost}</p>
                    <p><strong>Poids:</strong> ${weight}</p>
                    ${extraInfo}
                </div>
                <div class="monster-actions">
                    <h3>Description</h3>
                    <ul>
                        ${item.desc && item.desc.length > 0 ? item.desc.map(d => `<li>${d}</li>`).join("") : "<li>Pas de description.</li>"}
                    </ul>
                </div>
            </div>
        `;
  };
});