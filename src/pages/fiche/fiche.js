document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("fiche-content");

  // Récupération des paramètres
  const params = new URLSearchParams(window.location.search);
  const apiUrl = params.get("url");
  const typeLabel = params.get("type") || "Détail";

  if (!apiUrl) {
    container.innerHTML = "<p>Erreur : Aucun élément sélectionné.</p>";
    return;
  }

  try {
    container.innerHTML = `<p style="text-align:center;">Chargement de ${typeLabel}...</p>`;

    const response = await fetch(`https://www.dnd5eapi.co${apiUrl}`);
    if (!response.ok) throw new Error("Données introuvables");
    const data = await response.json();

    // Affichage selon le type
    if (apiUrl.includes("monsters")) renderMonster(data);
    else if (apiUrl.includes("spells")) renderSpell(data);
    else if (apiUrl.includes("classes")) renderClass(data);
    else if (apiUrl.includes("races")) renderRace(data);
    else if (apiUrl.includes("rules") || apiUrl.includes("rule-sections"))
      renderRule(data, typeLabel);
    else renderGeneric(data, typeLabel);
  } catch (error) {
    console.error(error);
    container.innerHTML = `<div class="monster-card"><h2>Erreur</h2><p>Impossible de charger les données.</p></div>`;
  }

  // --- TEMPLATES ---

  function renderMonster(data) {
    const normalizedIndex = data.index.replace(/-/g, "_");
    const imagePath = `/src/assets/images/${normalizedIndex}.webp`;
    container.innerHTML = `
        <div class="monster-card">
            <div class="monster-header">
                <h1>${data.name}</h1>
                <p><em>${data.size} ${data.type}, ${data.alignment}</em></p>
            </div>
            ${
              image
                ? `<div style="text-align:center;"><img src="${imagePath}" style="max-width:300px; border-radius:8px; margin-bottom:20px;"></div>`
                : ""
            }
            
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; text-align:center; background:#eee; padding:15px; border-radius:8px; margin-bottom:20px;">
                <div><strong>CA</strong><br>${
                  data.armor_class?.[0]?.value || "-"
                }</div>
                <div><strong>PV</strong><br>${data.hit_points}</div>
                <div><strong>Vitesse</strong><br>${formatSpeed(
                  data.speed
                )}</div>
                <div><strong>CR</strong><br>${data.challenge_rating}</div>
            </div>

            <div class="ability-scores" style="display:flex; justify-content:space-between; text-align:center; margin-bottom:20px; border-top:2px solid #8b0000; border-bottom:2px solid #8b0000; padding:10px 0;">
                ${renderStats(data)}
            </div>

            <div class="monster-actions">
                <h3>Actions</h3>
                ${formatList(data.actions)}
                ${
                  data.legendary_actions
                    ? `<h3>Légendaire</h3>${formatList(data.legendary_actions)}`
                    : ""
                }
            </div>
        </div>`;
  }

  function renderSpell(data) {
    container.innerHTML = `
        <div class="monster-card">
            <div class="monster-header">
                <h1>${data.name}</h1>
                <p><em>${
                  data.level === 0 ? "Tour de magie" : "Niveau " + data.level
                } • ${data.school.name}</em></p>
            </div>
            <div style="display:flex; gap:20px; margin-bottom:20px; font-weight:bold; color:#555;">
                <span>⏱ ${data.casting_time}</span>
                <span>📏 ${data.range}</span>
                <span>⏳ ${data.duration}</span>
            </div>
            <div class="monster-content">
                <p>${data.desc.join("<br><br>")}</p>
                ${
                  data.higher_level
                    ? `<div style="margin-top:20px; padding:10px; background:#fff; border-left:3px solid #8b0000;"><strong>À plus haut niveau :</strong><br>${data.higher_level.join(
                        "<br>"
                      )}</div>`
                    : ""
                }
            </div>
        </div>`;
  }

  function renderClass(data) {
    container.innerHTML = `
        <div class="monster-card">
            <div class="monster-header">
                <h1>${data.name}</h1>
                <p><em>Classe</em></p>
            </div>
            <div class="monster-content">
                <p><strong>Dé de vie :</strong> d${data.hit_die}</p>
                <h3>Maîtrises</h3>
                <p><strong>Sauvegardes :</strong> ${data.saving_throws
                  .map((s) => s.name)
                  .join(", ")}</p>
                <p><strong>Compétences :</strong> ${data.proficiencies
                  .map((p) => p.name)
                  .join(", ")}</p>
            </div>
        </div>`;
  }

  function renderRace(data) {
    container.innerHTML = `
        <div class="monster-card">
            <div class="monster-header">
                <h1>${data.name}</h1>
                <p><em>Race - Vitesse : ${data.speed} ft</em></p>
            </div>
            <div style="margin-bottom:20px;">
                <strong>Taille :</strong> ${
                  data.size
                } | <strong>Alignement :</strong> ${
      data.alignment || "Variable"
    }
            </div>
            <div class="monster-content">
                <h3>Traits</h3>
                ${
                  data.traits.length > 0
                    ? `<ul>${data.traits
                        .map((t) => `<li><strong>${t.name}</strong></li>`)
                        .join("")}</ul>`
                    : "Aucun"
                }
                <h3>Description</h3>
                <p>${data.age_desc || ""}</p>
            </div>
        </div>`;
  }

  function renderRule(data, type) {
    let content = data.desc || "";
    content = content
      .replace(/^# (.*$)/gim, "<h3>$1</h3>")
      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>");
    container.innerHTML = `
        <div class="monster-card">
            <div class="monster-header">
                <h1>${data.name}</h1>
                <p><em>${type}</em></p>
            </div>
            <div class="monster-content">${
              content ? `<p>${content}</p>` : ""
            }</div>
            ${
              data.subsections
                ? `<h3>Sous-sections</h3><ul>${data.subsections
                    .map((s) => `<li>${s.name}</li>`)
                    .join("")}</ul>`
                : ""
            }
        </div>`;
  }

  function renderGeneric(data, type) {
    let desc = "";
    if (data.desc)
      desc = Array.isArray(data.desc) ? data.desc.join("<br><br>") : data.desc;
    container.innerHTML = `
        <div class="monster-card">
            <div class="monster-header">
                <h1>${data.name}</h1>
                <p><em>${type}</em></p>
            </div>
            <div class="monster-content">
                ${
                  data.cost
                    ? `<p><strong>Coût:</strong> ${data.cost.quantity} ${data.cost.unit}</p>`
                    : ""
                }
                <hr>
                <p>${desc || "Pas de description."}</p>
            </div>
        </div>`;
  }

  // Helpers
  function formatSpeed(s) {
    return s
      ? Object.entries(s)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : "-";
  }
  function formatList(l) {
    if (!l) return "";
    return `<ul>${l
      .map((i) => `<li><strong>${i.name}:</strong> ${i.desc}</li>`)
      .join("")}</ul>`;
  }
  function renderStats(d) {
    const stats = [
      "strength",
      "dexterity",
      "constitution",
      "intelligence",
      "wisdom",
      "charisma",
    ];
    return stats
      .map((s) => {
        const mod = Math.floor((d[s] - 10) / 2);
        return `<div><small>${s.slice(0, 3).toUpperCase()}</small><br><strong>${
          d[s]
        }</strong><br><small>${mod >= 0 ? "+" + mod : mod}</small></div>`;
      })
      .join("");
  }
});
