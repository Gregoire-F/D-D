document.addEventListener("DOMContentLoaded", () => {
    const searchComponent = document.querySelector("dnd-search");

    searchComponent.render = (heroData) => {
        const imagePath = `../../images/classes/${heroData.index}.jpg`;
        const placeholder = `https://placehold.co/600x400/8b0000/FFF?text=${heroData.name}`;

        return `
            <div class="monster-card">
                <div class="monster-header">
                    <h2>${heroData.name}</h2>
                    <p><em>Class (Héros) - Hit Die: d${heroData.hit_die}</em></p>
                </div>
                <img src="${imagePath}" alt="${heroData.name}" class="monster-image" onerror="this.onerror=null; this.src='${placeholder}';">
                <div class="monster-stats-top">
                    <p><strong>Hit Die:</strong> 1d${heroData.hit_die} par niveau</p>
                    <p><strong>Saving Throws:</strong> ${heroData.saving_throws.map(s => s.name).join(", ")}</p>
                </div>
                <div class="monster-details">
                    <p><strong>Proficiencies:</strong> ${heroData.proficiencies.map(p => p.name).join(", ")}</p>
                </div>
                <div class="monster-actions">
                    <h3>Starting Equipment</h3>
                    <ul>${heroData.starting_equipment.map(i => `<li>${i.equipment.name}</li>`).join("")}</ul>
                </div>
            </div>
        `;
    };
});