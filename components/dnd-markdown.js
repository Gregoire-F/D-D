/**
 * @fileoverview Module utilitaire pour le parsing Markdown vers HTML
 * @author Projet SKOLAE D&D
 * @version 1.0.0
 *
 * Ce module fournit des fonctions pour convertir du texte Markdown
 * en HTML, adapté au contexte D&D (descriptions, tableaux, etc.)
 *
 * @example
 * // Import via balise script
 * <script src="../../components/dnd-markdown.js"></script>
 *
 * // Utilisation
 * const html = DndMarkdown.parse("**Bold** and *italic*");
 * const tableHtml = DndMarkdown.parse("| Col1 | Col2 |\n|---|---|\n| A | B |");
 */

const DndMarkdown = {
  /**
   * Parse du texte Markdown et le convertit en HTML.
   * Supporte: titres, gras, italique, listes, tableaux.
   *
   * @param {string} text - Texte Markdown à parser
   * @returns {string} HTML généré
   *
   * @example
   * DndMarkdown.parse("**Bold** text");
   * // Retourne: "<strong>Bold</strong> text"
   *
   * @example
   * DndMarkdown.parse("##### Titre\n| A | B |\n|---|---|\n| 1 | 2 |");
   * // Retourne: "<h5>Titre</h5><table>...</table>"
   */
  parse(text) {
    if (!text) return "";

    // Traiter les tableaux Markdown en premier
    text = this._parseTables(text);

    return text
      // Titres (##### à #)
      .replace(/^##### (.+)$/gm, "<h5>$1</h5>")
      .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      // Bold + Italic (***text***)
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      // Bold (**text**)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic (*text* ou _text_)
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      // Listes à puces (- item)
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
      // Nettoyer les ul imbriqués
      .replace(/<\/ul>\s*<ul>/g, "");
  },

  /**
   * Parse un tableau de textes Markdown et les joint avec un séparateur.
   * Utile pour les descriptions qui sont des tableaux de paragraphes.
   *
   * @param {string[]} texts - Tableau de textes Markdown
   * @param {string} [separator="<br><br>"] - Séparateur HTML entre les éléments
   * @returns {string} HTML généré
   *
   * @example
   * DndMarkdown.parseArray(["**Para 1**", "*Para 2*"]);
   * // Retourne: "<strong>Para 1</strong><br><br><em>Para 2</em>"
   */
  parseArray(texts, separator = "<br><br>") {
    if (!texts || !Array.isArray(texts)) return "";
    return texts.map((t) => this.parse(t)).join(separator);
  },

  /**
   * Parse les tableaux Markdown et les convertit en HTML.
   * Format attendu: | col1 | col2 | avec ligne séparateur |---|---|
   *
   * @private
   * @param {string} text - Texte contenant potentiellement des tableaux
   * @returns {string} Texte avec tableaux convertis en HTML
   */
  _parseTables(text) {
    const lines = text.split("\n");
    const result = [];
    let inTable = false;
    let tableRows = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Détecte une ligne de tableau (commence et finit par |)
      if (line.startsWith("|") && line.endsWith("|")) {
        // Ignore la ligne de séparation (|---|---|)
        if (/^\|[\s-:|]+\|$/.test(line)) {
          continue;
        }

        if (!inTable) {
          inTable = true;
          tableRows = [];
        }

        // Extraire les cellules
        const cells = line
          .slice(1, -1) // Enlever les | extérieurs
          .split("|")
          .map((cell) => cell.trim());

        tableRows.push(cells);
      } else {
        // Fin du tableau, générer le HTML
        if (inTable && tableRows.length > 0) {
          result.push(this._generateTableHtml(tableRows));
          inTable = false;
          tableRows = [];
        }
        result.push(line);
      }
    }

    // Tableau en fin de texte
    if (inTable && tableRows.length > 0) {
      result.push(this._generateTableHtml(tableRows));
    }

    return result.join("\n");
  },

  /**
   * Génère le HTML d'un tableau à partir des lignes parsées.
   *
   * @private
   * @param {string[][]} rows - Tableau 2D des cellules
   * @returns {string} HTML du tableau
   */
  _generateTableHtml(rows) {
    if (rows.length === 0) return "";

    let html = '<table class="dnd-table">';

    // Première ligne = en-tête
    html += "<thead><tr>";
    rows[0].forEach((cell) => {
      html += `<th>${cell}</th>`;
    });
    html += "</tr></thead>";

    // Lignes suivantes = corps
    if (rows.length > 1) {
      html += "<tbody>";
      for (let i = 1; i < rows.length; i++) {
        html += "<tr>";
        rows[i].forEach((cell) => {
          html += `<td>${cell}</td>`;
        });
        html += "</tr>";
      }
      html += "</tbody>";
    }

    html += "</table>";
    return html;
  },
};

// Export pour utilisation globale
window.DndMarkdown = DndMarkdown;
