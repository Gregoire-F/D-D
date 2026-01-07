document.addEventListener("DOMContentLoaded", () => {
    const searchComponent = document.querySelector("dnd-search");

    searchComponent.render = (data) => {
        const image = data.image ? `https://www.dnd5eapi.co${data.image}` : "";

        return `
            <div class="monster-card">
                <div class="monster-header">
                    <h2>${data.name}</h2>
                    <p><em>${data.size} ${data.type}, ${data.alignment}</em></p>
                </div>
                ${image ? `<img src="${image}" class="monster-image">` : ""}
                <div class="monster-stats-top">
                    <p><strong>Armor Class:</strong> ${formatAC(data.armor_class)}</p>
                    <p><strong>Hit Points:</strong> ${data.hit_points} (${data.hit_dice})</p>
                    <p><strong>Speed:</strong> ${formatSpeed(data.speed)}</p>
                </div>
                <div class="ability-scores">
                     ${renderStats(data)}
                </div>
                <div class="monster-details">
                    <p><strong>Challenge:</strong> ${data.challenge_rating} (${data.xp} XP)</p>
                </div>
                <div class="monster-actions">
                    <h3>Actions</h3>
                    ${formatList(data.actions)}
                </div>
            </div>
        `;
    };
});

// Helpers
function formatAC(ac) { return ac ? ac.map(a => `${a.value} (${a.type})`).join(", ") : "N/A"; }
function formatSpeed(s) { return s ? Object.entries(s).map(([k, v]) => `${k}: ${v}`).join(", ") : "N/A"; }
function renderStats(d) {
    const stats = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
    return stats.map(s => {
        const mod = Math.floor((d[s] - 10) / 2);
        return `<div class="ability"><strong>${s.slice(0, 3).toUpperCase()}</strong><span>${d[s]} (${mod >= 0 ? "+" + mod : mod})</span></div>`;
    }).join("");
}
function formatList(l) {
    if (!l) return "";
    return `<ul>${l.map(i => `<li><strong>${i.name}:</strong> ${i.desc}</li>`).join("")}</ul>`;
}